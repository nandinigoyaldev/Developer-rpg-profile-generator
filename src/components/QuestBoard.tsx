import type { RepositoryQuest } from '../types/profile';

type QuestBoardProps = {
  repositories: RepositoryQuest[];
};

export function QuestBoard({ repositories }: QuestBoardProps) {
  return (
    <article className="card" id="quests">
      <div className="section-head">
        <h3>Unlocked Quests</h3>
        <p className="subtle">Repositories mapped as missions with rewards and challenge tiers.</p>
      </div>
      <ul className="quest-grid">
        {repositories.map((repo) => (
          <li className={`quest-card ${repo.status.toLowerCase()}`} key={repo.name}>
            <div className="quest-head">
              <h4>{repo.name}</h4>
              <span>{repo.status}</span>
            </div>
            <p>{repo.questType}</p>
            <div className="quest-meta">
              <small>Difficulty: {repo.difficulty}</small>
              <small>Reward: {repo.stars} stars</small>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
