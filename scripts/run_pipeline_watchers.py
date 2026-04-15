from __future__ import annotations

import argparse
import datetime
import subprocess
import sys
import threading
import time
from pathlib import Path

# --- 색상 및 터미널 포맷팅 설정 ---
COLOR_RESET = "\033[0m"
COLORS = {
    "runner": "\033[1;36m",    # Bold Cyan
    "pipeline": "\033[1;32m",  # Bold Green
    "git": "\033[1;33m",       # Bold Yellow
    "error": "\033[1;31m",     # Bold Red
    "dim": "\033[2m",          # Dimmed text
}

def get_timestamp() -> str:
    return datetime.datetime.now().strftime("%H:%M:%S")

def log_event(event: str, **payload: object) -> None:
    """러너의 시스템 이벤트를 가독성 높게 출력"""
    timestamp = get_timestamp()
    color = COLORS["runner"]
    
    # payload를 key=value 형태의 읽기 쉬운 문자열로 변환
    payload_str = " ".join(f"{COLORS['dim']}{k}={COLOR_RESET}{v}" for k, v in payload.items())
    
    print(f"{color}[runner {timestamp}]{COLOR_RESET} {event.upper()} | {payload_str}", flush=True)


def stream_output(process: subprocess.Popen[str], label: str) -> None:
    """서브프로세스의 출력을 스트리밍하며 라벨별 색상 적용"""
    assert process.stdout is not None
    color = COLORS.get(label, COLOR_RESET)
    
    for line in process.stdout:
        timestamp = get_timestamp()
        # line 끝에 이미 개행문자가 포함되어 있으므로 그대로 출력
        print(f"{color}[{label} {timestamp}]{COLOR_RESET} {line}", end="", flush=True)


def terminate(processes: list[subprocess.Popen[str]]) -> None:
    log_event("terminate_start", process_count=len(processes))
    for process in processes:
        if process.poll() is None:
            process.terminate()

    deadline = time.time() + 5
    for process in processes:
        while process.poll() is None and time.time() < deadline:
            time.sleep(0.1)
        if process.poll() is None:
            process.kill()
    log_event("terminate_done")


def start_process(label: str, command: list[str], cwd: Path) -> subprocess.Popen[str]:
    log_event("process_start", label=label, command=" ".join(command))
    return subprocess.Popen(
        command,
        cwd=cwd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT, # stderr를 stdout으로 병합하여 스트림 단일화
        text=True,
        bufsize=1,
        start_new_session=True,
    )

# ... [build_pipeline_command, build_git_command, build_parser 함수는 기존과 동일하게 유지] ...
def build_pipeline_command(args: argparse.Namespace) -> list[str]:
    command = [
        sys.executable, "-u", "ai_pipeline/src/watcher.py",
        "--input-dir", args.input_dir,
        "--processed-dir", args.processed_dir,
        "--web-data-dir", args.web_data_dir,
        "--question-set", args.question_set,
        "--interval", str(args.pipeline_interval),
        "--settle-seconds", str(args.pdf_settle_seconds),
    ]
    if args.subjects:
        command.extend(["--subjects", *args.subjects])
    if args.force:
        command.append("--force")
    return command

def build_git_command(args: argparse.Namespace) -> list[str]:
    command = [
        sys.executable, "-u", "scripts/watch_web_data_git.py",
        "--data-path", args.git_data_path,
        "--interval", str(args.git_interval),
        "--settle-seconds", str(args.git_settle_seconds),
        "--message-prefix", args.git_message_prefix,
        "--remote", args.remote,
        "--branch", args.branch,
    ]
    if args.no_push:
        command.append("--no-push")
    return command

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Run the PDF pipeline watcher and docs/data git watcher together.")
    parser.add_argument("--input-dir", default="input")
    parser.add_argument("--processed-dir", default="ai_pipeline/processed")
    parser.add_argument("--web-data-dir", default="docs/data")
    parser.add_argument("--question-set", default="problemset")
    parser.add_argument("--subjects", nargs="*", default=["advanced_ai", "sw_engineering"])
    parser.add_argument("--pipeline-interval", type=float, default=2.0)
    parser.add_argument("--pdf-settle-seconds", type=float, default=300.0)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--git-data-path", default="docs/data")
    parser.add_argument("--git-interval", type=float, default=2.0)
    parser.add_argument("--git-settle-seconds", type=float, default=5.0)
    parser.add_argument("--git-message-prefix", default="Update quiz data")
    parser.add_argument("--remote", default="origin")
    parser.add_argument("--branch", default="main")
    parser.add_argument("--no-push", action="store_true")
    parser.add_argument("--heartbeat-seconds", type=float, default=60.0)
    return parser
# ... [중략 끝] ...


def main() -> int:
    args = build_parser().parse_args()
    root = Path(__file__).resolve().parents[1]
    
    processes = [
        start_process("pipeline", build_pipeline_command(args), root),
        start_process("git", build_git_command(args), root),
    ]
    process_labels = {
        processes[0].pid: "pipeline",
        processes[1].pid: "git",
    }

    threads = [
        threading.Thread(target=stream_output, args=(processes[0], "pipeline"), daemon=True),
        threading.Thread(target=stream_output, args=(processes[1], "git"), daemon=True),
    ]
    for thread in threads:
        thread.start()

    log_event(
        "watchers_started",
        pipeline_pid=processes[0].pid,
        git_pid=processes[1].pid,
        heartbeat_seconds=args.heartbeat_seconds,
    )
    
    last_heartbeat = time.time()
    try:
        while True:
            for process in processes:
                return_code = process.poll()
                if return_code is not None:
                    terminate(processes)
                    label = process_labels.get(process.pid, "unknown")
                    log_event("watcher_exited", label=label, return_code=return_code)
                    return return_code
                    
            if time.time() - last_heartbeat >= args.heartbeat_seconds:
                # 하트비트 페이로드 간소화
                status_list = [f"{process_labels.get(p.pid, 'unknown')}({p.pid}):{'run' if p.poll() is None else 'stop'}" for p in processes]
                log_event("heartbeat", status=", ".join(status_list))
                last_heartbeat = time.time()
                
            time.sleep(0.5)
            
    except KeyboardInterrupt:
        print(f"\n{COLORS['error']}[system] KeyboardInterrupt received. Terminating processes...{COLOR_RESET}", flush=True)
        terminate(processes)
        return 0


if __name__ == "__main__":
    raise SystemExit(main())