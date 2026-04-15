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
}

function showQuestion() {
  const question = getCurrentQuestion();
  if (!question) {
    return;
  }

  resetAnswerUi();
  ui.question.textContent = getQuestionStem(question);
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
    const exam = buildMockExam(state.masterData);
    state.isExamMode = true;
    state.examScores = [];
    state.filteredData = exam.questions;
    state.currentIndex = 0;
    ui.filterSection.style.display = "none";
    ui.quitBtn.style.display = "inline-flex";
    setQuestionCount();
    ui.currentIdx.textContent = "1";
    showQuestion();
    window.alert(`[모의고사 세션 시작]
- 유형: OX(2), 객관식(2), 단답(8), 서술(8)
- 단원: ${exam.firstChapter}(1문항 포함)
- 총 20문항`);
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
  ui.feedback.style.display = "block";
  ui.feedback.className = result.correct ? "correct" : "wrong";
  ui.resultText.innerHTML = `
    <strong>${result.correct ? "✅ 정답/통과" : "❌ 오답/복습필요"}</strong>
    (달성률: ${(result.scoreRatio * 100).toFixed(0)}% | 획득: ${result.earned.toFixed(1)}점)
  `;

  let detailHtml = `<strong>[정답/해설]</strong><br>${question.a}<br><br><strong>[핵심 키워드 체크]</strong><br>`;
  if (Array.isArray(question.k)) {
    question.k.forEach((keyword) => {
      const matched = result.matchedKeywords.includes(keyword);
      detailHtml += `<span class="keyword-tag ${matched ? "matched" : "missed"}">${keyword}</span>`;
    });
  }
  ui.answerDetail.innerHTML = detailHtml;

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
