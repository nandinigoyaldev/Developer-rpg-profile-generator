import type { Stat } from '../types/profile';

type StatPanelProps = {
  stats: Stat[];
};

export function StatPanel({ stats }: StatPanelProps) {
  return (
    <article className="card" id="stats">
      <div className="section-head">
        <h3>Pathetic Stats</h3>
        <p className="subtle">We scraped this, unfortunately it's real.</p>
      </div>
      <div className="stat-grid">
        {stats.map((stat) => (
          <div className="stat-tile" key={stat.label}>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <span>{stat.modifier}</span>
          </div>
        ))}
      </div>
    </article>
  );
}
