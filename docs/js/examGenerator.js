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

function getChapterCounts(masterData) {
  return masterData.reduce((counts, question) => {
    counts[question.chapter] = (counts[question.chapter] || 0) + 1;
    return counts;
  }, {});
}

function allocateChapterQuestionCounts(masterData, chapterWeights, totalCount) {
  const chapterCounts = getChapterCounts(masterData);
  const chapters = Object.keys(chapterCounts).sort();
  const weightedChapters = chapters.map((chapter) => ({
    chapter,
    available: chapterCounts[chapter],
    weight: Math.max(0, Number(chapterWeights?.[chapter]) || 0),
  }));
  const totalWeight = weightedChapters.reduce((sum, item) => sum + item.weight, 0);
  const normalizedChapters = totalWeight > 0
    ? weightedChapters
    : weightedChapters.map((item) => ({ ...item, weight: 1 }));
  const normalizedWeight = normalizedChapters.reduce((sum, item) => sum + item.weight, 0);

  const allocations = normalizedChapters.map((item) => {
    const exact = (item.weight / normalizedWeight) * totalCount;
    const count = Math.min(item.available, Math.floor(exact));
    return {
      ...item,
      exact,
      count,
      remainder: exact - Math.floor(exact),
    };
  });

  let assigned = allocations.reduce((sum, item) => sum + item.count, 0);
  while (assigned < totalCount) {
    const candidate = allocations
      .filter((item) => item.count < item.available)
      .sort((a, b) => b.remainder - a.remainder || b.weight - a.weight)[0];
    if (!candidate) {
      break;
    }
    candidate.count += 1;
    candidate.remainder = 0;
    assigned += 1;
  }

  return allocations.filter((item) => item.count > 0);
}

export function buildMockExam(masterData, options = {}) {
  const totalCount = options.totalCount || 20;
  if (masterData.length < totalCount) {
    throw new Error(`데이터가 부족합니다 (최소 ${totalCount}문제 필요). 현재: ${masterData.length}`);
  }

  const getRandom = (pool, count) => shuffle(pool).slice(0, count);
  const chapterPlan = allocateChapterQuestionCounts(
    masterData,
    options.chapterWeights || {},
    totalCount
  );
  let selectedQuestions = [];

  chapterPlan.forEach((plan) => {
    const pool = masterData.filter((question) => question.chapter === plan.chapter);
    selectedQuestions.push(...getRandom(pool, plan.count));
  });

  if (selectedQuestions.length < totalCount) {
    const remaining = masterData.filter(
      (question) => !selectedQuestions.some((selected) => selected.id === question.id)
    );
    selectedQuestions = selectedQuestions.concat(
      getRandom(remaining, totalCount - selectedQuestions.length)
    );
  }

  return {
    questions: shuffle(selectedQuestions),
    chapterPlan,
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
