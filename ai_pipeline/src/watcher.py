from __future__ import annotations

import argparse
import json
import time
from pathlib import Path

from pipeline import PipelineConfig, QuizPipeline


SUPPORTED_SUBJECTS = ("advanced_ai", "sw_engineering")


def log_event(event: str, **payload: object) -> None:
    print(json.dumps({"event": event, **payload}, ensure_ascii=False), flush=True)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Watch subject input folders and process new PDF files automatically."
    )
    parser.add_argument(
        "--input-dir",
        default="input",
        help="Root directory containing subject subdirectories with PDF files.",
    )
    parser.add_argument(
        "--processed-dir",
        default="ai_pipeline/processed",
        help="Root directory for parsed text and LLM outputs grouped by subject.",
    )
    parser.add_argument(
        "--web-data-dir",
        default="docs/data",
        help="Root web data directory where generated question files are copied.",
    )
    parser.add_argument(
        "--question-set",
        default="problemset",
        help="Question set folder name under docs/data/subjects/{subject}/.",
    )
    parser.add_argument(
        "--subjects",
        nargs="*",
        choices=SUPPORTED_SUBJECTS,
        default=list(SUPPORTED_SUBJECTS),
        help="Subjects to watch.",
    )
    parser.add_argument(
        "--interval",
        type=float,
        default=2.0,
        help="Polling interval in seconds.",
    )
    parser.add_argument(
        "--settle-seconds",
        type=float,
        default=300.0,
        help="Required stable time before a newly added PDF is processed.",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Rebuild outputs even if the PDF was already processed.",
    )
    return parser


class PDFWatcher:
    def __init__(
        self,
        *,
        input_dir: Path,
        processed_dir: Path,
        web_data_dir: Path,
        question_set: str,
        subjects: list[str],
        interval: float,
        settle_seconds: float,
        force: bool,
    ) -> None:
        self.input_dir = input_dir
        self.processed_dir = processed_dir
        self.web_data_dir = web_data_dir
        self.question_set = question_set
        self.subjects = subjects
        self.interval = interval
        self.settle_seconds = settle_seconds
        self.force = force
        self.pending: dict[tuple[str, str], dict[str, float]] = {}

    def run(self) -> int:
        self._ensure_subject_directories()
        print(
            json.dumps(
                {
                    "status": "watching",
                    "subjects": self.subjects,
                    "input_dir": str(self.input_dir),
                    "processed_dir": str(self.processed_dir),
                    "web_data_dir": str(self.web_data_dir),
                    "question_set": self.question_set,
                    "interval": self.interval,
                    "settle_seconds": self.settle_seconds,
                },
                ensure_ascii=False,
            ),
            flush=True,
        )

        while True:
            now = time.time()
            self._scan(now)
            self._process_ready(now)
            time.sleep(self.interval)

    def _ensure_subject_directories(self) -> None:
        for subject in self.subjects:
            self._pipeline_for(subject).ensure_directories()
            log_event("subject_ready", subject=subject)

    def _scan(self, now: float) -> None:
        for subject in self.subjects:
            subject_dir = self.input_dir / subject
            for pdf_path in sorted(subject_dir.glob("*.pdf")):
                stat = pdf_path.stat()
                key = (subject, pdf_path.name)
                snapshot = self.pending.get(key)

                if not snapshot:
                    self.pending[key] = {
                        "size": float(stat.st_size),
                        "mtime": stat.st_mtime,
                        "stable_since": now,
                    }
                    log_event(
                        "pdf_detected",
                        subject=subject,
                        pdf=pdf_path.name,
                        settle_seconds=self.settle_seconds,
                    )
                    continue

                if snapshot["size"] != float(stat.st_size) or snapshot["mtime"] != stat.st_mtime:
                    snapshot["size"] = float(stat.st_size)
                    snapshot["mtime"] = stat.st_mtime
                    snapshot["stable_since"] = now
                    log_event(
                        "pdf_still_changing",
                        subject=subject,
                        pdf=pdf_path.name,
                        settle_seconds=self.settle_seconds,
                    )

    def _process_ready(self, now: float) -> None:
        ready: list[tuple[str, str]] = []
        for key, snapshot in self.pending.items():
            if now - snapshot["stable_since"] >= self.settle_seconds:
                ready.append(key)

        for subject, pdf_name in ready:
            log_event("pdf_processing_start", subject=subject, pdf=pdf_name)
            try:
                result = self._pipeline_for(subject).run_file(pdf_name)
            except FileNotFoundError:
                log_event("pdf_missing_before_processing", subject=subject, pdf=pdf_name)
                self.pending.pop((subject, pdf_name), None)
                continue
            except Exception as exc:
                log_event("pdf_processing_error", subject=subject, pdf=pdf_name, error=str(exc))
                continue

            if (self.input_dir / subject / pdf_name).exists():
                self.pending.pop((subject, pdf_name), None)

            log_event(
                "pdf_processing_done",
                subject=subject,
                pdf=pdf_name,
                processed_count=len(result.get("processed", [])),
                skipped_count=len(result.get("skipped", [])),
                reused_count=len(result.get("reused", [])),
                alert_count=len(result.get("alerts", [])),
            )
            print(json.dumps(result, ensure_ascii=False), flush=True)

    def _pipeline_for(self, subject: str) -> QuizPipeline:
        return QuizPipeline(
            PipelineConfig(
                subject=subject,
                input_dir=self.input_dir,
                processed_dir=self.processed_dir,
                web_data_dir=self.web_data_dir,
                question_set=self.question_set,
                force=self.force,
            )
        )


def main() -> int:
    args = build_parser().parse_args()
    watcher = PDFWatcher(
        input_dir=Path(args.input_dir),
        processed_dir=Path(args.processed_dir),
        web_data_dir=Path(args.web_data_dir),
        question_set=args.question_set,
        subjects=args.subjects,
        interval=args.interval,
        settle_seconds=args.settle_seconds,
        force=args.force,
    )
    return watcher.run()


if __name__ == "__main__":
    raise SystemExit(main())
