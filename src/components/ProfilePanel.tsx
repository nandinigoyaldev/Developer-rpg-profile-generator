import type { DeveloperProfile } from '../types/profile';

type ProfilePanelProps = {
  profile: DeveloperProfile;
};

export function ProfilePanel({ profile }: ProfilePanelProps) {
  return (
    <article className="profile-panel card" id="character">
      <header className="profile-head">
        <div className="avatar-badge">{profile.avatarInitials}</div>
        <div>
          <p className="eyebrow">{profile.guild}</p>
          <h2>{profile.name}</h2>
          <p className="subtle">
            {profile.className} · {profile.specialization}
          </p>
        </div>
        <div className="rank-chip">{profile.rank}</div>
      </header>

      <div className="profile-meta">
        <div>
          <span>Power Level</span>
          <strong>{profile.powerLevel}/100</strong>
        </div>
        <div>
          <span>Developer Tier</span>
          <strong>{profile.title}</strong>
        </div>
      </div>

      <div className="xp-row">
        <div className="xp-labels">
          <span>XP to Next Rank</span>
          <span>{profile.xpProgress}%</span>
        </div>
        <div
          className="xp-track"
          role="progressbar"
          aria-label="XP progress"
          aria-valuenow={profile.xpProgress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <span style={{ width: `${profile.xpProgress}%` }}></span>
        </div>
      </div>
    </article>
  );
}
