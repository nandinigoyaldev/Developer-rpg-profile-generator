import type { RepositoryQuest } from '../types/profile';

type QuestBoardProps = {
  repositories: RepositoryQuest[];
};

// Helper to determine language indicator dot colors
const getLanguageColor = (questType: string) => {
  if (questType.includes('UI') || questType.includes('Spellbook')) return '#f1e05a'; // JavaScript-like yellow
  if (questType.includes('AI') || questType.includes('Artifact')) return '#3572A5'; // Python blue
  if (questType.includes('Engine') || questType.includes('Core')) return '#00ADD8'; // Go/Rust cyan
  return '#8b949e'; // Default grey
};

export function QuestBoard({ repositories }: QuestBoardProps) {
  return (
    <article className="card" id="quests" style={{ padding: '24px' }}>
      <div className="section-head" style={{ marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🗑️</span> Repo Graveyard (Abandoned Projects)
        </h3>
        <p className="subtle">Repositories you started, abandoned, and left to rot.</p>
      </div>

      <div className="quest-grid-pinned">
        {repositories.map((repo) => {
          const langColor = getLanguageColor(repo.questType);

          return (
            <div
              className={`quest-card-pinned ${repo.status.toLowerCase()}`}
              key={repo.name}
            >
              <div>
                <div className="quest-pinned-header">
                  <div className="quest-pinned-title">
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>📁</span>
                    <h4>{repo.name}</h4>
                  </div>
                  <span className="quest-public-badge">Public</span>
                </div>

                <p className="quest-pinned-desc" style={{ marginTop: '8px' }}>
                  {repo.questType}. Probably just a tutorial you cloned and never finished.
                </p>
              </div>

              <div className="quest-pinned-footer">
                <div>
                  <span
                    className="quest-lang-dot"
                    style={{ backgroundColor: langColor }}
                  ></span>
                  <span>{repo.questType.split(' ')[0]}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span>⭐</span>
                  <span>{repo.stars}</span>
                </div>

                <div>
                  <span className={`quest-status-badge ${repo.status.toLowerCase()}`}>
                    {repo.status === 'Active' ? '🗑️ Trashed' : repo.status === 'Locked' ? '🔒 Abandoned' : '🥱 Forgotten'}
                  </span>
                </div>

                <div style={{ marginLeft: 'auto' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {repo.difficulty}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </article>
  );
}
