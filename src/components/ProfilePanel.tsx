import { useState } from 'react';
import type { DeveloperProfile } from '../types/profile';

type ProfilePanelProps = {
  profile: DeveloperProfile;
};

export function ProfilePanel({ profile }: ProfilePanelProps) {
  const [showRankExplanation, setShowRankExplanation] = useState(false);

  return (
    <article className="profile-panel" id="character">
      <div className="profile-head-sidebar">
        {/* Large Circular Avatar Badge */}
        <div className="avatar-badge-circle" style={{ position: 'relative' }}>
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
            />
          ) : (
            <span style={{ fontSize: '2.5rem', fontWeight: 800 }}>{profile.avatarInitials}</span>
          )}
        </div>
        
        {/* Name and Handle */}
        <div className="profile-names">
          <h2>{profile.name}</h2>
          <div className="battle-tag">{profile.battleTag}</div>
        </div>
      </div>

      {/* Bio / Description */}
      <div className="profile-bio" style={{ fontSize: '0.84rem', color: 'var(--text-main)', marginTop: '8px', lineHeight: 1.45 }}>
        {profile.bio || "Adventure awaits! Mapped stats and milestones assembled from repository codes."}
      </div>

      {/* Followers & Following */}
      {(profile.followers !== undefined || profile.following !== undefined) && (
        <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          <span>👤 <strong>{profile.followers || 0}</strong> followers</span>
          <span>•</span>
          <span><strong>{profile.following || 0}</strong> following</span>
        </div>
      )}

      {/* Rank Badge with Level Info Tooltip */}
      <div style={{ position: 'relative', marginTop: '10px' }}>
        <button 
          className="rank-chip-github" 
          style={{ 
            cursor: 'pointer', 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '6px', 
            border: '1px solid var(--line-strong)',
            backgroundColor: 'var(--bg-panel)',
            padding: '4px 10px',
            borderRadius: '20px',
            color: 'var(--text-main)',
            fontSize: '0.78rem',
            fontWeight: 600
          }} 
          onClick={() => setShowRankExplanation(!showRankExplanation)}
          type="button"
        >
          🏆 {profile.rank} <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>[Info ℹ️]</span>
        </button>
        
        {showRankExplanation && (
          <div className="card" style={{
            position: 'absolute',
            top: '32px',
            left: 0,
            zIndex: 1000,
            width: '280px',
            padding: '12px',
            backgroundColor: 'var(--bg-panel)',
            border: '1px solid var(--line-strong)',
            borderRadius: '6px',
            boxShadow: 'var(--shadow-neon)',
            fontSize: '0.78rem',
            lineHeight: 1.4,
            color: 'var(--text-main)'
          }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.82rem', fontWeight: 700 }}>Tiers &amp; Progression Levels:</h4>
            <ul style={{ paddingLeft: '14px', margin: 0, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Challenger I</strong> (&gt;85 Power): Elite developers with substantial commits, merged pull requests, and multi-branch skills.</li>
              <li><strong>Diamond IV</strong> (70-85 Power): High completeness, locked quests cleared, active contributions.</li>
              <li><strong>Gold III</strong> (55-70 Power): Consistent commits, multiple active repository quests.</li>
              <li><strong>Silver II</strong> (35-55 Power): Starter coding projects published, profile basics filled.</li>
              <li><strong>Bronze IV</strong> (0-35 Power): Starting tier for newly spawned developer nodes.</li>
            </ul>
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button 
                onClick={() => setShowRankExplanation(false)} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: 'var(--git-blue)', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  fontSize: '0.72rem'
                }}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Secondary Details List */}
      <div className="profile-meta-list" style={{ borderTop: '1px solid var(--line-strong)', marginTop: '12px', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {profile.guild && (
          <div className="profile-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <span className="icon">🏢</span>
            <span>{profile.guild}</span>
          </div>
        )}
        {profile.location && (
          <div className="profile-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <span className="icon">📍</span>
            <span>{profile.location}</span>
          </div>
        )}
        {profile.blog && (
          <div className="profile-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
            <span className="icon">🔗</span>
            <a 
              href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ color: 'var(--git-blue)', textDecoration: 'none' }}
            >
              {profile.blog.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}
        <div className="profile-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <span className="icon">🔮</span>
          <span>{profile.className} · {profile.specialization}</span>
        </div>
        <div className="profile-meta-item" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem' }}>
          <span className="icon">⚡</span>
          <span>Power Level: <strong>{profile.powerLevel}/100</strong></span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-row-sidebar" style={{ borderTop: '1px solid var(--line-strong)', marginTop: '12px', paddingTop: '12px' }}>
        <span>XP to Next Tier: {profile.xpProgress}%</span>
        <div
          className="xp-track"
          role="progressbar"
          aria-label="XP progress"
          aria-valuenow={profile.xpProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ height: '8px', border: '1px solid var(--line-strong)', borderRadius: '4px' }}
        >
          <span style={{ width: `${profile.xpProgress}%`, borderRadius: '4px' }}></span>
        </div>
      </div>
    </article>
  );
}
