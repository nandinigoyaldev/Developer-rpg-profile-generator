import { useMemo } from 'react';
import type { DeveloperProfile } from '../types/profile';
import { judgeProfile } from '../lib/profileJudge';

interface ProfileJudgePanelProps {
  profile: DeveloperProfile;
}

export function ProfileJudgePanel({ profile }: ProfileJudgePanelProps) {
  const { tips } = useMemo(() => judgeProfile(profile), [profile]);

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        ⚖️ Profile Judge
      </h2>
      
      <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        We analyzed your profile. The results are in, and it's not looking good for you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        
        {/* Tips Section */}
        <div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tips.map((tip, idx) => (
              <li key={idx} style={{ padding: '16px', backgroundColor: 'rgba(210, 153, 34, 0.05)', border: '1px solid var(--git-orange)', borderRadius: '4px', fontSize: '1rem', color: 'var(--text-main)', lineHeight: '1.5' }}>
                💡 <strong>Harsh Advice:</strong> {tip}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
