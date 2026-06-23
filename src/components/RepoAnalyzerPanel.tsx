import { useState } from 'react';
import { generateRepoRoast } from '../lib/repoRoast';

export function RepoAnalyzerPanel() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState<any>(null);
  const [roastData, setRoastData] = useState<{ roast: string, grade: string, tips: string[] } | null>(null);

  const handleAnalyze = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a valid GitHub repository URL or owner/repo format.');
      return;
    }
    setLoading(true);
    setError('');
    setRepoData(null);
    setRoastData(null);

    try {
      const response = await fetch('/api/repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl.trim() }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to analyze repository. Does it even exist?');
      }

      const data = await response.json();
      setRepoData(data);
      setRoastData(generateRepoRoast(data));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        🔍 Repo Analyzer (Roast Edition)
      </h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="e.g. facebook/react or full URL"
          style={{ flex: 1, padding: '8px 12px', height: '38px' }}
        />
        <button
          className="primary-assemble"
          onClick={handleAnalyze}
          disabled={loading}
          style={{ height: '38px', padding: '0 24px', whiteSpace: 'nowrap' }}
        >
          {loading ? 'Judging...' : 'Roast Repo'}
        </button>
      </div>

      {error && (
        <div style={{ color: 'var(--git-red)', marginBottom: '16px', padding: '12px', backgroundColor: 'rgba(248,81,73,0.1)', border: '1px solid var(--git-red)', borderRadius: '6px' }}>
          ⚠️ {error}
        </div>
      )}

      {repoData && roastData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ padding: '16px', backgroundColor: 'var(--bg-subtle)', borderLeft: `4px solid ${roastData.grade === 'F' ? 'var(--git-red)' : 'var(--git-orange)'}`, borderRadius: '4px' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-main)' }}>The Verdict: Grade {roastData.grade}</h3>
            <p style={{ margin: 0, fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>"{roastData.roast}"</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Repository</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{repoData.name}</div>
            </div>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Stars & Forks</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>⭐ {repoData.stars} | 🍴 {repoData.forks}</div>
            </div>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Open Issues</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{repoData.issues} {repoData.issues > 0 ? '🐞' : '✅'}</div>
            </div>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Main Language</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{repoData.language || 'Unknown'}</div>
            </div>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deployed?</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{repoData.isLive ? `✅ Yes (${repoData.liveUrl})` : '❌ No'}</div>
            </div>
            <div className="card" style={{ padding: '12px', overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>License</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)', wordBreak: 'break-word' }}>{repoData.license || 'None'}</div>
            </div>
          </div>

          <div className="card" style={{ padding: '16px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Description</h4>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{repoData.description || <i>No description provided.</i>}</p>
          </div>

          {repoData.structure && repoData.structure.length > 0 && (
            <div className="card" style={{ padding: '16px' }}>
              <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>Top-Level Directory Structure</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {repoData.structure.slice(0, 15).map((item: any, idx: number) => (
                  <span key={idx} style={{ padding: '4px 8px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '4px', fontSize: '0.8rem' }}>
                    {item.type === 'dir' ? '📁' : '📄'} {item.name}
                  </span>
                ))}
                {repoData.structure.length > 15 && (
                  <span style={{ padding: '4px 8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>...and more</span>
                )}
              </div>
            </div>
          )}

          {roastData.tips && roastData.tips.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--git-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💡 Pro Tips (To not be terrible)
              </h3>
              <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {roastData.tips.map((tip, idx) => (
                  <li key={idx} style={{ padding: '12px', backgroundColor: 'rgba(46,160,67,0.05)', border: '1px solid rgba(46,160,67,0.2)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
