import type { DeveloperProfile } from '../types/profile';

type ProfilePanelProps = {
  profile: DeveloperProfile;
};

export function ProfilePanel({ profile }: ProfilePanelProps) {
  return (
    <article className="profile-panel" id="character">
      <div className="profile-head-sidebar">
        {/* Large Circular Avatar Badge */}
        <div className="avatar-badge-circle">
          {profile.avatarInitials}
        </div>
        
        {/* Name and Handle */}
        <div className="profile-names">
          <h2>{profile.name}</h2>
          <div className="battle-tag">{profile.battleTag}</div>
        </div>
      </div>

      {/* Bio / Description */}
      <div className="profile-bio">
        Adventure awaits! Mapped stats and milestones assembled from repository codes.
      </div>

      {/* Rank Badge */}
      <div className="rank-chip-github">
        🏆 {profile.rank}
      </div>

      {/* Secondary Details List */}
      <div className="profile-meta-list">
        <div className="profile-meta-item">
          <span className="icon">🏢</span>
          <span>{profile.guild}</span>
        </div>
        <div className="profile-meta-item">
          <span className="icon">🔮</span>
          <span>{profile.className} · {profile.specialization}</span>
        </div>
        <div className="profile-meta-item">
          <span className="icon">⚡</span>
          <span>Power Level: <strong>{profile.powerLevel}/100</strong></span>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-row-sidebar">
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
