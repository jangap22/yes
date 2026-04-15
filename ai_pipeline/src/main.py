from __future__ import annotations

import argparse
import json
from pathlib import Path

from pipeline import PipelineConfig, QuizPipeline


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Parse subject PDFs and run file-level LLM processing."
    )
    parser.add_argument(
        "--subject",
        required=True,
        choices=["advanced_ai", "sw_engineering"],
        help="Subject id used under input/{subject}/",
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
        "--force",
        action="store_true",
        help="Rebuild outputs even if the PDF was already processed.",
    )
    parser.add_argument(
        "--pdf",
        help="Optional single PDF filename under input/{subject}/ to process.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    config = PipelineConfig(
        subject=args.subject,
        input_dir=Path(args.input_dir),
        processed_dir=Path(args.processed_dir),
        web_data_dir=Path(args.web_data_dir),
        question_set=args.question_set,
        force=args.force,
    )
    pipeline = QuizPipeline(config)
    result = pipeline.run_file(args.pdf) if args.pdf else pipeline.run()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
