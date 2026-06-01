import { useState } from 'react';
import { SideNav } from './components/SideNav';
import { ProfilePanel } from './components/ProfilePanel';
import { StatPanel } from './components/StatPanel';
import { AchievementVault } from './components/AchievementVault';
import { QuestBoard } from './components/QuestBoard';
import { SkillTree } from './components/SkillTree';
import { OriginSelector } from './components/OriginSelector';
import { AnalysisReport } from './components/AnalysisReport';
import { characterProfile } from './data/character';
import { originThemes } from './data/origins';

function App() {
  const [role, setRole] = useState<'Contributor' | 'Maintainer'>('Contributor');

  return (
    <div className="app-shell">
      <SideNav battleTag={characterProfile.battleTag} />

      <main className="main-view">
        <section className="sandbox-hero card">
          <div className="role-switch" aria-label="Sandbox role selector">
            {(['Contributor', 'Maintainer'] as const).map((item) => (
              <button
                key={item}
                className={item === role ? 'role-pill active' : 'role-pill'}
                type="button"
                onClick={() => setRole(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="sandbox-copy">
            <p className="eyebrow">AUTHORIZED ACCESS ONLY</p>
            <h1>Enter the Sandbox.</h1>
            <p className="sandbox-subtitle">
              {role === 'Contributor'
                ? 'Assemble your build, unlock quests, and prove your developer rank.'
                : 'Maintain the guild, review the raid, and keep the system stable.'}
            </p>
          </div>

          <div className="auth-stack">
            <button className="github-button" type="button">
              <span className="github-mark">GH</span>
              Sign in with GitHub
            </button>

            <div className="divider-row" aria-hidden="true">
              <span></span>
              <strong>OR</strong>
              <span></span>
            </div>

            <input type="text" placeholder="Username or Email" aria-label="Username or Email" />
            <input type="password" placeholder="Password" aria-label="Password" />
            <button className="primary-assemble" type="button">
              Assemble &amp; Run!
            </button>

            <p className="auth-hint">
              For real README updates, connect a GitHub OAuth app or GitHub App in the backend.
              For hackathon demos, you can still paste a GitHub profile or repository URL here and generate a preview.
            </p>
          </div>
        </section>

        <ProfilePanel profile={characterProfile} />
        <StatPanel stats={characterProfile.stats} />
        <AchievementVault achievements={characterProfile.achievements} />
        <QuestBoard repositories={characterProfile.repositories} />
        <SkillTree skills={characterProfile.skillTree} />
        <OriginSelector origins={originThemes} />
        <AnalysisReport report={characterProfile.analysis} />
      </main>
    </div>
  );
}

export default App;
