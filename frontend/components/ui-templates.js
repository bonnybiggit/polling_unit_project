export function createCandidateCard(candidate) {
  return `
    <article class="card candidate-card">
      <div>
        <h3>${candidate.name}</h3>
        <p class="text-muted">${candidate.office}</p>
      </div>
      <div class="status-pill">${candidate.party}</div>
      <p class="text-muted">${candidate.bio}</p>
    </article>
  `;
}

export function createResultItem(result) {
  return `
    <div class="card result-card">
      <div class="grid-2">
        <div>
          <p class="eyebrow">${result.position}</p>
          <h3>${result.winner}</h3>
          <p class="text-muted">${result.party}</p>
        </div>
        <div>
          <span class="badge success">${result.votes} votes</span>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width: ${result.share}%"></div></div>
    </div>
  `;
}
