import type { DeveloperProfile } from '../types/profile';

export function BadgeGenerator({ profile }: { profile: DeveloperProfile }) {
  const badgeUrl = `https://developerrpg.vercel.app/api/badge?username=${encodeURIComponent(profile.login)}`;
  
  const markdownCode = `[![Developer RPG Profile](${badgeUrl})](https://developerrpg.vercel.app/)`;
  const htmlCode = `<a href="https://developerrpg.vercel.app/"><img src="${badgeUrl}" alt="Developer RPG Profile" /></a>`;

  return (
    <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--line-strong)', borderRadius: '6px', marginTop: '24px' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: 'var(--text-main)', borderBottom: '1px solid var(--line-strong)', paddingBottom: '8px' }}>
        🏷️ Embeddable GitHub Badge
      </h2>
      
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
        Show off your absolutely mediocre coding stats on your GitHub README. Copy the code below and paste it into your profile.
      </p>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Preview */}
        <div style={{ flex: '1', minWidth: '250px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Preview</div>
          <div style={{ padding: '24px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', border: '1px solid var(--line-strong)', display: 'flex', justifyContent: 'center' }}>
            {/* Fallback to text if badge API fails locally */}
            <div style={{ padding: '8px 16px', backgroundColor: '#0d1117', border: '1px solid var(--git-orange)', borderRadius: '4px', color: '#fff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--git-orange)', fontWeight: 'bold' }}>DEV RPG</span>
              <span style={{ borderLeft: '1px solid #30363d', paddingLeft: '8px' }}>Rank: {profile.grade} | {profile.title}</span>
            </div>
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
            (Note: Actual badge renders as an SVG dynamically)
          </p>
        </div>

        {/* Code Snippets */}
        <div style={{ flex: '2', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>Markdown (For README.md)</div>
            <textarea 
              readOnly 
              value={markdownCode} 
              style={{ width: '100%', height: '60px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--line-strong)', borderRadius: '4px', color: 'var(--text-main)', resize: 'none' }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>HTML (For websites)</div>
            <textarea 
              readOnly 
              value={htmlCode} 
              style={{ width: '100%', height: '60px', padding: '12px', fontFamily: 'monospace', fontSize: '0.85rem', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--line-strong)', borderRadius: '4px', color: 'var(--text-main)', resize: 'none' }}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
