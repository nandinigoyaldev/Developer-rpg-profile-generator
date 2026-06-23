import React, { useState } from 'react';
import { generateRepoRoast } from '../lib/repoRoast';

export function RepoAnalyzerPanel() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState<any>(null);
  const [roastData, setRoastData] = useState<{ roast: string, grade: string } | null>(null);

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
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Repository</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{repoData.name}</div>
            </div>
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Stars & Forks</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>⭐ {repoData.stars} | 🍴 {repoData.forks}</div>
            </div>
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Open Issues</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{repoData.issues} {repoData.issues > 0 ? '🐞' : '✅'}</div>
            </div>
            <div className="card" style={{ padding: '12px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Main Language</div>
              <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{repoData.language || 'Unknown'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
