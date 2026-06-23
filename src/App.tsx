import { useState } from 'react';
import { SidebarProfile } from './components/SidebarProfile';
import { PinnedTrash } from './components/PinnedTrash';
import { ToxicTraits } from './components/ToxicTraits';
import { ContributionGraph } from './components/ContributionGraph';
import { ProfileCompletionTracker } from './components/ProfileCompletionTracker';
import { ReadmePanel } from './components/ReadmePanel';
import { RepoAnalyzerPanel } from './components/RepoAnalyzerPanel';
import { ProfileJudgePanel } from './components/ProfileJudgePanel';
import { characterProfile } from './data/character';
import type { DeveloperProfile } from './types/profile';

function App() {
  const [profile, setProfile] = useState<DeveloperProfile | any>(characterProfile);
  const [activeTab, setActiveTab] = useState<'overview' | 'readme' | 'repo' | 'judge'>('overview');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Force GitHub Dark Theme
  document.body.className = 'theme-github-dark';

  const handleGenerateProfile = async () => {
    if (!usernameInput.trim()) {
      setErrorMessage('Please enter a GitHub username.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    let sanitizedUsername = usernameInput.trim();
    // Extract username if user pasted a full GitHub URL
    if (sanitizedUsername.includes('github.com/')) {
      sanitizedUsername = sanitizedUsername.split('github.com/')[1].split('/')[0];
    }
    // Remove @ if they typed @username
    if (sanitizedUsername.startsWith('@')) {
      sanitizedUsername = sanitizedUsername.slice(1);
    }

    try {
      const response = await fetch(
        `/api/github?username=${encodeURIComponent(sanitizedUsername)}`,
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to fetch GitHub profile details.');
      }
      const currentProfile = await response.json();

      setProfile(currentProfile);
      setIsLoaded(true);
      setActiveTab('overview');
    } catch (err: any) {
      console.error(err);
      
      const msg = err.message || '';
      if (msg.includes('404') || msg.includes('Not Found')) {
        const roasts = [
          "404: Skill not found. Did you type that right?",
          "This user doesn't exist. Much like your unit tests.",
          "Are you sure they are a developer? GitHub has never heard of them.",
          "User not found. Maybe they got fired and deleted their account.",
          "404. Let's pretend that was a typo and not you hallucinating a friend."
        ];
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        setErrorMessage(randomRoast);
      } else {
        setErrorMessage(msg || 'Error compiling profile data.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxDemo = () => {
    // The sandbox character profile is RPG typed, so for the new layout, we might need to mock a bit.
    const mockProfile: DeveloperProfile = {
      login: 'sandbox-user',
      name: 'Sandbox User',
      title: 'Localhost Legend',
      avatarUrl: 'https://github.com/octocat.png',
      bio: 'I test things in production.',
      location: '127.0.0.1',
      followers: 42,
      following: 0,
      totalCommits: 9001,
      totalPRs: 0,
      totalStars: 5,
      streak: 1,
      grade: 'D',
      activityRoast: 'You made 9001 commits to master. Your team hates you.',
      toxicTraits: ['Force pushes to main.', 'Leaves commented out code everywhere.'],
      pinnedTrash: [
        { name: 'test-repo', stars: 0, language: 'JavaScript', description: 'test', roast: 'A literal test repo. Groundbreaking.' }
      ],
    };
    setProfile(mockProfile);
    setIsLoaded(true);
  };

  return (
    <div className="github-layout-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', overflowX: 'hidden', width: '100%' }}>
      
      {/* 1. GATED Streamlined Login Screen */}
      {!isLoaded ? (
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '16px' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '24px', border: '1px solid var(--line-strong)', borderRadius: '6px', backgroundColor: 'var(--bg-panel)', boxShadow: 'var(--shadow-neon)' }}>
            
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🤡</div>
              <h1 style={{ fontSize: '1.62rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                Developer Roasting Profile Generator
              </h1>
              <p className="subtle" style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
                Let us brutally roast your GitHub activity and generate a sarcastic profile and README.
              </p>
            </div>

            {errorMessage && (
              <div className="card" style={{ borderColor: 'var(--git-red)', background: 'rgba(248, 81, 73, 0.1)', color: 'var(--git-red)', padding: '12px', marginBottom: '16px', fontSize: '0.82rem', fontWeight: 600 }}>
                ⚠️ ERROR: {errorMessage}
              </div>
            )}

            {loading && (
              <div className="card loading-overlay" style={{ marginBottom: '16px' }}>
                <div className="spinner"></div>
                <span style={{ fontSize: '0.85rem' }}>Judging your terrible code...</span>
              </div>
            )}

            <div className="auth-stack" style={{ width: '100%' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>GitHub Username</label>
                <input
                  type="text"
                  placeholder="Enter username (e.g. torvalds)"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  style={{ height: '38px', padding: '0 12px' }}
                  aria-label="GitHub Username"
                />
              </div>

              <button
                className="primary-assemble"
                onClick={handleGenerateProfile}
                type="button"
                style={{ height: '40px', marginTop: '20px' }}
              >
                Generate Roast Profile
              </button>

              <div className="divider-row" aria-hidden="true" style={{ margin: '14px 0' }}>
                <span></span>
                <strong>OR</strong>
                <span></span>
              </div>

              <button
                onClick={handleSandboxDemo}
                className="theme-btn"
                style={{ width: '100%', height: '38px', background: 'transparent' }}
                type="button"
              >
                🚀 Browse Sandbox with Demo Profile
              </button>

            </div>
          </div>
        </main>
      ) : (
        
        /* 2. UNLOCKED GITHUB-STYLE DASHBOARD PAGE */
        <>
          {/* Top Navbar */}
          <header style={{ backgroundColor: '#161b22', padding: '16px 32px', borderBottom: '1px solid var(--line-strong)', display: 'flex', alignItems: 'center' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }} onClick={() => setIsLoaded(false)}>
              🤡 GitHub Roaster
            </div>
          </header>

          <div style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#0d1117' }}>
            <div style={{ width: '100%', maxWidth: '1280px', display: 'flex', flexDirection: 'row', padding: '32px 24px', gap: '32px' }}>
              
              {/* Left Sidebar */}
              <div style={{ width: '296px', flexShrink: 0 }}>
                <SidebarProfile profile={profile} />
              </div>

              {/* Main Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                
                {/* Tab Navigation */}
                <div style={{ borderBottom: '1px solid var(--line-strong)', marginBottom: '24px', display: 'flex', gap: '16px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
                  <button
                    style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'overview' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: activeTab === 'overview' ? '2px solid var(--git-orange)' : '2px solid transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    onClick={() => setActiveTab('overview')}
                  >
                    Overview
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'readme' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: activeTab === 'readme' ? '2px solid var(--git-orange)' : '2px solid transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    onClick={() => setActiveTab('readme')}
                  >
                    README Generator
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'repo' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: activeTab === 'repo' ? '2px solid var(--git-orange)' : '2px solid transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    onClick={() => setActiveTab('repo')}
                  >
                    Repo Analyzer
                  </button>
                  <button
                    style={{ background: 'none', border: 'none', padding: '8px 16px', color: activeTab === 'judge' ? 'var(--text-main)' : 'var(--text-muted)', borderBottom: activeTab === 'judge' ? '2px solid var(--git-orange)' : '2px solid transparent', cursor: 'pointer', fontSize: '14px', fontWeight: 600 }}
                    onClick={() => setActiveTab('judge')}
                  >
                    Profile Judge
                  </button>
                </div>

                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <div>
                    <PinnedTrash repositories={profile.pinnedTrash || []} />
                    <ContributionGraph totalCommits={profile.totalCommits || 0} streak={profile.streak || 0} roast={profile.activityRoast || ''} />
                    <ToxicTraits traits={profile.toxicTraits || []} />
                    <ProfileCompletionTracker profile={profile} />
                  </div>
                )}

                {/* TAB 2: README GENERATOR */}
                {activeTab === 'readme' && (
                  <ReadmePanel profile={profile} />
                )}

                {/* TAB 3: REPO ANALYZER */}
                {activeTab === 'repo' && (
                  <RepoAnalyzerPanel />
                )}

                {/* TAB 4: PROFILE JUDGE */}
                {activeTab === 'judge' && (
                  <ProfileJudgePanel profile={profile} />
                )}

              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}

export default App;
