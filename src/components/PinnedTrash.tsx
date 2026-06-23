import type { RepositoryQuest } from '../types/profile';

type PinnedTrashProps = {
  repositories: RepositoryQuest[];
};

export function PinnedTrash({ repositories }: PinnedTrashProps) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 400, marginBottom: '8px', color: 'var(--text-main)' }}>
        Pinned Trash
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {repositories.map((repo) => (
          <div key={repo.name} style={{ border: '1px solid var(--line-strong)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--git-blue)', fontWeight: 600, fontSize: '14px' }}>
                <span style={{ marginRight: '8px' }}>🗑️</span>{repo.name}
              </span>
              <span style={{ fontSize: '12px', border: '1px solid var(--line-strong)', borderRadius: '2em', padding: '2px 7px', color: 'var(--text-muted)' }}>Public</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, marginBottom: '16px' }}>
              {repo.roast}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--git-green)', display: 'inline-block', marginRight: '4px' }}></span>
              <span style={{ marginRight: '16px' }}>{repo.language}</span>
              <span style={{ marginRight: '4px' }}>⭐</span> {repo.stars}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
