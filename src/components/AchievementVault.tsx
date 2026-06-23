import type { Achievement } from '../types/profile';

type AchievementVaultProps = {
  achievements: Achievement[];
};

export function AchievementVault({ achievements }: AchievementVaultProps) {
  return (
    <article className="card" id="achievements">
      <div className="section-head">
        <h3>Hall of Shame (Achievements)</h3>
        <p className="subtle">Trophies you definitely didn't earn.</p>
      </div>
      <ul className="achievement-grid">
        {achievements.map((achievement, index) => (
          <li
            className="achievement-card"
            style={{ animationDelay: `${index * 90}ms` }}
            key={achievement.title}
          >
            <p className="tier">{achievement.tier}</p>
            <h4>{achievement.title}</h4>
            <span>{achievement.detail}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
