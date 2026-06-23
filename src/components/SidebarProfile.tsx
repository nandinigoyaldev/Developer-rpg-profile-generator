import type { DeveloperProfile } from '../types/profile';

type SidebarProfileProps = {
  profile: DeveloperProfile;
};

export function SidebarProfile({ profile }: SidebarProfileProps) {
  return (
    <div style={{ padding: '0 16px' }}>
      <img 
        src={profile.avatarUrl || `https://github.com/${profile.login}.png`} 
        alt={profile.login} 
        style={{ width: '296px', height: '296px', borderRadius: '50%', border: '1px solid var(--line-strong)', marginBottom: '16px', objectFit: 'cover' }}
      />
      <h1 style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.25 }}>{profile.name}</div>
        <div style={{ fontSize: '20px', fontWeight: 300, color: 'var(--text-muted)', lineHeight: 1.25 }}>{profile.login}</div>
      </h1>

      <p style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '16px' }}>
        {profile.bio || 'Too lazy to write a bio. Or just boring.'}
      </p>

      <div style={{ marginBottom: '16px' }}>
        <button className="primary-assemble" style={{ width: '100%', height: '32px', fontSize: '14px', marginBottom: '8px' }}>
          Follow (Please don't)
        </button>
      </div>

      <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <span>👥</span>
        <strong style={{ color: 'var(--text-main)' }}>{profile.followers}</strong> followers
        <span>·</span>
        <strong style={{ color: 'var(--text-main)' }}>{profile.following}</strong> following
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0', fontSize: '14px', color: 'var(--text-main)' }}>
        {profile.company && (
          <li style={{ marginBottom: '4px' }}>🏢 {profile.company}</li>
        )}
        {profile.location && (
          <li style={{ marginBottom: '4px' }}>📍 {profile.location}</li>
        )}
        {profile.blog && (
          <li style={{ marginBottom: '4px' }}>🔗 <a href={profile.blog} style={{ color: 'var(--git-blue)', textDecoration: 'none' }}>{profile.blog}</a></li>
        )}
      </ul>

      <div style={{ borderTop: '1px solid var(--line-strong)', paddingTop: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>Achievements</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }} title="Grade">
            {profile.grade}
          </div>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Title: {profile.title}
        </p>
      </div>
    </div>
  );
}
