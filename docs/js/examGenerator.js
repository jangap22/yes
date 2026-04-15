export function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export function withQuestionIds(questions) {
  return questions.map((question, index) => ({
    ...question,
    id: question.id || `q-${index}-${Math.random().toString(36).slice(2, 7)}`,
  }));
}

export function shuffle(array) {
  const clone = [...array];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

export function parseMultipleOptions(questionText) {
  const lines = String(questionText || "").split("\n");
  const options = [];

  for (const line of lines) {
    const match = line.match(/^([a-zA-Z0-9])[\.\)]\s+(.+)$/);
    if (match) {
      options.push({ value: match[1].toUpperCase(), label: match[2] });
    }
  }
  return options;
}

function normalizeChoiceAnswer(value) {
  const normalized = normalizeText(value).replace(/[\s.)]/g, "");
  return normalized.charAt(0).toUpperCase();
}

function gradeObjective(question, userAnswer) {
  const answer = normalizeChoiceAnswer(userAnswer);
  const solution = normalizeChoiceAnswer(question.a);
  const correct = answer === solution;
  return {
    correct,
    scoreRatio: correct ? 1 : 0,
    matchedKeywords: correct ? [String(question.a)] : [],
  };
}

function gradeShort(question, userAnswer) {
  const input = normalizeText(userAnswer);
  const keywords = Array.isArray(question.k) ? question.k : [];
  const matchedKeywords = keywords.filter((keyword) =>
    input.includes(normalizeText(keyword))
  );
  const scoreRatio = keywords.length ? matchedKeywords.length / keywords.length : 0;

  return {
    correct: scoreRatio >= 0.4,
    scoreRatio,
    matchedKeywords,
  };
}

function gradeEssay(question, userAnswer) {
  const input = normalizeText(userAnswer);
  const keywords = Array.isArray(question.k) ? question.k : [];
  const matchedKeywords = [];

  let recognizedCount = 0;
  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    const keywordWords = normalizedKeyword.split(" ").filter(Boolean);
    const matchedWords = keywordWords.filter((word) => input.includes(word));
    if (
      input.includes(normalizedKeyword) ||
      (keywordWords.length > 0 && matchedWords.length / keywordWords.length >= 0.4)
    ) {
      recognizedCount += 1;
      matchedKeywords.push(keyword);
    }
  });

  const keywordScoreRatio = keywords.length ? recognizedCount / keywords.length : 0;
  const targetCharBundle = String(question.a || "")
    .replace(/[\s.,?/!]/g, "")
    .toLowerCase();
  const inputCharBundle = input.replace(/[\s.,?/!]/g, "").toLowerCase();
  const targetChars = [...targetCharBundle];
  let matchedCharCount = 0;

  targetChars.forEach((char) => {
    if (inputCharBundle.includes(char)) {
      matchedCharCount += 1;
    }
  });

  const charMatchRatio = targetChars.length ? matchedCharCount / targetChars.length : 0;
  const scoreRatio = Math.max(keywordScoreRatio, charMatchRatio);

  return {
    correct: keywordScoreRatio >= 0.6 || charMatchRatio >= 0.6,
    scoreRatio,
    matchedKeywords,
  };
}

export function gradeQuestion(question, userAnswer, isExamMode = false) {
  const type = String(question.type || "").toLowerCase();
  let result;

  if (type === "ox" || type === "multiple") {
    result = gradeObjective(question, userAnswer);
  } else if (type === "short") {
    result = gradeShort(question, userAnswer);
  } else {
    result = gradeEssay(question, userAnswer);
  }

  const weights = { ox: 2, multiple: 2, short: 5, essay: 6.5 };
  const maxScore = isExamMode ? weights[type] || 0 : 100;

  return {
    ...result,
    earned: result.scoreRatio * maxScore,
    max: maxScore,
  };
}

export function buildMockExam(masterData) {
  if (masterData.length < 20) {
    throw new Error(`데이터가 부족합니다 (최소 20문제 필요). 현재: ${masterData.length}`);
  }

  const chapters = [...new Set(masterData.map((question) => question.chapter))].sort();
  const firstChapter = chapters[0];
  const getRandom = (pool, count) => shuffle(pool).slice(0, count);

  let selectedQuestions = [
    ...getRandom(
      masterData.filter((question) => question.type === "ox"),
      2
    ),
    ...getRandom(
      masterData.filter((question) => question.type === "multiple"),
      2
    ),
    ...getRandom(
      masterData.filter((question) => question.type === "short"),
      8
    ),
    ...getRandom(
      masterData.filter((question) => question.type === "essay"),
      8
    ),
  ];

  if (selectedQuestions.length < 20) {
    const remaining = masterData.filter(
      (question) => !selectedQuestions.some((selected) => selected.id === question.id)
    );
    selectedQuestions = selectedQuestions.concat(getRandom(remaining, 20 - selectedQuestions.length));
  }

  const firstChapterQuestions = masterData.filter(
    (question) => question.chapter === firstChapter
  );
  if (firstChapterQuestions.length && selectedQuestions.length) {
    const picked = firstChapterQuestions[Math.floor(Math.random() * firstChapterQuestions.length)];
    const replaceIndex = Math.floor(Math.random() * selectedQuestions.length);
    selectedQuestions[replaceIndex] = picked;
  }

  return {
    questions: shuffle(selectedQuestions),
    firstChapter,
  };
}

export function buildExamSummary(examScores) {
  const total = examScores.reduce((sum, score) => sum + (Number(score.earned) || 0), 0);
  const stats = {};

  examScores.forEach((score) => {
    if (!stats[score.chapter]) {
      stats[score.chapter] = { earned: 0, max: 0 };
    }
    stats[score.chapter].earned += Number(score.earned) || 0;
    stats[score.chapter].max += Number(score.max) || 0;
  });

  let weakest = "데이터 없음";
  let worstRate = 1.1;
  const rows = Object.entries(stats).map(([chapter, data]) => {
    const rate = data.max > 0 ? data.earned / data.max : 0;
    if (rate < worstRate) {
      worstRate = rate;
      weakest = chapter;
    }
    return {
      chapter,
      rate,
      displayRate: `${(rate * 100).toFixed(0)}%`,
    };
  });

  return {
    total: Math.round(total),
    weakest,
    rows,
  };
}
