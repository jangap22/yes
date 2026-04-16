function toAbsoluteUrl(path) {
  return new URL(path, window.location.href).toString();
}

function normalizeHref(href, baseUrl) {
  return new URL(href, baseUrl).pathname;
}

function formatLabel(value) {
  return String(value || "")
    .replace(/\.(js|json)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function lastPathSegment(pathname) {
  return decodeURIComponent(pathname.split("/").filter(Boolean).at(-1) || "");
}

function isChildOfSubjects(pathname) {
  return pathname.includes("/data/subjects/");
}

const PRIMARY_QUESTION_SET = "problemset";
const TEST_QUESTION_SET = "problemset-test";
export const QUESTION_SET_LABELS = {
  [PRIMARY_QUESTION_SET]: "기본 문제셋",
  [TEST_QUESTION_SET]: "직접 제작 문제셋",
  legacy: "기존 문제셋",
};

async function fetchDirectoryDocument(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} 경로를 읽지 못했습니다.`);
  }
  const html = await response.text();
  return new DOMParser().parseFromString(html, "text/html");
}

function collectDirectoryLinks(documentNode, baseUrl) {
  return [...documentNode.querySelectorAll("a[href]")]
    .map((anchor) => anchor.getAttribute("href"))
    .filter(Boolean)
    .map((href) => normalizeHref(href, baseUrl))
    .filter((pathname) => !pathname.endsWith("/../") && !pathname.endsWith("/./"))
    .filter((pathname) => !pathname.includes(".DS_Store"));
}

async function discoverSubjectDirectories() {
  const basePath = "./data/subjects/";
  const documentNode = await fetchDirectoryDocument(basePath);
  const baseUrl = toAbsoluteUrl(basePath);

  return collectDirectoryLinks(documentNode, baseUrl)
    .filter((pathname) => isChildOfSubjects(pathname))
    .filter((pathname) => pathname !== new URL(baseUrl).pathname)
    .filter((pathname) => pathname.endsWith("/"))
    .map((pathname) => lastPathSegment(pathname))
    .filter(Boolean);
}

async function discoverLectureFiles(subjectId) {
  const basePath = `./data/subjects/${subjectId}/`;
  const documentNode = await fetchDirectoryDocument(basePath);
  const baseUrl = toAbsoluteUrl(basePath);

  const subjectLinks = collectDirectoryLinks(documentNode, baseUrl)
    .filter((pathname) => isChildOfSubjects(pathname))
    .filter((pathname) => pathname.includes(`/data/subjects/${subjectId}/`));

  const directFiles = subjectLinks
    .filter((pathname) => pathname.endsWith(".json"))
    .map((pathname) => ({
      file: lastPathSegment(pathname),
      questionSet: "legacy",
    }))
    .filter(Boolean);

  const questionSetDirs = subjectLinks
    .filter((pathname) => pathname.endsWith("/"))
    .map((pathname) => lastPathSegment(pathname))
    .filter(Boolean);

  const groupedFiles = [];
  for (const questionSet of questionSetDirs) {
    const setPath = `./data/subjects/${subjectId}/${questionSet}/`;
    const setDocument = await fetchDirectoryDocument(setPath);
    const setUrl = toAbsoluteUrl(setPath);
    const files = collectDirectoryLinks(setDocument, setUrl)
      .filter((pathname) => pathname.endsWith(".json"))
      .map((pathname) => lastPathSegment(pathname))
      .filter(Boolean)
      .map((fileName) => ({
        file: `${questionSet}/${fileName}`,
        questionSet,
      }));
    groupedFiles.push(...files);
  }

  return [...groupedFiles, ...directFiles].map((lecture) => ({
    ...lecture,
    chapter: formatLabel(lecture.file.split("/").pop()),
  }));
}

async function fetchIndexManifest() {
  const response = await fetch("./data/index.json");
  if (!response.ok) {
    return { subjects: [] };
  }
  return response.json();
}

function loadScriptOnce(scriptPath) {
  return new Promise((resolve, reject) => {
    const absoluteSrc = toAbsoluteUrl(scriptPath);
    const existing = document.querySelector(`script[data-quiz-src="${absoluteSrc}"]`);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = scriptPath;
    script.async = true;
    script.dataset.quizSrc = absoluteSrc;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`${scriptPath} 스크립트를 불러오지 못했습니다.`));
    document.head.appendChild(script);
  });
}

export async function fetchIndex() {
  console.log("🚀 fetchIndex() 실행 시작");
  try {
    const subjectIds = await discoverSubjectDirectories();
    const subjects = [];

    for (const subjectId of subjectIds) {
      const lectureFiles = await discoverLectureFiles(subjectId);
      if (!lectureFiles.length) {
        continue;
      }

      subjects.push({
        id: subjectId,
        name: formatLabel(subjectId),
        lectures: lectureFiles,
      });
    }

    return { subjects };
  } catch (error) {
    return fetchIndexManifest();
  }
}
export async function fetchLecture(subjectId, lectureFile) {
  const encodedLecturePath = lectureFile
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const lectureUrl = `./data/subjects/${encodeURIComponent(subjectId)}/${encodedLecturePath}`;
  const response = await fetch(lectureUrl);
  
  if (!response.ok) {
    throw new Error(`[HTTP ${response.status}] JSON을 불러오지 못했습니다: ${lectureUrl}`);
  }

  return response.json();
}

export async function fetchLectures(subjectId, lectures) {
  const questionGroups = await Promise.all(
    lectures.map((lecture) => fetchLecture(subjectId, lecture.file))
  );
  return questionGroups.flat();
}

export function getPrimaryLectureFile(index, subjectId) {
  const subject = getSubject(index, subjectId);
  return (subject?.lectures || [])[0]?.file || `${subjectId}.json`;
}

export function getSubject(index, subjectId) {
  return (index.subjects || []).find((subject) => subject.id === subjectId);
}
