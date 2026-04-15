AI Lecture Quiz Pipeline
========================

이 프로젝트는 강의 PDF를 과목별로 입력하면 `ai_pipeline`이 강의 내용을 구조화하고 문제 JSON을 생성한 뒤, 웹 앱이 읽는 `docs/data` 문제셋 폴더로 자동 복사하는 파이프라인이다.

Pipeline
--------

1. 사용자는 과목별 입력 폴더에 PPT에서 변환한 PDF 파일을 넣는다.
   - `input/advanced_ai/`
   - `input/sw_engineering/`
2. 시스템은 PDF 파일명을 읽어 `chapter` 값을 추출한다.
   - 예: `01. Statistics.pdf` -> `01. Statistics`
3. `watcher`는 새 PDF 파일을 감지하면 파일 복사가 끝나고 기본 300초 동안 안정 상태가 유지된 뒤 해당 PDF 파일 하나만 처리한다.
4. PDF를 로컬 텍스트 파서로 먼저 분해하지 않고, PDF 파일 자체를 Gemini에 `application/pdf` 입력으로 전달한다.
5. Gemini는 PDF의 텍스트, 이미지, 사진, 다이어그램, 차트, 표, 수식 등을 함께 해석해 전체 강의 markdown 텍스트를 만든다.
6. 생성된 markdown 텍스트를 chunk로 나눈 뒤 Gemini 또는 로컬 fallback으로 `concepts`를 만든다.
7. `document_text`는 `ai_pipeline/processed/raw_text/{subject}/{pdf이름}.txt`에 저장된다.
8. `concepts`는 `ai_pipeline/processed/structured/{subject}/{pdf이름}.json`에 저장된다.
9. 구조화된 `concepts`를 기반으로 문제 50개를 한 번에 생성한다.
   - `OPENAI_API_KEY`가 있으면 OpenAI API를 우선 사용한다.
   - 없으면 `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`로 Gemini를 사용한다.
   - 둘 다 없거나 생성이 실패하면 로컬 fallback 문제 생성을 사용한다.
10. 생성된 문제는 `chapter`, `type`, `q`, `a`, `k`, `explanation` 필드를 반드시 포함해야 한다.
11. `k`는 채점 기준 키워드이며 최대 5개로 제한된다.
12. 문제 생성 후 코드 레벨에서 필수 필드 누락, OX 정답 형식, 객관식 보기 형식 등을 검증하고 잘못된 데이터는 제외한다.
13. 검증된 문제 데이터는 `ai_pipeline/processed/llm_output/{subject}/{pdf이름}.json`에 저장된다.
14. 저장된 문제 JSON은 웹 앱이 읽는 `docs/data/subjects/{subject}/problemset/{pdf이름}.json`으로 자동 복사된다.
15. 동일한 subject 안에서 같은 파일명 PDF의 `llm_output`이 이미 있으면 LLM을 다시 호출하지 않고 `skipped` 처리한다. 이 경우 기존 문제 JSON을 재사용하고 `docs/data`로 다시 복사하며, 실행 결과의 `reused` 필드에 재사용한 경로를 기록한다.
16. Gemini API 한도 초과가 감지되면 문제 생성을 진행하지 않고 `ai_pipeline/processed/alerts/{subject}/{pdf이름}.json`에 alert를 저장한다.
17. Gemini PDF 처리에 실패하면 최소 동작을 위해 로컬 텍스트 추출 기반 fallback을 사용한다.

File Name and Duplicate Policy
------------------------------

PDF 파일명은 이 파이프라인에서 가장 중요한 식별자다. 파일명에서 `.pdf`를 제거한 값이 곧 `chapter`가 되고, 모든 산출물의 파일명으로 사용된다.

```text
input/{subject}/{chapter}.pdf
ai_pipeline/processed/raw_text/{subject}/{chapter}.txt
ai_pipeline/processed/structured/{subject}/{chapter}.json
ai_pipeline/processed/llm_output/{subject}/{chapter}.json
docs/data/subjects/{subject}/problemset/{chapter}.json
```

같은 subject 안에서 같은 파일명 PDF를 다시 넣으면 같은 chapter로 취급한다.

- 기본 정책: 기존 `llm_output`이 있으면 문제를 다시 만들지 않고 `skipped` 처리한다.
- 재사용 처리: 기존 `llm_output` JSON을 `docs/data/subjects/{subject}/problemset/`으로 다시 복사한다.
- 재생성 정책: 같은 이름의 PDF라도 문제를 다시 만들고 싶으면 명시적으로 `--force`를 사용한다.
- 권장 사항: 같은 강의는 항상 같은 파일명을 사용하고, 다른 강의는 파일명이 겹치지 않게 한다.

권장 파일명 예시:

```text
26-1_sw_engineering_01_software_engineering_intro.pdf
26-1_sw_engineering_02_process_models.pdf
26-1_advanced_ai_01_statistics.pdf
```

한글 제목을 사용할 수도 있지만, 공백과 특수문자를 줄이고 `_` 중심으로 통일하면 경로와 정렬을 관리하기 쉽다.

Web Data Structure
------------------

웹 앱은 `docs/data/subjects/{subject}/` 아래의 문제셋 폴더를 자동 탐색한다.

```text
docs/data/subjects/{subject}/
  problemset/
    {chapter}.json
  problemset-test/
    {legacy-or-manual-file}.json
```

- `problemset`: `ai_pipeline`이 자동 생성하고 복사하는 기본 문제셋이다.
- `problemset-test`: 기존 수동 문제 또는 테스트 문제를 보관하는 문제셋이다.
- 웹 퀴즈 화면에서는 문제셋을 선택한 뒤, 선택된 문제셋 안의 챕터별 JSON을 모두 합쳐서 로드한다.
- 웹 데이터는 `fetch()`와 디렉터리 listing을 사용하므로, HTML 파일을 직접 여는 대신 로컬 서버에서 실행해야 한다.

GitHub Pages Sync
-----------------

이 로컬 프로젝트는 GitHub Pages 저장소 `https://github.com/jangap22/yes.git`를 `origin`으로 사용한다.

기본 운영 원칙:

- 자동 watcher는 `docs/data`만 stage, commit, push한다.
- `docs/css`, `docs/js`, `docs/*.html`, `ai_pipeline` 등 나머지 파일은 자동 커밋하지 않는다.
- 웹 화면 코드나 파이프라인 코드는 필요할 때 수동으로 커밋한다.

`docs/data` 변경을 한 번만 커밋/푸시:

```bash
python3 scripts/watch_web_data_git.py --once
```

`docs/data`를 계속 감시하면서 변경될 때마다 커밋/푸시:

```bash
python3 scripts/watch_web_data_git.py
```

remote가 없으면 커밋은 로컬에 남고 push는 건너뛴다. 현재 기본 push 대상은 `origin`의 `main` 브랜치다.

통합 watcher를 사용하면 터미널 하나에서 PDF 처리와 `docs/data` 자동 커밋/푸시를 함께 실행한다.

```bash
python3 scripts/run_pipeline_watchers.py
```

통합 watcher는 내부적으로 아래 두 watcher를 함께 실행한다.

```bash
python3 ai_pipeline/src/watcher.py
python3 scripts/watch_web_data_git.py
```

로그는 `[pipeline]`, `[git]` prefix로 구분된다. `Ctrl+C`를 누르면 두 watcher가 함께 종료된다.

상태 로그는 JSON event 형태로 출력된다.

```text
[runner] {"event": "watchers_started", ...}
[pipeline] {"event": "pdf_detected", ...}
[pipeline] {"event": "pdf_processing_done", ...}
[git] {"event": "git_change_detected", ...}
[git] {"event": "git_commit_done", ...}
```

아무 변경이 없어도 통합 watcher는 기본 60초마다 heartbeat를 출력한다.

```bash
python3 scripts/run_pipeline_watchers.py --heartbeat-seconds 30
```

Run
---

단일 PDF 처리:

```bash
python3 ai_pipeline/src/main.py --subject sw_engineering --pdf "01. Lecture.pdf"
```

입력 폴더 감시:

```bash
python3 ai_pipeline/src/watcher.py
```

웹 앱 실행 예시:

```bash
python3 -m http.server 8000 -d docs
```

브라우저에서 접속:

```text
http://localhost:8000
```

Useful Options
--------------

```bash
python3 ai_pipeline/src/main.py \
  --subject sw_engineering \
  --pdf "01. Lecture.pdf" \
  --input-dir input \
  --processed-dir ai_pipeline/processed \
  --web-data-dir docs/data \
  --question-set problemset
```

- `--subject`: 처리할 과목 ID. 현재 `advanced_ai`, `sw_engineering`을 지원한다.
- `--input-dir`: 과목별 PDF 입력 루트. 기본값은 `input`.
- `--processed-dir`: raw text, structured, llm output, alert 저장 루트. 기본값은 `ai_pipeline/processed`.
- `--web-data-dir`: 웹 앱 데이터 루트. 기본값은 `docs/data`.
- `--question-set`: 웹 데이터 아래에 복사할 문제셋 폴더명. 기본값은 `problemset`.
- `--force`: 캐시된 `llm_output`이 있어도 다시 생성한다. 같은 파일명 PDF의 문제를 의도적으로 새로 만들 때만 사용한다.

Environment
-----------

```bash
export GEMINI_API_KEY="..."
export OPENAI_API_KEY="..."
export GEMINI_MODEL="gemini-2.5-flash"
```

- `OPENAI_API_KEY`가 있으면 문제 생성에 OpenAI API를 우선 사용한다.
- `GEMINI_API_KEY` 또는 `GOOGLE_API_KEY`는 PDF 해석, concept 구조화, Gemini 문제 생성에 사용된다.
- `GEMINI_MODEL` 기본값은 `gemini-2.5-flash`이다.

Question Format
---------------

```json
{
  "chapter": "01. Statistics",
  "type": "ox | multiple | short | essay",
  "q": "문제 내용",
  "a": "정답",
  "k": ["정답에 반드시 포함되어야 하는 핵심 개념1", "핵심 개념2"],
  "explanation": "정답에 대한 설명"
}
```

Validation Rules
----------------

- `type`은 `ox`, `multiple`, `short`, `essay` 중 하나여야 한다.
- `q`, `a`, `explanation`은 비어 있으면 안 된다.
- `ox` 정답은 `O` 또는 `X`로 정규화된다.
- `multiple` 정답은 `1`, `2`, `3`, `4` 중 하나여야 하며, 문제 본문에 4개의 번호 선택지가 있어야 한다.
- `short`, `essay` 문제에 키워드가 없으면 질문과 정답에서 키워드를 추출한다.
- 모든 문제의 `k`는 최대 5개까지만 유지된다.
