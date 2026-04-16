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
  const inputTokens = getTokenSet(input, { useSynonyms: true });
  const inputCompact = normalizeCompact(input);
  const matchedKeywords = keywords.filter((keyword) => {
    const keywordCompact = normalizeCompact(keyword);
    if (keywordCompact && inputCompact.includes(keywordCompact)) {
      return true;
    }

    const keywordTokens = tokenizeText(keyword, { useSynonyms: true });
    if (!keywordTokens.length) {
      return false;
    }

    const matchedCount = keywordTokens.filter((token) => inputTokens.has(token)).length;
    return matchedCount / keywordTokens.length >= 0.7;
  });
  const keywordScoreRatio = keywords.length ? matchedKeywords.length / keywords.length : 0;

  if (!keywords.length) {
    const answerTokens = getTokenSet(question.a, { useSynonyms: true });
    const tokenSimilarityRatio = getJaccardSimilarity(answerTokens, inputTokens);
    return {
      correct: tokenSimilarityRatio >= 0.7,
      scoreRatio: tokenSimilarityRatio,
      matchedKeywords: [],
    };
  }

  return {
    correct: keywordScoreRatio >= 0.7,
    scoreRatio: keywordScoreRatio,
    matchedKeywords,
  };
}

const SYNONYM_GROUPS = [
  ["소프트웨어", "sw", "software"],
  ["공학", "engineering"],
  ["요구사항", "요구", "requirement", "requirements"],
  ["분석", "analysis"],
  ["설계", "design"],
  ["구현", "implementation", "개발"],
  ["테스트", "testing", "검증"],
  ["유지보수", "maintenance"],
  ["품질", "quality"],
  ["결함", "버그", "오류", "에러", "defect", "bug", "error"],
  ["위험", "리스크", "risk"],
  ["비용", "cost"],
  ["일정", "스케줄", "schedule"],
  ["모듈", "module"],
  ["응집도", "응집력", "cohesion"],
  ["결합도", "결합력", "coupling"],
  ["재사용", "재사용성", "reuse", "reusability"],
  ["신뢰성", "reliability"],
  ["보안", "보안성", "security"],
  ["효율", "효율성", "efficiency"],
  ["성능", "performance"],
  ["사용성", "usability"],
  ["이식성", "portability"],
  ["정량", "정량적", "quantitative"],
  ["정성", "정성적", "qualitative"],
  ["프로젝트", "project"],
  ["관리", "management"],
  ["데이터", "data"],
  ["정보", "information"],
  ["확률", "probability"],
  ["분포", "distribution"],
  ["평균", "mean", "average"],
  ["분산", "variance"],
  ["기대값", "expectation"],
  ["엔트로피", "entropy"],
  ["회귀", "regression"],
  ["분류", "classification"],
  ["학습", "learning"],
  ["과적합", "overfitting"],
  ["일반화", "generalization"],
];

const SYNONYM_MAP = new Map(
  SYNONYM_GROUPS.flatMap((group) =>
    group.map((word) => [normalizeText(word), normalizeText(group[0])])
  )
);

const ESSAY_ANSWER_PASS_RATIO = 0.4;
const ESSAY_KEYWORD_PASS_RATIO = 0.7;
const KOREAN_SUFFIXES = [
  "으로부터",
  "로부터",
  "에게서",
  "에서",
  "에게",
  "보다",
  "으로",
  "하며",
  "하면",
  "하고",
  "한다",
  "했다",
  "된다",
  "되는",
  "하여",
  "하게",
  "으로",
  "로",
  "을",
  "를",
  "이",
  "가",
  "은",
  "는",
  "의",
  "에",
  "와",
  "과",
  "도",
  "만",
  "된",
  "한",
];

function canonicalizeToken(token) {
  const normalized = normalizeText(token);
  return SYNONYM_MAP.get(normalized) || normalized;
}

function stripKoreanSuffix(token) {
  for (const suffix of KOREAN_SUFFIXES) {
    if (token.endsWith(suffix) && token.length > suffix.length + 1) {
      return token.slice(0, -suffix.length);
    }
  }
  return token;
}

function expandToken(token, useSynonyms) {
  const normalized = normalizeText(token);
  const stripped = stripKoreanSuffix(normalized);
  const tokens = stripped === normalized ? [normalized] : [normalized, stripped];
  return tokens.map((item) => (useSynonyms ? canonicalizeToken(item) : item));
}

function tokenizeText(value, { useSynonyms = true } = {}) {
  const normalized = normalizeText(value)
    .replace(/[()[\]{}'"`“”‘’.,!?/:;|+=*_~<>\\-]/g, " ")
    .replace(/\s+/g, " ");
  const rawTokens = normalized.match(/[a-z0-9]+|[가-힣]{2,}/g) || [];
  return rawTokens.flatMap((token) => expandToken(token, useSynonyms)).filter((token) => token.length > 1);
}

function getTokenSet(value, options) {
  return new Set(tokenizeText(value, options));
}

function getJaccardSimilarity(leftTokens, rightTokens) {
  if (!leftTokens.size && !rightTokens.size) {
    return 0;
  }
  let intersection = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      intersection += 1;
    }
  });
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union ? intersection / union : 0;
}

function getCharacterOverlapRatio(answer, input) {
  const targetCharBundle = String(answer || "")
    .replace(/[\s.,?/!]/g, "")
    .toLowerCase();
  const inputCharBundle = String(input || "")
    .replace(/[\s.,?/!]/g, "")
    .toLowerCase();
  const targetChars = [...targetCharBundle];
  let matchedCharCount = 0;

  targetChars.forEach((char) => {
    if (inputCharBundle.includes(char)) {
      matchedCharCount += 1;
    }
  });

  return targetChars.length ? matchedCharCount / targetChars.length : 0;
}

function getEssayAnswerSimilarity(answer, input, inputTokens) {
  const answerTokens = getTokenSet(answer);
  const tokenSimilarityRatio = getJaccardSimilarity(answerTokens, inputTokens);
  const structureScoreRatio = getCharacterOverlapRatio(answer, input);

  return {
    answerScoreRatio: tokenSimilarityRatio * 0.7 + structureScoreRatio * 0.3,
    tokenSimilarityRatio,
    structureScoreRatio,
  };
}

function normalizeCompact(value) {
  return normalizeText(value).normalize("NFKC").replace(/\s+/g, "");
}

function getStrictKeywordMatchRatio(keyword, inputTokens, inputCompact) {
  const keywordCompact = normalizeCompact(keyword);
  if (keywordCompact && inputCompact.includes(keywordCompact)) {
    return 1;
  }

  const keywordTokens = tokenizeText(keyword, { useSynonyms: false });
  if (!keywordTokens.length) {
    return 0;
  }

  const matchedCount = keywordTokens.filter((token) => inputTokens.has(token)).length;
  return matchedCount / keywordTokens.length;
}

function gradeEssay(question, userAnswer) {
  const input = normalizeText(userAnswer);
  const keywords = Array.isArray(question.k) ? question.k : [];
  const matchedKeywords = [];
  const exactInputTokens = getTokenSet(input, { useSynonyms: false });
  const semanticInputTokens = getTokenSet(input, { useSynonyms: true });
  const inputCompact = normalizeCompact(input);
  const answerMatch = getEssayAnswerSimilarity(question.a, input, semanticInputTokens);
  let keywordScoreRatio = 0;

  if (answerMatch.answerScoreRatio < ESSAY_ANSWER_PASS_RATIO) {
    keywords.forEach((keyword) => {
      const keywordMatchRatio = getStrictKeywordMatchRatio(keyword, exactInputTokens, inputCompact);
      keywordScoreRatio = Math.max(keywordScoreRatio, keywordMatchRatio);
      if (keywordMatchRatio >= ESSAY_KEYWORD_PASS_RATIO) {
        matchedKeywords.push(keyword);
      }
    });
  }

  const passedByAnswer = answerMatch.answerScoreRatio >= ESSAY_ANSWER_PASS_RATIO;
  const passedByKeyword = matchedKeywords.length > 0;
  const scoreRatio = passedByAnswer
    ? answerMatch.answerScoreRatio
    : Math.max(answerMatch.answerScoreRatio, keywordScoreRatio);

  return {
    correct: passedByAnswer || passedByKeyword,
    scoreRatio,
    matchedKeywords,
    essayBreakdown: {
      passReason: passedByAnswer ? "answer" : passedByKeyword ? "keyword" : "none",
      keywordScoreRatio,
      answerScoreRatio: answerMatch.answerScoreRatio,
      tokenSimilarityRatio: answerMatch.tokenSimilarityRatio,
      structureScoreRatio: answerMatch.structureScoreRatio,
      answerPassRatio: ESSAY_ANSWER_PASS_RATIO,
      keywordPassRatio: ESSAY_KEYWORD_PASS_RATIO,
    },
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
