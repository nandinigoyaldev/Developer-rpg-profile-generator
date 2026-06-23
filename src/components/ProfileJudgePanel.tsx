import { useMemo } from 'react';
import type { DeveloperProfile } from '../types/profile';
import { judgeProfile } from '../lib/profileJudge';

interface ProfileJudgePanelProps {
  profile: DeveloperProfile;
}

export function ProfileJudgePanel({ profile }: ProfileJudgePanelProps) {
  const { roasts, tips } = useMemo(() => judgeProfile(profile), [profile]);

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        ⚖️ Profile Judge
      </h2>
      
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        We analyzed your profile. The results are in, and it's not looking good for you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Roasts Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--git-red)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔥 The Roasts
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {roasts.map((roast, idx) => (
              <li key={idx} style={{ padding: '12px', backgroundColor: 'rgba(248,81,73,0.05)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {roast}
              </li>
            ))}
          </ul>
        </div>

        {/* Tips Section */}
        <div>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--git-green)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💡 Constructive Feedback (Because we pity you)
          </h3>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tips.map((tip, idx) => (
              <li key={idx} style={{ padding: '12px', backgroundColor: 'rgba(46,160,67,0.05)', border: '1px solid rgba(46,160,67,0.2)', borderRadius: '4px', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
