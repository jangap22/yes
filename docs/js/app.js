import { fetchIndex } from "./dataLoader.js";

function renderSubjects(index) {
  const container = document.querySelector("#subject-list");
  const subjects = index.subjects || [];

  if (!subjects.length) {
    container.innerHTML = `
      <article class="subject-card">
        <h2>아직 생성된 퀴즈가 없습니다</h2>
        <p class="muted">
          <code>docs/data/subjects/{subject}/...</code> 아래에 새 폴더와 JS 파일을 추가하면 자동으로 목록에 표시됩니다.
        </p>
      </article>
    `;
    return;
  }

  container.innerHTML = subjects
    .map(
      (subject) => `
        <article class="subject-card">
          <p class="eyebrow">${subject.id}</p>
          <h2>${subject.name}</h2>
          <p class="muted">총 ${(subject.lectures || []).length}개 챕터 파일</p>
          <div class="lecture-list">
            <a class="lecture-link" href="./quiz.html?subject=${encodeURIComponent(subject.id)}">
              학습 시작
            </a>
          </div>
        </article>
      `
    )
    .join("");
}

async function main() {
  const index = await fetchIndex();
  renderSubjects(index);
}

main().catch((error) => {
  const container = document.querySelector("#subject-list");
  container.innerHTML = `
    <article class="subject-card">
      <h2>데이터를 불러오지 못했습니다</h2>
      <p class="muted">${error.message}</p>
    </article>
  `;
});
