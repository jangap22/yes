import { QUESTION_SET_LABELS, fetchIndex, fetchLectures, getSubject } from "./dataLoader.js";
import {
  buildExamSummary,
  buildMockExam,
  gradeQuestion,
  parseMultipleOptions,
  shuffle,
  withQuestionIds,
} from "./examGenerator.js";

const state = {
  masterData: [],
  filteredData: [],
  wrongQuestions: [],
  currentIndex: 0,
  isAnswered: false,
  isExamMode: false,
  examScores: [],
  selectedChoice: "",
  subject: null,
  lectures: [],
  chapterWeights: {},
  examMode: "default",
  isExamSetupOpen: false,
};

const ui = {
  title: document.getElementById("subject-title"),
  subtitle: document.getElementById("subject-subtitle"),
  questionSet: document.getElementById("question-set-select"),
  chapter: document.getElementById("chapter-select"),
  type: document.getElementById("type-select"),
  reviewBtn: document.getElementById("review-btn"),
  wrongCountText: document.getElementById("wrong-count"),
  examBtn: document.getElementById("exam-btn"),
  resetBtn: document.getElementById("reset-btn"),
  ratioPanel: document.getElementById("exam-ratio-panel"),
  examMode: document.getElementById("exam-mode-select"),
  ratioList: document.getElementById("chapter-ratio-list"),
  ratioSummary: document.getElementById("ratio-summary"),
  examCount: document.getElementById("exam-count-input"),
  filterSection: document.getElementById("filter-section"),
  badge: document.getElementById("type-badge"),
  currentIdx: document.getElementById("current-idx"),
  totalCount: document.getElementById("total-count"),
  question: document.getElementById("question-area"),
  inputCont: document.getElementById("input-container"),
  answer: document.getElementById("user-answer"),
  optCont: document.getElementById("options-container"),
  feedback: document.getElementById("feedback-area"),
  resultText: document.getElementById("result-text"),
  answerDetail: document.getElementById("answer-detail"),
  submitBtn: document.getElementById("submit-btn"),
  nextBtn: document.getElementById("next-btn"),
  quitBtn: document.getElementById("quit-btn"),
};

const EXAM_TYPE_PRESETS = {
  default: {
    label: "기본 모드",
    counts: { ox: 3, multiple: 6, short: 6, essay: 5 },
  },
  essay: {
    label: "서술형 모드",
    counts: { essay: 15, short: 5 },
  },
  short: {
    label: "단답 모드",
    counts: { ox: 10, short: 10 },
  },
};

const EXAM_TYPE_ORDER = ["ox", "multiple", "short", "essay"];
const EXAM_TYPE_LABELS = {
  ox: "O/X",
  multiple: "객관식",
  short: "단답형",
  essay: "서술형",
};

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMath(elements) {
  if (!window.MathJax?.typesetPromise) {
    return;
  }

  window.MathJax.typesetPromise(elements).catch(() => {});
}

function getSubjectParam() {
  const params = new URLSearchParams(window.location.search);
  return params.get("subject");
}

function setQuestionCount() {
  ui.totalCount.textContent = String(state.filteredData.length);
}

function updateReviewUI() {
  ui.wrongCountText.textContent = String(state.wrongQuestions.length);
  ui.reviewBtn.style.display = state.wrongQuestions.length > 0 ? "inline-block" : "none";
}

function renderSubjectMeta(subject) {
  ui.title.textContent = `${subject.name} 암기 마스터`;
  ui.subtitle.textContent = `${subject.id} 과목의 문제셋을 선택하고 필터링해서 연습하거나 모의고사를 시작할 수 있습니다.`;
}

function getAvailableQuestionSets(lectures) {
  return [...new Set(lectures.map((lecture) => lecture.questionSet || "legacy"))];
}

function getDefaultQuestionSet(lectures) {
  const sets = getAvailableQuestionSets(lectures);
  if (sets.includes("problemset")) {
    return "problemset";
  }
  return sets[0] || "legacy";
}

function populateQuestionSets(lectures) {
  const sets = getAvailableQuestionSets(lectures);
  ui.questionSet.innerHTML = "";
  sets.forEach((questionSet) => {
    const option = document.createElement("option");
    option.value = questionSet;
    option.textContent = QUESTION_SET_LABELS[questionSet] || questionSet;
    ui.questionSet.appendChild(option);
  });
  ui.questionSet.value = getDefaultQuestionSet(lectures);
}

function populateChapters(questions) {
  const chapters = [...new Set(questions.map((question) => question.chapter))].sort();
  ui.chapter.innerHTML = '<option value="all">전체 단원</option>';
  chapters.forEach((chapter) => {
    const option = document.createElement("option");
    option.value = chapter;
    option.textContent = chapter;
    ui.chapter.appendChild(option);
  });
}

function getChapters() {
  return [...new Set(state.masterData.map((question) => question.chapter))].sort();
}

function getChapterAvailability() {
  return state.masterData.reduce((counts, question) => {
    counts[question.chapter] = (counts[question.chapter] || 0) + 1;
    return counts;
  }, {});
}

function getSelectedTypePreset() {
  return EXAM_TYPE_PRESETS[state.examMode]?.counts || EXAM_TYPE_PRESETS.default.counts;
}

function getSelectedTypePresetLabel() {
  return EXAM_TYPE_PRESETS[state.examMode]?.label || EXAM_TYPE_PRESETS.default.label;
}

function getPresetTotalCount() {
  return Object.values(getSelectedTypePreset()).reduce((sum, count) => sum + count, 0);
}

function getNormalizedChapterRatios() {
  const chapters = getChapters();
  const selectedChapters = chapters.filter((chapter) => state.chapterWeights[chapter] > 0);
  const totalWeight = selectedChapters.reduce((sum, chapter) => sum + Number(state.chapterWeights[chapter] || 0), 0);
  const examCount = getPresetTotalCount();

  return chapters.map((chapter) => {
    const weight = Number(state.chapterWeights[chapter] || 0);
    const ratio = totalWeight > 0 ? weight / totalWeight : 0;
    return {
      chapter,
      weight,
      ratio,
      expectedCount: Math.round(ratio * examCount),
    };
  });
}

function syncChapterRatioUI() {
  getChapters().forEach((chapter) => {
    const selected = Number(state.chapterWeights[chapter] || 0) > 0;
    const toggle = document.querySelector(`[data-ratio-toggle="${CSS.escape(chapter)}"]`);
    const body = document.querySelector(`[data-ratio-body="${CSS.escape(chapter)}"]`);
    const slider = document.querySelector(`[data-ratio-slider="${CSS.escape(chapter)}"]`);
    if (toggle) {
      toggle.classList.toggle("is-active", selected);
      toggle.setAttribute("aria-pressed", String(selected));
      toggle.textContent = selected ? "켜짐" : "꺼짐";
    }
    if (body) {
      body.hidden = !selected;
    }
    if (slider) {
      slider.value = String(Math.round(Number(state.chapterWeights[chapter] || 0)));
    }
  });
}

function updateRatioLabels() {
  const rows = getNormalizedChapterRatios();
  rows.forEach((row) => {
    const valueNode = document.querySelector(`[data-ratio-value="${CSS.escape(row.chapter)}"]`);
    if (valueNode) {
      valueNode.textContent = row.weight > 0
        ? `${Math.round(row.ratio * 100)}% · 약 ${row.expectedCount}문항`
        : "제외";
    }
  });

  const activeRows = rows.filter((row) => row.weight > 0);
  ui.ratioSummary.textContent = activeRows.length
    ? `${getPresetTotalCount()}문항 · ${activeRows.length}개 챕터 균등 출제 · ${getSelectedTypePresetLabel()}`
    : "최소 1개 챕터를 선택해야 합니다.";
}

function rebalanceSelectedChapters() {
  const chapters = getChapters();
  const selected = chapters.filter((chapter) => Number(state.chapterWeights[chapter] || 0) > 0);
  const equalWeight = selected.length ? 100 / selected.length : 0;

  chapters.forEach((chapter) => {
    state.chapterWeights[chapter] = selected.includes(chapter) ? equalWeight : 0;
  });

  syncChapterRatioUI();
  updateRatioLabels();
}

function applyExamModePreset(mode) {
  state.examMode = mode;
  ui.examMode.value = mode;
  ui.examCount.value = String(getPresetTotalCount());
  updateRatioLabels();
}

function renderChapterRatioSliders() {
  const chapters = getChapters();
  const availability = getChapterAvailability();
  state.chapterWeights = {};
  ui.ratioList.innerHTML = "";

  if (!chapters.length) {
    ui.ratioPanel.hidden = true;
    return;
  }

  ui.ratioPanel.hidden = true;
  state.isExamSetupOpen = false;
  ui.examBtn.textContent = "📝 모의고사 시작";
  ui.examCount.max = String(state.masterData.length);
  ui.examCount.readOnly = true;
  ui.examCount.value = String(getPresetTotalCount());
  ui.examMode.value = state.examMode;
  chapters.forEach((chapter) => {
    state.chapterWeights[chapter] = 0;
    const row = document.createElement("div");
    row.className = "chapter-ratio-row";
    row.innerHTML = `
      <button type="button" class="chapter-ratio-toggle" data-ratio-toggle="${chapter}" aria-pressed="false">OFF</button>
      <div class="chapter-ratio-body" data-ratio-body="${chapter}" hidden>
        <div class="chapter-ratio-title-row">
          <span class="chapter-ratio-title">${chapter}</span>
          <span class="chapter-ratio-count">${availability[chapter]}문제 보유</span>
        </div>
        <input class="chapter-ratio-slider" type="range" min="0" max="100" step="1" value="0" data-ratio-slider="${chapter}" />
        <div class="chapter-ratio-meta">
          <span data-ratio-value="${chapter}">제외</span>
          <span>토글 후 슬라이더 표시</span>
        </div>
      </div>
    `;
    const toggle = row.querySelector(`[data-ratio-toggle="${CSS.escape(chapter)}"]`);
    const slider = row.querySelector(`[data-ratio-slider="${CSS.escape(chapter)}"]`);
    toggle.addEventListener("click", () => {
      const active = Number(state.chapterWeights[chapter] || 0) > 0;
      state.chapterWeights[chapter] = active ? 0 : 100;
      if (Object.values(state.chapterWeights).some((weight) => Number(weight) > 0)) {
        rebalanceSelectedChapters();
      } else {
        syncChapterRatioUI();
        updateRatioLabels();
      }
    });
    slider.addEventListener("input", () => {
      state.chapterWeights[chapter] = Number(slider.value);
      syncChapterRatioUI();
      updateRatioLabels();
    });
    ui.ratioList.appendChild(row);
  });

  syncChapterRatioUI();
  updateRatioLabels();
}

function getCurrentQuestion() {
  return state.filteredData[state.currentIndex];
}

function buildOptionMarkup(question) {
  if (question.type === "ox") {
    return [
      { value: "O", label: "O" },
      { value: "X", label: "X" },
    ];
  }

  const parsed = parseMultipleOptions(question.q);
  if (parsed.length) {
    return parsed;
  }

  return [
    { value: "A", label: "A" },
    { value: "B", label: "B" },
    { value: "C", label: "C" },
    { value: "D", label: "D" },
  ];
}

function getQuestionStem(question) {
  if (question.type !== "multiple") {
    return question.q;
  }
  return String(question.q || "")
    .split("\n")
    .filter((line) => !/^[a-zA-Z0-9][\.\)]\s+.+$/.test(line))
    .join("\n")
    .trim();
}

function resetAnswerUi() {
  state.isAnswered = false;
  state.selectedChoice = "";
  ui.feedback.style.display = "none";
  ui.feedback.className = "";
  ui.resultText.innerHTML = "";
  ui.answerDetail.innerHTML = "";
  ui.nextBtn.style.display = "none";
}

function renderChoiceButtons(question) {
  const options = buildOptionMarkup(question);
  ui.optCont.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "opt-btn";
    button.textContent = `${option.value}. ${option.label}`.trim();
    button.addEventListener("click", () => submitAnswer(option.value));
    ui.optCont.appendChild(button);
  });
  renderMath([ui.optCont]);
}

function showQuestion() {
  const question = getCurrentQuestion();
  if (!question) {
    return;
  }

  resetAnswerUi();
  ui.question.textContent = getQuestionStem(question);
  renderMath([ui.question]);
  ui.badge.textContent = question.type.toUpperCase();
  ui.badge.style.background =
    { ox: "#e67e22", short: "#2ecc71", multiple: "#9b59b6", essay: "#34495e" }[
      question.type
    ] || "#95a5a6";
  ui.currentIdx.textContent = String(state.currentIndex + 1);
  ui.submitBtn.style.display = "inline-flex";

  if (question.type === "ox" || question.type === "multiple") {
    ui.inputCont.style.display = "none";
    ui.submitBtn.style.display = "none";
    ui.optCont.style.display = "flex";
    renderChoiceButtons(question);
  } else {
    ui.optCont.style.display = "none";
    ui.inputCont.style.display = "block";
    ui.answer.value = "";
    ui.answer.disabled = false;
    ui.answer.focus();
  }
}

function applyFilter() {
  if (state.isExamMode) {
    return;
  }

  const chapterValue = ui.chapter.value;
  const typeValue = ui.type.value;
  state.filteredData = state.masterData.filter(
    (question) =>
      (chapterValue === "all" || question.chapter === chapterValue) &&
      (typeValue === "all" || question.type === typeValue)
  );
  resetStudy();
}

async function loadSelectedQuestionSet() {
  const selectedSet = ui.questionSet.value;
  const lectures = state.lectures.filter(
    (lecture) => (lecture.questionSet || "legacy") === selectedSet
  );

  if (!lectures.length) {
    throw new Error(`${selectedSet}에 연결된 JSON 문제가 없습니다.`);
  }

  ui.question.textContent = "문제 데이터 로드 중...";
  const rawQuestions = await fetchLectures(state.subject.id, lectures);

  state.masterData = withQuestionIds(rawQuestions);
  state.filteredData = [...state.masterData];
  state.wrongQuestions = [];
  state.examScores = [];
  state.currentIndex = 0;
  state.isExamMode = false;

  populateChapters(state.masterData);
  renderChapterRatioSliders();
  updateReviewUI();
  setQuestionCount();
  resetStudy();
}

function resetStudy() {
  state.isExamMode = false;
  state.filteredData = shuffle(state.filteredData);
  state.currentIndex = 0;
  ui.filterSection.style.display = "flex";
  ui.quitBtn.style.display = "none";
  ui.badge.style.display = "inline-flex";
  setQuestionCount();

  if (!state.filteredData.length) {
    ui.question.textContent = "조건에 맞는 문제가 없습니다.";
    ui.inputCont.style.display = "none";
    ui.optCont.style.display = "none";
    ui.submitBtn.style.display = "none";
    ui.nextBtn.style.display = "none";
    ui.feedback.style.display = "none";
    ui.currentIdx.textContent = "0";
    return;
  }

  showQuestion();
}

function startReview() {
  if (!state.wrongQuestions.length) {
    return;
  }
  state.isExamMode = false;
  state.filteredData = [...state.wrongQuestions];
  state.wrongQuestions = [];
  updateReviewUI();
  resetStudy();
}

function startMockExam() {
  try {
    if (!state.isExamSetupOpen) {
      state.isExamSetupOpen = true;
      ui.ratioPanel.hidden = false;
      applyExamModePreset(ui.examMode.value || "default");
      ui.examBtn.textContent = "설정한 비율로 시작";
      syncChapterRatioUI();
      updateRatioLabels();
      return;
    }

    const selectedChapters = getChapters().filter(
      (chapter) => Number(state.chapterWeights[chapter] || 0) > 0
    );
    if (!selectedChapters.length) {
      window.alert("최소 1개 챕터를 선택하세요.");
      return;
    }

    const examData = state.masterData.filter((question) =>
      selectedChapters.includes(question.chapter)
    );
    const examCount = getPresetTotalCount();
    const chapterWeights = Object.fromEntries(
      selectedChapters.map((chapter) => [chapter, Number(state.chapterWeights[chapter] || 0)])
    );
    const typeWeights = getSelectedTypePreset();

    const exam = buildMockExam(examData, {
      chapterWeights,
      typeWeights,
      totalCount: examCount,
    });
    state.isExamMode = true;
    state.examScores = [];
    state.filteredData = exam.questions;
    state.currentIndex = 0;
    state.isExamSetupOpen = false;
    ui.filterSection.style.display = "none";
    ui.ratioPanel.hidden = true;
    ui.quitBtn.style.display = "inline-flex";
    setQuestionCount();
    ui.currentIdx.textContent = "1";
    showQuestion();
    const planText = exam.chapterPlan
      .map((plan) => `${plan.key}: ${plan.count}문항`)
      .join("\n");
    const typeText = EXAM_TYPE_ORDER
      .map((type) => `${EXAM_TYPE_LABELS[type] || type}: ${Number(exam.typePlan?.[type] || 0)}문항`)
      .filter((line) => !line.endsWith("0문항"))
      .join(", ");
    window.alert(`[모의고사 세션 시작]
- 챕터 비율 기반 출제
${planText}
- 유형 비율: ${typeText}
- 총 ${examCount}문항`);
  } catch (error) {
    window.alert(error.message);
  }
}

function finishExam() {
  const summary = buildExamSummary(state.examScores);
  ui.question.innerHTML = `
    <div class="score-banner">
      <h2>Score: ${summary.total}/100</h2>
      <div class="weak-box">
        <strong>취약점:</strong>
        <span class="weakest">${summary.weakest}</span>
      </div>
      <div class="stats-table">
        ${summary.rows
          .map(
            (row) => `
              <div class="stats-row">
                <span>${row.chapter}</span>
                <span class="${row.rate < 0.6 ? "danger" : "safe"}">${row.displayRate}</span>
              </div>
            `
          )
          .join("")}
      </div>
      <button type="button" class="main-btn btn-return" id="return-btn">연습 모드로 돌아가기</button>
    </div>
  `;

  ui.optCont.style.display = "none";
  ui.inputCont.style.display = "none";
  ui.submitBtn.style.display = "none";
  ui.nextBtn.style.display = "none";
  ui.quitBtn.style.display = "none";
  ui.badge.style.display = "none";
  ui.feedback.style.display = "none";

  document.getElementById("return-btn").addEventListener("click", () => {
    window.location.reload();
  });
}

// 채점 로직과 결과 표시를 담당하는 함수
function submitAnswer(choiceValue = null) {
  if (state.isAnswered) {
    return;
  }

  const question = getCurrentQuestion();
  const userAnswer = choiceValue || ui.answer.value || "";
  if (!String(userAnswer).trim() && question.type !== "ox") {
    return;
  }

  const result = gradeQuestion(question, userAnswer, state.isExamMode);
  state.isAnswered = true;

  if (state.isExamMode) {
    state.examScores.push({
      chapter: question.chapter,
      earned: result.earned,
      max: result.max,
    });
  }

  if (!result.correct && !state.wrongQuestions.some((saved) => saved.id === question.id)) {
    state.wrongQuestions.push(question);
  }

  updateReviewUI();
  ui.answer.disabled = true;
  ui.feedback.style.display = "grid";
  ui.feedback.className = result.correct ? "correct" : "wrong";
  ui.resultText.innerHTML = `
    <strong>${result.correct ? "✅ 정답/통과" : "❌ 오답/복습필요"}</strong>
    (달성률: ${(result.scoreRatio * 100).toFixed(0)}% | 획득: ${result.earned.toFixed(1)}점)
  `;

  const explanationHtml = question.explanation
    ? `<br><br><strong>[해설]</strong><br>${escapeHtml(question.explanation)}`
    : "";
  let detailHtml = `<strong>[정답]</strong><br>${escapeHtml(question.a)}${explanationHtml}<br><br><strong>[핵심 키워드 체크]</strong><br>`;
  if (Array.isArray(question.k)) {
    question.k.forEach((keyword) => {
      const matched = result.matchedKeywords.includes(keyword);
      detailHtml += `<span class="keyword-tag ${matched ? "matched" : "missed"}">${escapeHtml(keyword)}</span>`;
    });
  }

  // 단답형과 서술형 문제에 대해서는 채점 요소별 세부 점수와 기준을 표시
  if (question.type === "short" && result.shortBreakdown) {
    const { mode, keywordScoreRatio, compactSimilarityRatio, tokenSimilarityRatio, passRatio } =
      result.shortBreakdown;
    detailHtml += `
      <div class="essay-breakdown">
        <strong>[단답형 채점 방식]</strong>
        ${
          mode === "answer-compact"
            ? `<span>정답-답안 compact 유사도 ${(compactSimilarityRatio * 100).toFixed(0)}% / ${(passRatio * 100).toFixed(0)}% 이상 통과</span>`
            : mode === "answer-token"
              ? `<span>정답-답안 토큰 유사도 ${(tokenSimilarityRatio * 100).toFixed(0)}% / ${(passRatio * 100).toFixed(0)}% 이상 통과</span>`
              : mode === "keyword"
            ? `<span>키워드 일치율 ${(keywordScoreRatio * 100).toFixed(0)}% / ${(passRatio * 100).toFixed(0)}% 이상 통과</span>`
            : `<span>정답-답안 비교 ${(passRatio * 100).toFixed(0)}% 기준</span>`
        }
      </div>
    `;
  }

  if (question.type === "essay" && result.essayBreakdown) {
    const {
      keywordScoreRatio,
      tokenSimilarityRatio,
      structureScoreRatio,
      weights,
      passScoreRatio,
    } =
      result.essayBreakdown;
    detailHtml += `
      <div class="essay-breakdown">
        <strong>[서술형 채점 요소]</strong>
        <span>키워드 유사도 ${(keywordScoreRatio * 100).toFixed(0)}% × ${weights.keyword}</span>
        <span>토큰 유사도 ${(tokenSimilarityRatio * 100).toFixed(0)}% × ${weights.token}</span>
        <span>글자 단순 유사도 ${(structureScoreRatio * 100).toFixed(0)}% × ${weights.structure}</span>
        <span>총점 ${(passScoreRatio * 100).toFixed(0)}% 이상 정답 처리</span>
      </div>
    `;
  }
  ui.answerDetail.innerHTML = detailHtml;
  renderMath([ui.answerDetail]);

  ui.submitBtn.style.display = "none";
  ui.nextBtn.style.display = "inline-flex";
  ui.nextBtn.focus();
}

function nextQuestion() {
  state.currentIndex += 1;
  if (state.currentIndex < state.filteredData.length) {
    showQuestion();
    return;
  }

  if (state.isExamMode) {
    finishExam();
    return;
  }

  const message = state.wrongQuestions.length
    ? `학습 완료! 틀린 문제 ${state.wrongQuestions.length}개가 저장되었습니다.`
    : "축하합니다! 모든 문제를 맞히셨습니다.";
  window.alert(message);
}

function quitExam() {
  if (!window.confirm("진행 중인 모의고사를 포기하고 연습 모드로 돌아갈까요?")) {
    return;
  }
  window.location.reload();
}

function bindEvents() {
  ui.questionSet.addEventListener("change", () => {
    loadSelectedQuestionSet().catch((error) => {
      ui.question.textContent = error.message || "문제셋을 불러오지 못했습니다.";
    });
  });
  ui.chapter.addEventListener("change", applyFilter);
  ui.type.addEventListener("change", applyFilter);
  ui.resetBtn.addEventListener("click", resetStudy);
  ui.examMode.addEventListener("change", () => {
    applyExamModePreset(ui.examMode.value);
  });
  ui.reviewBtn.addEventListener("click", startReview);
  ui.examBtn.addEventListener("click", startMockExam);
  ui.submitBtn.addEventListener("click", () => submitAnswer());
  ui.nextBtn.addEventListener("click", nextQuestion);
  ui.quitBtn.addEventListener("click", quitExam);

  window.addEventListener("keydown", (event) => {
    if (event.key === " " && document.activeElement === ui.answer && !state.isAnswered) {
      return;
    }

    if ((event.key === "Enter" || event.key === " ") && !event.shiftKey) {
      if (!state.isAnswered && ui.inputCont.style.display === "block") {
        if (event.key === "Enter") {
          event.preventDefault();
          submitAnswer();
        }
      } else if (state.isAnswered) {
        event.preventDefault();
        nextQuestion();
      }
    }
  });
}

async function init() {
  const subjectId = getSubjectParam();
  if (!subjectId) {
    throw new Error("subject 파라미터가 필요합니다.");
  }

  const index = await fetchIndex();
  const subject = getSubject(index, subjectId) || { id: subjectId, name: subjectId };
  const lectures = subject.lectures || [{ file: `${subjectId}.json`, questionSet: "legacy" }];
  if (!lectures.length) {
    throw new Error(`${subjectId}에 연결된 문제셋이 없습니다.`);
  }

  state.subject = subject;
  state.lectures = lectures;

  renderSubjectMeta(subject);
  populateQuestionSets(lectures);
  bindEvents();
  await loadSelectedQuestionSet();
}

init().catch((error) => {
  ui.question.textContent = error.message || "퀴즈 데이터를 불러오지 못했습니다.";
  ui.inputCont.style.display = "none";
  ui.optCont.style.display = "none";
  ui.submitBtn.style.display = "none";
  ui.nextBtn.style.display = "none";
});

window.addEventListener("load", () => {
  renderMath([ui.question, ui.optCont, ui.answerDetail]);
});
