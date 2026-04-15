from __future__ import annotations

import base64
import json
import os
import re
import shutil
import time
import textwrap
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from pdf_parser import PDFParser


ALLOWED_TYPES = {"ox", "multiple", "short", "essay"}
GEMINI_TIMEOUT_SECONDS = 300
GEMINI_MAX_RETRIES = 3
DEFAULT_QUESTION_COUNT = 50


class APILimitExceeded(RuntimeError):
    pass


@dataclass
class PipelineConfig:
    subject: str
    input_dir: Path
    processed_dir: Path
    web_data_dir: Path = Path("docs/data")
    question_set: str = "problemset"
    force: bool = False
    chunk_size: int = 1800
    chunk_overlap: int = 200
    question_count: int = DEFAULT_QUESTION_COUNT


@dataclass
class ProcessedLecture:
    chapter: str
    source_pdf: str
    questions: list[dict[str, Any]]
    raw_text_path: Path
    structured_path: Path
    output_path: Path
    web_data_path: Path | None = None
    cached: bool = False
    alert_path: Path | None = None


class LLMClient:
    def structure_pdf(self, chapter: str, pdf_path: Path) -> tuple[str, list[dict[str, Any]]]:
        google_api_key = self._gemini_api_key()
        gemini_error: Exception | None = None
        if google_api_key:
            try:
                return self._structure_pdf_with_gemini(chapter, pdf_path, google_api_key)
            except Exception as exc:
                gemini_error = exc

        try:
            parsed_pdf = PDFParser.parse(pdf_path)
            return parsed_pdf.cleaned_text, self._structure_locally(chapter, parsed_pdf.chunks)
        except Exception as fallback_error:
            if gemini_error:
                raise RuntimeError(
                    "Gemini PDF processing failed, and local fallback also failed. "
                    f"Gemini error: {gemini_error}. "
                    f"Fallback error: {fallback_error}"
                ) from fallback_error
            raise

    def structure_concepts(self, chapter: str, chunks: list[str]) -> list[dict[str, Any]]:
        google_api_key = self._gemini_api_key()
        if google_api_key:
            try:
                return self._structure_with_gemini(chapter, chunks, google_api_key)
            except Exception:
                pass
        return self._structure_locally(chapter, chunks)

    @staticmethod
    def _gemini_api_key() -> str:
        return os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or ""

    def _structure_pdf_with_gemini(
        self, chapter: str, pdf_path: Path, api_key: str
    ) -> tuple[str, list[dict[str, Any]]]:
        prompt = textwrap.dedent(
            f"""
            You are transcribing a lecture PDF into study-ready markdown text.
            Chapter: {chapter}

            Read the entire PDF using both textual and visual information.
            Include slide images, diagrams, charts, tables, formulas, and screenshots
            when they are educationally important.

            Return only clean markdown text for the whole lecture.
            Do not return JSON.
            """
        ).strip()

        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "inline_data": {
                                "mime_type": "application/pdf",
                                "data": base64.b64encode(pdf_path.read_bytes()).decode(
                                    "ascii"
                                ),
                            }
                        },
                        {"text": prompt},
                    ]
                }
            ]
        }
        model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        request = urllib.request.Request(
            (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={api_key}"
            ),
            data=json.dumps(request_body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        payload = self._open_gemini_request(request)

        document_text = self._extract_response_text(payload).strip()
        chunks = PDFParser.split_text(
            PDFParser.clean_text(document_text),
            chunk_size=1800,
            overlap=200,
        )
        try:
            concepts = self._structure_with_gemini(chapter, chunks, api_key)
        except Exception:
            concepts = self._structure_locally(chapter, chunks)
        return document_text, concepts

    def generate_questions(
        self,
        chapter: str,
        concepts: list[dict[str, Any]],
        question_count: int,
    ) -> list[dict[str, Any]]:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            try:
                return self._generate_with_openai(
                    chapter, concepts, question_count, openai_api_key
                )
            except Exception:
                pass
        google_api_key = self._gemini_api_key()
        if google_api_key:
            try:
                return self._generate_questions_with_gemini(
                    chapter, concepts, question_count, google_api_key
                )
            except APILimitExceeded:
                raise
            except Exception:
                pass
        return self._generate_locally(chapter, concepts, question_count)

    def _generate_questions_with_gemini(
        self,
        chapter: str,
        concepts: list[dict[str, Any]],
        question_count: int,
        api_key: str,
    ) -> list[dict[str, Any]]:
        prompt = textwrap.dedent(
            f"""
            Create study quiz questions for the chapter "{chapter}".
            Use the provided structured lecture concepts.

            Return a strict JSON array only.
            Every item must include these fields:
            - chapter: exactly "{chapter}"
            - type: one of ox, multiple, short, essay
            - q: question text
            - a: answer
            - k: array of grading keywords, at most 5 items
            - explanation: answer explanation

            Create exactly {question_count} questions total in a single response.
            Balance the question types across ox, multiple, short, and essay.
            For multiple choice questions, include four numbered options inside q
            and set a to "1", "2", "3", or "4".
            For ox questions, set a to "O" or "X".
            For short and essay questions, k must contain concepts required for grading.
            Essay answers must be concise, short-answer style, and preferably one short sentence.
            Do not wrap the JSON in markdown fences.
            """
        ).strip()

        request_body = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "text": json.dumps(
                                concepts,
                                ensure_ascii=False,
                            )
                        },
                    ]
                }
            ],
            "generationConfig": {"response_mime_type": "application/json"},
        }
        model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        request = urllib.request.Request(
            (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={api_key}"
            ),
            data=json.dumps(request_body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        payload = self._open_gemini_request(request)
        return self._parse_json_array(self._extract_response_text(payload))

    def _structure_with_gemini(
        self, chapter: str, chunks: list[str], api_key: str
    ) -> list[dict[str, Any]]:
        prompt = textwrap.dedent(
            f"""
            You are structuring lecture content into study concepts.
            Chapter: {chapter}

            Return strict JSON array.
            Each item must contain:
            - title: short concept title
            - summary: 1-2 sentence summary
            - keywords: array of critical keywords
            - evidence: short source excerpt summary
            """
        ).strip()

        request_body = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": (
                                prompt
                                + "\n\nLecture chunks:\n"
                                + "\n\n".join(
                                    f"[Chunk {idx + 1}]\n{chunk}"
                                    for idx, chunk in enumerate(chunks)
                                )
                            )
                        }
                    ]
                }
            ],
            "generationConfig": {"response_mime_type": "application/json"},
        }
        model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        request = urllib.request.Request(
            (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{model}:generateContent?key={api_key}"
            ),
            data=json.dumps(request_body).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        payload = self._open_gemini_request(request)
        text = self._extract_response_text(payload)
        return self._parse_json_array(text)

    def _generate_with_openai(
        self,
        chapter: str,
        concepts: list[dict[str, Any]],
        question_count: int,
        api_key: str,
    ) -> list[dict[str, Any]]:
        prompt = textwrap.dedent(
            f"""
            Create study questions for the chapter "{chapter}".
            Return strict JSON array.
            Every item must include chapter, type, q, a, k, explanation.
            Allowed types: ox, multiple, short, essay.
            Create exactly {question_count} questions total in a single response.
            Balance the question types across ox, multiple, short, and essay.
            For short and essay, k must contain core grading keywords required in the answer.
            k must contain at most 5 keywords.
            Essay answers must be concise, short-answer style, and preferably one short sentence.
            """
        ).strip()

        request_body = {
            "model": "gpt-4o-mini",
            "input": [
                {
                    "role": "system",
                    "content": [{"type": "input_text", "text": prompt}],
                },
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "input_text",
                            "text": json.dumps(concepts, ensure_ascii=False),
                        }
                    ],
                },
            ],
        }
        request = urllib.request.Request(
            "https://api.openai.com/v1/responses",
            data=json.dumps(request_body).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )
        with urllib.request.urlopen(request, timeout=60) as response:
            payload = json.loads(response.read().decode("utf-8"))

        output_text = ""
        for item in payload.get("output", []):
            for content in item.get("content", []):
                if content.get("type") == "output_text":
                    output_text += content.get("text", "")
        return self._parse_json_array(output_text)

    def _structure_locally(self, chapter: str, chunks: list[str]) -> list[dict[str, Any]]:
        concepts: list[dict[str, Any]] = []
        for index, chunk in enumerate(chunks, start=1):
            sentences = self._sentences(chunk)
            summary = " ".join(sentences[:2]).strip()
            title = self._concept_title(sentences, chapter, index)
            keywords = self._keywords(" ".join(sentences[:3]))
            concepts.append(
                {
                    "title": title,
                    "summary": summary or chunk[:200],
                    "keywords": keywords,
                    "evidence": chunk[:400],
                }
            )
        return concepts

    def _generate_locally(
        self,
        chapter: str,
        concepts: list[dict[str, Any]],
        question_count: int,
    ) -> list[dict[str, Any]]:
        if not concepts:
            return []

        questions: list[dict[str, Any]] = []
        seed_count = max(1, min(len(concepts), question_count // 4 or 1))
        for index, concept in enumerate(concepts[:seed_count]):
            summary = concept["summary"]
            title = concept["title"]
            keywords = (concept["keywords"] or [title])[:5]

            questions.append(
                {
                    "chapter": chapter,
                    "type": "ox",
                    "q": f"다음 진술은 옳은가요?\n\n{summary}",
                    "a": "O",
                    "k": keywords[:2],
                    "explanation": f"{title} 개념 설명에 직접 등장하는 내용이므로 참입니다.",
                }
            )
            questions.append(
                {
                    "chapter": chapter,
                    "type": "short",
                    "q": f"{title}의 핵심 개념을 1~2문장으로 설명하세요.",
                    "a": summary,
                    "k": keywords[: min(3, len(keywords))],
                    "explanation": f"{title}을 설명할 때 핵심 키워드와 개념 관계를 포함해야 합니다.",
                }
            )

        multiple_seed = concepts[:seed_count]
        for index, concept in enumerate(multiple_seed):
            distractors = [
                candidate["title"]
                for candidate in concepts
                if candidate["title"] != concept["title"]
            ][:3]
            while len(distractors) < 3:
                distractors.append(f"{concept['title']}와 무관한 선택지 {len(distractors) + 1}")
            options = [concept["title"], *distractors[:3]]
            ordered = options[:]
            if index % 2 == 1:
                ordered = [options[1], options[0], options[2], options[3]]
            answer_index = ordered.index(concept["title"]) + 1
            option_lines = "\n".join(
                f"{idx}. {option}" for idx, option in enumerate(ordered, start=1)
            )
            questions.append(
                {
                    "chapter": chapter,
                    "type": "multiple",
                    "q": (
                        f"다음 설명과 가장 관련 깊은 개념을 고르세요.\n\n"
                        f"{concept['summary']}\n\n{option_lines}"
                    ),
                    "a": str(answer_index),
                    "k": concept["keywords"][:5],
                    "explanation": f"정답은 {concept['title']}이며, 요약 설명과 가장 직접적으로 연결됩니다.",
                }
            )

        for concept in concepts[:seed_count]:
            questions.append(
                {
                    "chapter": chapter,
                    "type": "essay",
                    "q": (
                        f"{concept['title']}의 의미와 중요성을 설명하고, "
                        "관련 핵심 개념을 함께 서술하세요."
                    ),
                    "a": concept["summary"],
                    "k": concept["keywords"][:5],
                    "explanation": (
                        "핵심 개념 간의 관계를 설명하고 주요 키워드를 포함하면 정답으로 볼 수 있습니다."
                    ),
                }
            )

        return questions[:question_count]

    @staticmethod
    def _parse_json_array(raw_text: str) -> list[dict[str, Any]]:
        match = re.search(r"\[\s*{.*}\s*]", raw_text, re.DOTALL)
        candidate = match.group(0) if match else raw_text
        try:
            parsed = json.loads(candidate)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []

    @staticmethod
    def _parse_json_object(raw_text: str) -> dict[str, Any]:
        fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", raw_text, re.DOTALL)
        candidate = fenced.group(1) if fenced else raw_text
        if not fenced:
            start = raw_text.find("{")
            end = raw_text.rfind("}")
            candidate = raw_text[start : end + 1] if start != -1 and end != -1 else raw_text
        try:
            parsed = json.loads(candidate)
            return parsed if isinstance(parsed, dict) else {}
        except json.JSONDecodeError:
            return {}

    @staticmethod
    def _extract_response_text(payload: dict[str, Any]) -> str:
        output = ""
        for candidate in payload.get("candidates", []):
            content = candidate.get("content", {})
            for part in content.get("parts", []):
                output += part.get("text", "")
        return output

    @staticmethod
    def _open_gemini_request(request: urllib.request.Request) -> dict[str, Any]:
        last_error: Exception | None = None
        for attempt in range(1, GEMINI_MAX_RETRIES + 1):
            try:
                with urllib.request.urlopen(
                    request,
                    timeout=GEMINI_TIMEOUT_SECONDS,
                ) as response:
                    return json.loads(response.read().decode("utf-8"))
            except urllib.error.HTTPError as exc:
                last_error = exc
                if exc.code == 429:
                    raise APILimitExceeded(
                        "Gemini API quota exceeded. Skipping generation to avoid extra calls."
                    ) from exc
                if exc.code not in {500, 502, 503, 504}:
                    raise
            except urllib.error.URLError as exc:
                last_error = exc

            if attempt < GEMINI_MAX_RETRIES:
                time.sleep(2**attempt)

        if last_error:
            raise last_error
        raise RuntimeError("Gemini request failed without an error response.")

    @staticmethod
    def _sentences(text: str) -> list[str]:
        parts = re.split(r"(?<=[.!?다요])\s+|\n+", text)
        return [part.strip() for part in parts if len(part.strip()) > 20]

    @staticmethod
    def _concept_title(sentences: list[str], chapter: str, index: int) -> str:
        if sentences:
            words = re.findall(r"[A-Za-z][A-Za-z0-9-]{3,}|[가-힣]{2,}", sentences[0])
            if words:
                return " ".join(words[:4])
        return f"{chapter} Concept {index}"

    @staticmethod
    def _keywords(text: str) -> list[str]:
        words = re.findall(r"[A-Za-z][A-Za-z0-9-]{3,}|[가-힣]{2,}", text)
        counts: dict[str, int] = {}
        for word in words:
            lowered = word.lower()
            if lowered in {"this", "that", "with", "from", "have", "were", "what"}:
                continue
            counts[word] = counts.get(word, 0) + 1
        ranked = sorted(counts.items(), key=lambda item: (-item[1], -len(item[0]), item[0]))
        return [word for word, _ in ranked[:5]]


class QuestionValidator:
    @staticmethod
    def validate(question: dict[str, Any], chapter: str) -> dict[str, Any] | None:
        sanitized = {
            "chapter": chapter,
            "type": str(question.get("type", "")).strip().lower(),
            "q": str(question.get("q", "")).strip(),
            "a": str(question.get("a", "")).strip(),
            "k": question.get("k", []),
            "explanation": str(question.get("explanation", "")).strip(),
        }

        if sanitized["type"] not in ALLOWED_TYPES:
            return None
        if not sanitized["q"] or not sanitized["a"] or not sanitized["explanation"]:
            return None

        keywords = sanitized["k"]
        if not isinstance(keywords, list):
            keywords = [str(keywords)]
        keywords = [str(keyword).strip() for keyword in keywords if str(keyword).strip()]

        if sanitized["type"] in {"short", "essay"} and not keywords:
            keywords = LLMClient._keywords(f"{sanitized['q']} {sanitized['a']}")[:3]

        if sanitized["type"] == "ox":
            normalized = sanitized["a"].upper()
            if normalized in {"TRUE", "T", "O"}:
                sanitized["a"] = "O"
            elif normalized in {"FALSE", "F", "X"}:
                sanitized["a"] = "X"
            else:
                return None

        if sanitized["type"] == "multiple":
            if sanitized["a"] not in {"1", "2", "3", "4"}:
                return None
            options = re.findall(r"(?m)^\d\.\s+.+$", sanitized["q"])
            if len(options) < 4:
                return None

        sanitized["k"] = keywords[:5]
        return sanitized


class QuizPipeline:
    SUPPORTED_SUBJECTS = ("advanced_ai", "sw_engineering")

    def __init__(self, config: PipelineConfig) -> None:
        self.config = config
        self.llm = LLMClient()

    def ensure_directories(self) -> None:
        self._ensure_directories()

    def run(self) -> dict[str, Any]:
        self.ensure_directories()
        pdf_paths = sorted(self._input_subject_dir().glob("*.pdf"))
        processed: list[ProcessedLecture] = []
        skipped: list[str] = []
        reused: list[dict[str, str]] = []
        alerts: list[dict[str, str]] = []

        for pdf_path in pdf_paths:
            if self._is_cached(pdf_path) and not self.config.force:
                reused.append(self._reuse_cached_output(pdf_path))
                skipped.append(pdf_path.name)
                continue
            try:
                processed.append(self._process_pdf(pdf_path))
            except APILimitExceeded as exc:
                alerts.append(self._write_alert(pdf_path, exc))

        return {
            "subject": self.config.subject,
            "input_dir": str(self._input_subject_dir()),
            "processed": [self._serialize_processed(item) for item in processed],
            "skipped": skipped,
            "reused": reused,
            "alerts": alerts,
        }

    def run_file(self, pdf_name: str) -> dict[str, Any]:
        self.ensure_directories()
        pdf_path = self._input_subject_dir() / pdf_name
        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")
        if pdf_path.suffix.lower() != ".pdf":
            raise ValueError(f"Only PDF files are supported: {pdf_path.name}")

        if self._is_cached(pdf_path) and not self.config.force:
            reused = self._reuse_cached_output(pdf_path)
            return {
                "subject": self.config.subject,
                "input_dir": str(self._input_subject_dir()),
                "processed": [],
                "skipped": [pdf_path.name],
                "reused": [reused],
            }

        try:
            processed = self._process_pdf(pdf_path)
        except APILimitExceeded as exc:
            return {
                "subject": self.config.subject,
                "input_dir": str(self._input_subject_dir()),
                "processed": [],
                "skipped": [],
                "reused": [],
                "alerts": [self._write_alert(pdf_path, exc)],
            }
        return {
            "subject": self.config.subject,
            "input_dir": str(self._input_subject_dir()),
            "processed": [self._serialize_processed(processed)],
            "skipped": [],
            "reused": [],
            "alerts": [],
        }

    def _process_pdf(self, pdf_path: Path) -> ProcessedLecture:
        chapter = pdf_path.stem
        document_text, concepts = self.llm.structure_pdf(chapter, pdf_path)
        questions = self.llm.generate_questions(
            chapter, concepts, self.config.question_count
        )
        validated = self._validate_questions(questions, chapter)

        raw_text_path = self._processed_subject_dir("raw_text") / f"{pdf_path.stem}.txt"
        structured_path = self._processed_subject_dir("structured") / f"{pdf_path.stem}.json"
        output_path = self._processed_subject_dir("llm_output") / f"{pdf_path.stem}.json"

        raw_text_path.write_text(document_text, encoding="utf-8")
        structured_path.write_text(
            json.dumps(
                {
                    "chapter": chapter,
                    "source_pdf": pdf_path.name,
                    "document_text_path": str(raw_text_path),
                    "concepts": concepts,
                },
                ensure_ascii=False,
                indent=2,
            ),
            encoding="utf-8",
        )
        output_path.write_text(
            json.dumps(validated, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        web_data_path = self._publish_question_file(output_path)
        return ProcessedLecture(
            chapter=chapter,
            source_pdf=pdf_path.name,
            questions=validated,
            raw_text_path=raw_text_path,
            structured_path=structured_path,
            output_path=output_path,
            web_data_path=web_data_path,
        )

    def _validate_questions(
        self, questions: list[dict[str, Any]], chapter: str
    ) -> list[dict[str, Any]]:
        validated: list[dict[str, Any]] = []
        seen = set()
        for question in questions:
            item = QuestionValidator.validate(question, chapter)
            if not item:
                continue
            key = (item["type"], item["q"])
            if key in seen:
                continue
            seen.add(key)
            validated.append(item)
        return validated

    @staticmethod
    def _serialize_processed(item: ProcessedLecture) -> dict[str, Any]:
        return {
            "chapter": item.chapter,
            "source_pdf": item.source_pdf,
            "raw_text_path": str(item.raw_text_path),
            "structured_path": str(item.structured_path),
            "output_path": str(item.output_path),
            "web_data_path": str(item.web_data_path) if item.web_data_path else None,
            "cached": item.cached,
            "question_count": len(item.questions),
        }

    def _ensure_directories(self) -> None:
        self.config.input_dir.mkdir(parents=True, exist_ok=True)
        self.config.processed_dir.mkdir(parents=True, exist_ok=True)

        for subject in self.SUPPORTED_SUBJECTS:
            (self.config.input_dir / subject).mkdir(parents=True, exist_ok=True)
            (
                self.config.web_data_dir
                / "subjects"
                / subject
                / self.config.question_set
            ).mkdir(parents=True, exist_ok=True)
            for group in ("raw_text", "structured", "llm_output"):
                (self.config.processed_dir / group / subject).mkdir(
                    parents=True,
                    exist_ok=True,
                )
            (self.config.processed_dir / "alerts" / subject).mkdir(
                parents=True,
                exist_ok=True,
            )

    def _input_subject_dir(self) -> Path:
        return self.config.input_dir / self.config.subject

    def _processed_subject_dir(self, category: str) -> Path:
        return self.config.processed_dir / category / self.config.subject

    def _is_cached(self, pdf_path: Path) -> bool:
        return self._llm_output_path(pdf_path).exists()

    def _llm_output_path(self, pdf_path: Path) -> Path:
        return self._processed_subject_dir("llm_output") / f"{pdf_path.stem}.json"

    def _alert_path(self, pdf_path: Path) -> Path:
        return self._processed_subject_dir("alerts") / f"{pdf_path.stem}.json"

    def _write_alert(self, pdf_path: Path, error: APILimitExceeded) -> dict[str, str]:
        alert_path = self._alert_path(pdf_path)
        payload = {
            "status": "api_limit_exceeded",
            "subject": self.config.subject,
            "source_pdf": pdf_path.name,
            "message": str(error),
        }
        alert_path.write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        return {**payload, "alert_path": str(alert_path)}

    def _web_question_set_dir(self) -> Path:
        return (
            self.config.web_data_dir
            / "subjects"
            / self.config.subject
            / self.config.question_set
        )

    def _reuse_cached_output(self, pdf_path: Path) -> dict[str, str]:
        output_path = self._llm_output_path(pdf_path)
        web_data_path = self._publish_question_file(output_path)
        return {
            "source_pdf": pdf_path.name,
            "output_path": str(output_path),
            "web_data_path": str(web_data_path),
        }

    def _publish_question_file(self, source_path: Path) -> Path:
        destination = self._web_question_set_dir() / source_path.name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source_path, destination)
        return destination
