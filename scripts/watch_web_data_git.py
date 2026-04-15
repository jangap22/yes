from __future__ import annotations

import argparse
import json
import subprocess
import sys
import time
from datetime import datetime
from pathlib import Path


def log_event(event: str, **payload: object) -> None:
    print(json.dumps({"event": event, **payload}, ensure_ascii=False), flush=True)


def run_git(args: list[str], cwd: Path, *, check: bool = True) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["git", *args],
        cwd=cwd,
        check=check,
        capture_output=True,
        text=True,
    )


def repo_root(cwd: Path) -> Path:
    result = run_git(["rev-parse", "--show-toplevel"], cwd)
    return Path(result.stdout.strip())


def has_git_identity(root: Path) -> bool:
    name = run_git(["config", "--get", "user.name"], root, check=False)
    email = run_git(["config", "--get", "user.email"], root, check=False)
    return name.returncode == 0 and email.returncode == 0


def remote_exists(root: Path, remote: str) -> bool:
    result = run_git(["remote", "get-url", remote], root, check=False)
    return result.returncode == 0


def changed_web_data_files(root: Path, data_path: Path) -> list[str]:
    result = run_git(["status", "--porcelain", "--", str(data_path)], root)
    return [line for line in result.stdout.splitlines() if line.strip()]


def commit_web_data(root: Path, data_path: Path, message: str) -> bool:
    changes = changed_web_data_files(root, data_path)
    if not changes:
        return False

    log_event("git_stage_start", path=str(data_path), changed_count=len(changes), changes=changes)
    run_git(["add", "--", str(data_path)], root)

    staged = run_git(["diff", "--cached", "--quiet", "--", str(data_path)], root, check=False)
    if staged.returncode == 0:
        log_event("git_stage_empty", path=str(data_path))
        return False

    log_event("git_commit_start", path=str(data_path), message=message)
    run_git(["commit", "-m", message, "--", str(data_path)], root)
    log_event("git_commit_done", path=str(data_path), message=message)
    return True


def push_if_possible(root: Path, remote: str, branch: str, *, push: bool) -> None:
    if not push:
        log_event("git_push_skipped", reason="no_push")
        return
    if not remote_exists(root, remote):
        log_event("git_push_skipped", reason="missing_remote", remote=remote)
        return
    log_event("git_push_start", remote=remote, branch=branch)
    run_git(["push", remote, f"HEAD:{branch}"], root)
    log_event("git_push_done", remote=remote, branch=branch)


def current_branch(root: Path) -> str:
    result = run_git(["branch", "--show-current"], root)
    branch = result.stdout.strip()
    return branch or "main"


def build_message(prefix: str) -> str:
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    return f"{prefix}: {timestamp}"


def sync_once(root: Path, data_path: Path, args: argparse.Namespace) -> bool:
    if not data_path.exists():
        raise FileNotFoundError(f"{data_path} does not exist")
    if not has_git_identity(root):
        raise RuntimeError(
            "git user.name and user.email are not configured. "
            "Set them before committing."
        )

    message = args.message or build_message(args.message_prefix)
    committed = commit_web_data(root, data_path, message)
    if not committed:
        log_event("git_no_changes", path=str(data_path))
        return False

    branch = args.branch or current_branch(root)
    push_if_possible(root, args.remote, branch, push=not args.no_push)
    log_event("git_sync_done", path=str(data_path), message=message)
    return True


def latest_mtime(path: Path) -> float:
    latest = path.stat().st_mtime if path.exists() else 0.0
    for child in path.rglob("*"):
        try:
            latest = max(latest, child.stat().st_mtime)
        except FileNotFoundError:
            continue
    return latest


def watch(root: Path, data_path: Path, args: argparse.Namespace) -> None:
    last_seen = latest_mtime(data_path)
    pending_since: float | None = None
    log_event(
        "git_watching",
        path=str(data_path),
        interval=args.interval,
        settle_seconds=args.settle_seconds,
    )

    while True:
        now_mtime = latest_mtime(data_path)
        if now_mtime != last_seen:
            last_seen = now_mtime
            pending_since = time.time()
            changes = changed_web_data_files(root, data_path)
            log_event(
                "git_change_detected",
                path=str(data_path),
                changed_count=len(changes),
                settle_seconds=args.settle_seconds,
            )

        if pending_since and time.time() - pending_since >= args.settle_seconds:
            log_event("git_settled", path=str(data_path))
            sync_once(root, data_path, args)
            pending_since = None
            last_seen = latest_mtime(data_path)

        time.sleep(args.interval)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Watch docs/data and commit only docs/data changes."
    )
    parser.add_argument(
        "--data-path",
        default="docs/data",
        help="Path to stage and commit. Keep this scoped to docs/data.",
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
        default=5.0,
        help="Stable time required before committing changed files.",
    )
    parser.add_argument(
        "--message-prefix",
        default="Update quiz data",
        help="Commit message prefix used when --message is omitted.",
    )
    parser.add_argument(
        "--message",
        help="Exact commit message. If omitted, a timestamped message is used.",
    )
    parser.add_argument(
        "--remote",
        default="origin",
        help="Remote name to push to when configured.",
    )
    parser.add_argument(
        "--branch",
        default="main",
        help="Branch to push. Defaults to main.",
    )
    parser.add_argument(
        "--no-push",
        action="store_true",
        help="Commit locally but do not push.",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        help="Commit current docs/data changes once and exit.",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    root = repo_root(Path.cwd())
    data_path = (root / args.data_path).resolve()

    try:
        data_path.relative_to(root)
    except ValueError as exc:
        raise SystemExit("--data-path must stay inside this repository.") from exc

    relative_data_path = data_path.relative_to(root)
    if relative_data_path.parts[:2] != ("docs", "data"):
        raise SystemExit("--data-path must be docs/data or a child of docs/data.")

    try:
        if args.once:
            sync_once(root, relative_data_path, args)
        else:
            watch(root, relative_data_path, args)
    except KeyboardInterrupt:
        log_event("git_stopped")
    except Exception as exc:
        print(f"[web-data-git] error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
