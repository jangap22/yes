from __future__ import annotations

import argparse
import json
import re
import subprocess
from dataclasses import asdict, dataclass
from pathlib import Path


@dataclass
class ParsedPDF:
    chapter: str
    source_pdf: str
    raw_text: str
    cleaned_text: str
    chunks: list[str]


class PDFParser:
    BROKEN_CHARACTER_MAP = {
        "\u00a0": " ",
        "\uf0b7": "-",
        "\ufeff": "",
        "�": "",
    }

    @classmethod
    def parse(
        cls,
        pdf_path: Path,
        *,
        chunk_size: int = 1800,
        chunk_overlap: int = 200,
    ) -> ParsedPDF:
        raw_text = cls.extract_text(pdf_path)
        cleaned_text = cls.clean_text(raw_text)
        chunks = cls.split_text(cleaned_text, chunk_size, chunk_overlap)
        return ParsedPDF(
            chapter=pdf_path.stem,
            source_pdf=pdf_path.name,
            raw_text=raw_text,
            cleaned_text=cleaned_text,
            chunks=chunks,
        )

    @staticmethod
    def extract_text(pdf_path: Path) -> str:
        try:
            from pypdf import PdfReader  # type: ignore

            reader = PdfReader(str(pdf_path))
            pages = [(page.extract_text() or "").strip() for page in reader.pages]
            text = "\n\n".join(page for page in pages if page)
            if text.strip():
                return text
        except Exception:
            pass

        try:
            result = subprocess.run(
                ["pdftotext", "-layout", str(pdf_path), "-"],
                check=True,
                capture_output=True,
                text=True,
            )
            if result.stdout.strip():
                return result.stdout
        except Exception:
            pass

        raise RuntimeError(f"Could not extract text from PDF: {pdf_path}")

    @classmethod
    def clean_text(cls, text: str) -> str:
        normalized = text
        for source, target in cls.BROKEN_CHARACTER_MAP.items():
            normalized = normalized.replace(source, target)

        normalized = normalized.replace("\r\n", "\n").replace("\r", "\n")
        normalized = re.sub(r"[ \t]+", " ", normalized)
        normalized = re.sub(r"\n{3,}", "\n\n", normalized)
        normalized = re.sub(r"(?m)^\s*\d+\s*$", "", normalized)
        normalized = re.sub(r"(?mi)^page\s+\d+\s*$", "", normalized)
        normalized = re.sub(r"(?m)^[^\S\n]*[-_=]{3,}[^\S\n]*$", "", normalized)
        normalized = re.sub(r"[^\S\n]+\n", "\n", normalized)
        return normalized.strip()

    @staticmethod
    def split_text(text: str, chunk_size: int, overlap: int) -> list[str]:
        if not text:
            return []

        paragraphs = [part.strip() for part in text.split("\n\n") if part.strip()]
        chunks: list[str] = []
        buffer = ""

        for paragraph in paragraphs:
            candidate = f"{buffer}\n\n{paragraph}".strip() if buffer else paragraph
            if len(candidate) <= chunk_size:
                buffer = candidate
                continue

            if buffer:
                chunks.append(buffer)
                tail = buffer[-overlap:] if overlap else ""
                buffer = f"{tail}\n\n{paragraph}".strip()
                continue

            start = 0
            step = max(chunk_size - overlap, 1)
            while start < len(paragraph):
                piece = paragraph[start : start + chunk_size].strip()
                if piece:
                    chunks.append(piece)
                start += step
            buffer = ""

        if buffer:
            chunks.append(buffer)
        return chunks


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Extract, clean, and chunk lecture text from a PDF."
    )
    parser.add_argument("pdf_path", help="Path to the source PDF file.")
    parser.add_argument(
        "--chunk-size",
        type=int,
        default=1800,
        help="Maximum characters per chunk after preprocessing.",
    )
    parser.add_argument(
        "--chunk-overlap",
        type=int,
        default=200,
        help="Number of overlapping characters between adjacent chunks.",
    )
    parser.add_argument(
        "--output",
        help="Optional JSON output path. If omitted, result is printed to stdout.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    parsed = PDFParser.parse(
        Path(args.pdf_path),
        chunk_size=args.chunk_size,
        chunk_overlap=args.chunk_overlap,
    )
    payload = asdict(parsed)
    output = json.dumps(payload, ensure_ascii=False, indent=2)

    if args.output:
        Path(args.output).write_text(output, encoding="utf-8")
    else:
        print(output)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
