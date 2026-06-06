/* eslint-disable */
import { useState, useEffect } from 'react';
import { SideNav } from './components/SideNav';
import { ProfilePanel } from './components/ProfilePanel';
import { StatPanel } from './components/StatPanel';
import { AchievementVault } from './components/AchievementVault';
import { QuestBoard } from './components/QuestBoard';
import { SkillTree } from './components/SkillTree';
import { OriginSelector } from './components/OriginSelector';
import { AnalysisReport } from './components/AnalysisReport';
import { ReadmePanel } from './components/ReadmePanel';
import { characterProfile } from './data/character';
import { originThemes } from './data/origins';
import type { DeveloperProfile } from './types/profile';

type RatingBreakdown = {
  completeness: number;
  consistency: number;
  impact: number;
  powerLevel: number;
  rank: string;
  tips: string[];
};

function App() {
  const [profile, setProfile] = useState<DeveloperProfile>(characterProfile);
  const [activeTheme, setActiveTheme] = useState<string>('github-dark');
  const [activeTab, setActiveTab] = useState<'overview' | 'ratings' | 'readme'>('overview');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [rating, setRating] = useState<RatingBreakdown | null>(null);

  // Sync active theme class to HTML body element
  useEffect(() => {
    document.body.className = `theme-${activeTheme}`;
  }, [activeTheme]);

  // Update rating metrics whenever the profile changes
  useEffect(() => {
    calculateProfileRating();
  }, [profile]);

  const calculateProfileRating = async () => {
    try {
      const response = await fetch('/api/rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      if (response.ok) {
        const ratingData = await response.json();
        setRating(ratingData);
        
        // Sync rank and power level back to the profile display
        if (ratingData.powerLevel !== profile.powerLevel || ratingData.rank !== profile.rank) {
          setProfile((prev) => ({
            ...prev,
            powerLevel: ratingData.powerLevel,
            rank: ratingData.rank,
            title: `Developer Tier: ${ratingData.rank}`,
            analysis: {
              ...prev.analysis,
              powerLevel: `${ratingData.powerLevel}/100`,
            },
          }));
        }
      }
    } catch (e) {
      console.error('Failed to calculate profile ratings:', e);
    }
  };

  const handleGenerateProfile = async () => {
    if (!usernameInput.trim() && !resumeFile) {
      setErrorMessage('Please enter a GitHub username or select a resume file.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      let currentProfile = characterProfile;

      // 1. Fetch GitHub data if username is provided
      if (usernameInput.trim()) {
        const response = await fetch(`/api/github?username=${encodeURIComponent(usernameInput.trim())}`);
        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to fetch GitHub profile details.');
        }
        currentProfile = await response.json();
      } else {
        // Fallback placeholder profile name if only uploading resume
        currentProfile = {
          ...characterProfile,
          name: 'Adventurer Coder',
          battleTag: 'Adventurer#9999',
          guild: 'Independent Mercenary',
          avatarInitials: 'AC',
        };
      }

      // 2. Parse and merge resume if file is selected
      if (resumeFile) {
        const arrayBuffer = await resumeFile.arrayBuffer();
        const response = await fetch(`/api/resume?name=${encodeURIComponent(resumeFile.name)}`, {
          method: 'POST',
          headers: {
            'Content-Type': resumeFile.type || 'application/octet-stream',
          },
          body: arrayBuffer,
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Failed to parse resume file.');
        }

        const resumeData = await response.json();

        // Merge resume skills
        const mergedSkills = [...currentProfile.skillTree];
        resumeData.skills.forEach((newSkill: any) => {
          const existingIndex = mergedSkills.findIndex(
            (s) => s.name.toLowerCase() === newSkill.name.toLowerCase()
          );
          if (existingIndex > -1) {
            mergedSkills[existingIndex].level = Math.max(mergedSkills[existingIndex].level, newSkill.level);
          } else {
            mergedSkills.push(newSkill);
          }
        });

        // Merge achievements
        const mergedAchievements = [...currentProfile.achievements];
        resumeData.achievements.forEach((newAch: any) => {
          if (!mergedAchievements.some((a) => a.title.toLowerCase() === newAch.title.toLowerCase())) {
            mergedAchievements.push(newAch);
          }
        });

        const className = resumeData.suggestedClass || currentProfile.className;

        currentProfile = {
          ...currentProfile,
          className,
          achievements: mergedAchievements,
          skillTree: mergedSkills,
          guild: resumeData.education !== 'Self-taught Adventurer' ? `${resumeData.education} Guild` : currentProfile.guild,
          analysis: {
            ...currentProfile.analysis,
            characterClass: className,
            strengths: Array.from(new Set([...currentProfile.analysis.strengths, ...resumeData.skills.slice(0, 2).map((s: any) => s.name)])),
          }
        };
      }

      setProfile(currentProfile);
      setIsLoaded(true);
      setSuccessMessage(usernameInput.trim() ? `Generated RPG profile for ${currentProfile.name}!` : 'Generated RPG profile from resume!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error compiling profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSidebarResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const response = await fetch(`/api/resume?name=${encodeURIComponent(file.name)}`, {
        method: 'POST',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: arrayBuffer,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to parse resume file.');
      }

      const resumeData = await response.json();
      
      setProfile((prev) => {
        const mergedSkills = [...prev.skillTree];
        resumeData.skills.forEach((newSkill: any) => {
          const existingIndex = mergedSkills.findIndex(
            (s) => s.name.toLowerCase() === newSkill.name.toLowerCase()
          );
          if (existingIndex > -1) {
            mergedSkills[existingIndex].level = Math.max(mergedSkills[existingIndex].level, newSkill.level);
          } else {
            mergedSkills.push(newSkill);
          }
        });

        const mergedAchievements = [...prev.achievements];
        resumeData.achievements.forEach((newAch: any) => {
          if (!mergedAchievements.some((a) => a.title.toLowerCase() === newAch.title.toLowerCase())) {
            mergedAchievements.push(newAch);
          }
        });

        const className = resumeData.suggestedClass || prev.className;

        return {
          ...prev,
          className,
          achievements: mergedAchievements,
          skillTree: mergedSkills,
          guild: resumeData.education !== 'Self-taught Adventurer' ? `${resumeData.education} Guild` : prev.guild,
          analysis: {
            ...prev.analysis,
            characterClass: className,
            strengths: Array.from(new Set([...prev.analysis.strengths, ...resumeData.skills.slice(0, 2).map((s: any) => s.name)])),
          }
        };
      });

      setSuccessMessage(`Resume parsed successfully! Character stats upgraded!`);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error processing resume file.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProfile(characterProfile);
    setIsLoaded(false);
    setUsernameInput('');
    setResumeFile(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSandboxDemo = () => {
    setProfile(characterProfile);
    setIsLoaded(true);
    setSuccessMessage('Loaded sandbox demo profile.');
  };


  return (
    <div className="github-layout-root" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. GATED Streamlined Login Screen */}
      {!isLoaded ? (
        <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px' }}>
          <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '32px', border: '1px solid var(--line-strong)', borderRadius: '6px', backgroundColor: 'var(--bg-panel)', boxShadow: 'var(--shadow-neon)' }}>
            
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '8px' }}>⚔️</div>
              <h1 style={{ fontSize: '1.62rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                Developer RPG Profile Generator
              </h1>
              <p className="subtle" style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>
                Transform your GitHub activity and technical resume into an RPG character dashboard and download a custom profile README.md.
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
                <span style={{ fontSize: '0.85rem' }}>Deciphering developer profiles...</span>
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '12px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>Upload Resume (Optional)</label>
                <div className="file-dropzone" style={{ padding: '16px' }}>
                  <span className="upload-icon">📂</span>
                  <strong style={{ fontSize: '0.8rem', display: 'block' }}>
                    {resumeFile ? resumeFile.name : 'Select PDF or DOCX Resume'}
                  </strong>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                    aria-label="Upload PDF or DOCX resume"
                  />
                </div>
              </div>

              <button
                className="primary-assemble"
                onClick={handleGenerateProfile}
                type="button"
                style={{ height: '40px', marginTop: '20px' }}
              >
                Generate RPG Profile
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
        
        /* 2. UNLOCKED 3-TAB DASHBOARD PAGE */
        <>
          {/* Header Nav */}
          <SideNav battleTag={profile.battleTag} onReset={handleReset} />

          {/* Subheader Navigation Tab Buttons */}
          <div className="github-tabs-bar">
            <div className="github-tabs-container">
              <button
                className={`github-tab ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
                type="button"
              >
                <span>👤</span> Character Sheet
              </button>
              <button
                className={`github-tab ${activeTab === 'ratings' ? 'active' : ''}`}
                onClick={() => setActiveTab('ratings')}
                type="button"
              >
                <span>📊</span> Profile Ratings
              </button>
              <button
                className={`github-tab ${activeTab === 'readme' ? 'active' : ''}`}
                onClick={() => setActiveTab('readme')}
                type="button"
              >
                <span>📝</span> README Generator
              </button>
            </div>
          </div>

          <div className="github-profile-layout">
            
            {/* Left Side: Summary Sidebar */}
            <aside className="github-sidebar">
              {/* Profile Card */}
              <ProfilePanel profile={profile} />

              {/* Theme Customizer widget */}
              <section className="card" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 10px 0' }}>🎨 Switch Profile Theme</h3>
                <div className="theme-pill-grid">
                  {[
                    { id: 'github-dark', name: 'Dark 🖤' },
                    { id: 'github-light', name: 'Light 🤍' },
                    { id: 'github-dim', name: 'Dim 🐨' },
                    { id: 'github-cyberpunk', name: 'Cyberpunk ⚡' },
                    { id: 'github-sakura', name: 'Sakura 🌸' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      className={`theme-btn ${activeTheme === theme.id ? 'active' : ''}`}
                      onClick={() => setActiveTheme(theme.id)}
                      type="button"
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </section>

              {/* Character Origin selector customization */}
              <OriginSelector origins={originThemes} />

              {/* Resume Upgrader widget */}
              <section className="card" id="resume-uploader" style={{ padding: '16px' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 600, margin: '0 0 10px 0' }}>📂 Resume Upgrader</h3>
                <div className="file-dropzone" style={{ padding: '12px' }}>
                  <span className="upload-icon">📂</span>
                  <strong style={{ fontSize: '0.78rem', display: 'block' }}>Upload Resume (PDF/DOCX)</strong>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleSidebarResumeUpload}
                    aria-label="Upload PDF or DOCX resume"
                  />
                </div>
              </section>
            </aside>

            {/* Right Side: Tabbed Content Panel */}
            <section className="github-content">
              {successMessage && (
                <div className="card" style={{ borderColor: 'var(--git-green)', background: 'rgba(46, 164, 79, 0.1)', color: 'var(--git-green)', fontWeight: 600, fontSize: '0.82rem', padding: '12px' }}>
                  🏆 SUCCESS: {successMessage}
                </div>
              )}

              {loading && (
                <section className="card loading-overlay" style={{ padding: '16px' }}>
                  <div className="spinner"></div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Syncing sandbox profile details...</span>
                </section>
              )}

              {/* TAB 1: CHARACTER SHEET OVERVIEW */}
              {activeTab === 'overview' && (
                <>
                  {/* Combat Statistics Panel */}
                  <StatPanel stats={profile.stats} />

                  {/* Activity Calendar Chart */}
                  <section className="card contrib-calendar" style={{ padding: '20px' }}>
                    <div className="section-head">
                      <h3>Activity Calendar</h3>
                      <p className="subtle">Daily developer activity levels logged in the sandbox simulation.</p>
                    </div>
                    <div className="contrib-grid-wrapper">
                      <div className="contrib-grid">
                        {Array.from({ length: 105 }).map((_, idx) => {
                          const level = idx % 11 === 0 ? 'level-4' : idx % 7 === 0 ? 'level-3' : idx % 5 === 0 ? 'level-2' : idx % 3 === 0 ? 'level-1' : '';
                          return <div key={idx} className={`contrib-box ${level}`} title="Contribution activity square"></div>;
                        })}
                      </div>
                      <div className="contrib-footer">
                        <span>Learn how we audit contribution logs</span>
                        <div className="contrib-legend">
                          <span>Less</span>
                          <div className="contrib-box"></div>
                          <div className="contrib-box level-1"></div>
                          <div className="contrib-box level-2"></div>
                          <div className="contrib-box level-3"></div>
                          <div className="contrib-box level-4"></div>
                          <span>More</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Repository Quests */}
                  <QuestBoard repositories={profile.repositories} />

                  {/* Achievements Vault */}
                  <AchievementVault achievements={profile.achievements} />

                  {/* Language segment bar & Skill Tree */}
                  <section className="card" style={{ padding: '24px' }}>
                    <div className="section-head">
                      <h3>Language Distribution &amp; Skill Tree</h3>
                      <p className="subtle">Codebase language percentages compiled from repository bytes alongside core developer skills.</p>
                    </div>
                    <div className="lang-distribution-bar">
                      {profile.skillTree.filter(s => s.branch === 'Core Magic' || s.branch === 'Deep Systems').map((skill, idx) => {
                        const colors = ['#f1e05a', '#3572A5', '#00ADD8', '#bc8cff', '#58a6ff'];
                        return (
                          <div
                            key={skill.name}
                            className="lang-distribution-segment"
                            style={{
                              width: `${100 / Math.max(1, profile.skillTree.filter(s => s.branch === 'Core Magic' || s.branch === 'Deep Systems').length)}%`,
                              backgroundColor: colors[idx % colors.length]
                            }}
                            title={`${skill.name}: ${skill.level}%`}
                          ></div>
                        );
                      })}
                    </div>
                    <SkillTree skills={profile.skillTree} />
                  </section>

                  {/* Diagnostic report */}
                  <AnalysisReport report={profile.analysis} />
                </>
              )}

              {/* TAB 2: PROFILE RATINGS */}
              {activeTab === 'ratings' && rating && (
                <section className="card" id="rating-breakdown" style={{ padding: '20px' }}>
                  <div className="section-head">
                    <h3>Profile Integrity Ratings</h3>
                    <p className="subtle">Quantitative scores evaluating completeness, activity volumes, and repository social impact.</p>
                  </div>
                  <div className="rating-breakdown-card">
                    <div className="rating-grid">
                      <div className="rating-bar-container">
                        <div className="rating-bar-label">
                          <span>Profile Completeness</span>
                          <strong>{rating.completeness}%</strong>
                        </div>
                        <div className="rating-bar-track">
                          <div className="rating-bar-fill" style={{ width: `${rating.completeness}%` }}></div>
                        </div>
                      </div>

                      <div className="rating-bar-container">
                        <div className="rating-bar-label">
                          <span>Contribution Consistency</span>
                          <strong>{rating.consistency}%</strong>
                        </div>
                        <div className="rating-bar-track">
                          <div className="rating-bar-fill" style={{ width: `${rating.consistency}%` }}></div>
                        </div>
                      </div>

                      <div className="rating-bar-container">
                        <div className="rating-bar-label">
                          <span>Social Impact</span>
                          <strong>{rating.impact}%</strong>
                        </div>
                        <div className="rating-bar-track">
                          <div className="rating-bar-fill" style={{ width: `${rating.impact}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="tips-box" style={{ marginTop: '14px' }}>
                      <h4>💡 Progression Recommendations</h4>
                      <ul>
                        {rating.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </section>
              )}

              {/* TAB 3: README GENERATOR */}
              {activeTab === 'readme' && (
                <ReadmePanel
                  profile={profile}
                />
              )}

            </section>
          </div>
        </>
      )}

    </div>
  );
}

export default App;
