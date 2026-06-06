/* eslint-disable */
import type { DeveloperProfile, Stat, Achievement, RepositoryQuest, SkillNode } from '../src/types/profile';

// Optional token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

export default async function handler(req: any, res: any) {
  const { code, username } = req.query;

  try {
    let accessToken = '';

    // If code is provided, perform OAuth flow to exchange it for an access token
    if (code) {
      const client_id = process.env.VITE_GITHUB_CLIENT_ID || '';
      const client_secret = process.env.GITHUB_CLIENT_SECRET || '';

      if (!client_id || !client_secret) {
        throw new Error('GitHub OAuth credentials are not configured in the environment.');
      }

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();
      if (tokenData.error) {
        throw new Error(`OAuth error: ${tokenData.error_description || tokenData.error}`);
      }
      accessToken = tokenData.access_token;
    }

    // Determine target headers
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'developer-rpg-profile-generator',
    };

    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    } else if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // 1. Fetch User Profile
    let userProfileUrl = 'https://api.github.com/user';
    if (!accessToken && username) {
      userProfileUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    }

    const userRes = await fetch(userProfileUrl, { headers });
    if (!userRes.ok) {
      const errText = await userRes.text();
      throw new Error(`GitHub Profile Fetch Failed: Status ${userRes.status}. Details: ${errText}`);
    }
    const userData = await userRes.json();
    const login = userData.login;

    // 2. Fetch Repositories
    let reposUrl = 'https://api.github.com/user/repos?per_page=50&sort=updated';
    if (!accessToken) {
      reposUrl = `https://api.github.com/users/${encodeURIComponent(login)}/repos?per_page=50&sort=updated`;
    }
    const reposRes = await fetch(reposUrl, { headers });
    let reposData = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    // 3. Fetch Commits Count (last year)
    let totalCommits = 0;
    try {
      const commitSearchUrl = `https://api.github.com/search/commits?q=author:${encodeURIComponent(login)}`;
      const commitSearchRes = await fetch(commitSearchUrl, {
        headers: {
          ...headers,
          Accept: 'application/vnd.github.cloak-preview+json',
        },
      });
      if (commitSearchRes.ok) {
        const commitSearchData = await commitSearchRes.json();
        totalCommits = commitSearchData.total_count || 0;
      } else {
        // Fallback calculation if rate-limited
        totalCommits = reposData.reduce((acc: number, repo: any) => acc + (repo.size ? Math.floor(repo.size / 100) : 5), 120);
      }
    } catch (e) {
      totalCommits = 120; // Default fallback
    }

    // 4. Fetch Merged PRs
    let totalPRs = 0;
    try {
      const prSearchUrl = `https://api.github.com/search/issues?q=author:${encodeURIComponent(login)}+type:pr+is:merged`;
      const prSearchRes = await fetch(prSearchUrl, { headers });
      if (prSearchRes.ok) {
        const prSearchData = await prSearchRes.json();
        totalPRs = prSearchData.total_count || 0;
      } else {
        totalPRs = Math.max(5, Math.floor(reposData.length * 1.5));
      }
    } catch (e) {
      totalPRs = 8;
    }

    // 5. Fetch Events to calculate contribution streak
    let streak = 0;
    try {
      const eventsUrl = `https://api.github.com/users/${encodeURIComponent(login)}/events/public?per_page=100`;
      const eventsRes = await fetch(eventsUrl, { headers });
      if (eventsRes.ok) {
        const events = await eventsRes.json();
        
        // Extract unique days of contributions (in local or UTC dates)
        const activeDates = new Set<string>();
        if (Array.isArray(events)) {
          events.forEach((event: any) => {
            if (['PushEvent', 'PullRequestEvent', 'IssuesEvent', 'CreateEvent'].includes(event.type) && event.created_at) {
              const dateStr = event.created_at.split('T')[0];
              activeDates.add(dateStr);
            }
          });
        }

        // Calculate consecutive active days
        if (activeDates.size > 0) {
          const sortedDates = Array.from(activeDates).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          let currentStreak = 0;
          let today = new Date();
          let checkDate = new Date(today.toISOString().split('T')[0]);

          // Allow streak to continue if they committed yesterday or today
          let dateIndex = 0;
          let matchFound = true;
          
          while (matchFound && dateIndex < 100) {
            const checkDateStr = checkDate.toISOString().split('T')[0];
            if (activeDates.has(checkDateStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              // If it's today and we don't have a commit, check yesterday to allow the streak to continue
              if (currentStreak === 0) {
                checkDate.setDate(checkDate.getDate() - 1);
                const yesterdayStr = checkDate.toISOString().split('T')[0];
                if (activeDates.has(yesterdayStr)) {
                  currentStreak++;
                  checkDate.setDate(checkDate.getDate() - 1);
                } else {
                  matchFound = false;
                }
              } else {
                matchFound = false;
              }
            }
            dateIndex++;
          }
          streak = currentStreak || 1;
        } else {
          streak = 1;
        }
      } else {
        streak = 3; // Fallback
      }
    } catch (e) {
      streak = 2;
    }

    // 6. Calculate total stars earned
    const totalStars = reposData.reduce((acc: number, repo: any) => acc + (repo.stargazers_count || 0), 0);

    // 7. Calculate Language stats for Skill Tree
    const languageBytes: Record<string, number> = {};
    let totalBytes = 0;
    reposData.forEach((repo: any) => {
      const lang = repo.language;
      const size = repo.size || 0;
      if (lang) {
        languageBytes[lang] = (languageBytes[lang] || 0) + size;
        totalBytes += size;
      }
    });

    const skills: SkillNode[] = [];
    const sortedLanguages = Object.entries(languageBytes).sort((a, b) => b[1] - a[1]);
    
    if (sortedLanguages.length > 0) {
      sortedLanguages.forEach(([lang, bytes]) => {
        const level = Math.max(15, Math.min(99, Math.floor((bytes / totalBytes) * 85) + 15));
        let branch = 'Magical Arts';
        if (['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Svelte', 'Vue'].includes(lang)) {
          branch = 'Core Magic';
        } else if (['Go', 'Rust', 'C++', 'C', 'Zig'].includes(lang)) {
          branch = 'Deep Systems';
        } else if (['Python', 'R', 'Julia'].includes(lang)) {
          branch = 'Rune Control';
        } else if (['Java', 'C#', 'Ruby', 'PHP'].includes(lang)) {
          branch = 'Defense';
        }
        skills.push({ name: `${lang} Mastery`, level, branch });
      });
    } else {
      // Defaults if no languages found
      skills.push({ name: 'JavaScript Mastery', level: 60, branch: 'Core Magic' });
      skills.push({ name: 'HTML/CSS Crafting', level: 50, branch: 'Visual Arts' });
    }

    // Add generic developer lifecycle skills
    skills.push({ name: 'Git & Command Line', level: Math.min(95, 30 + reposData.length * 3), branch: 'Rune Control' });
    skills.push({ name: 'Testing Discipline', level: Math.min(85, 10 + totalPRs * 4), branch: 'Defense' });
    skills.push({ name: 'CI/CD Automation', level: Math.min(90, 15 + Math.floor(totalCommits / 25)), branch: 'Machinery' });

    // 8. Classify character based on top language
    let className = 'Fullstack Paladin';
    let specialization = 'Generalist';
    if (sortedLanguages.length > 0) {
      const topLang = sortedLanguages[0][0];
      specialization = topLang;
      if (['TypeScript', 'JavaScript'].includes(topLang)) {
        className = 'Frontend Mage';
      } else if (['Python'].includes(topLang)) {
        className = 'AI Necromancer';
      } else if (['Go', 'Rust'].includes(topLang)) {
        className = 'Systems Golem';
      } else if (['C++', 'C'].includes(topLang)) {
        className = 'Engine Archmage';
      } else if (['Java', 'C#'].includes(topLang)) {
        className = 'Backend Knight';
      } else if (['HTML', 'CSS'].includes(topLang)) {
        className = 'Pixel Artisan';
      } else if (['Ruby', 'PHP'].includes(topLang)) {
        className = 'Script Rogue';
      }
    }

    // 9. Calculate overall rating/power level (scaled 0-100)
    // Formula: Completeness (30%) + Activity (40%) + Impact (30%)
    const completeness = Math.min(100, 
      (userData.avatar_url ? 10 : 0) +
      (userData.bio ? 20 : 0) +
      (userData.company ? 15 : 0) +
      (userData.blog || userData.email ? 15 : 0) +
      (userData.location ? 15 : 0) +
      (skills.length >= 3 ? 25 : skills.length * 8)
    );

    const activity = Math.min(100, Math.floor((totalCommits / 12) + (totalPRs * 1.8) + (streak * 2)));
    const impact = Math.min(100, Math.floor((totalStars * 4) + (userData.followers * 1.5) + (reposData.length * 0.8)));

    const powerLevel = Math.max(10, Math.min(100, Math.floor(completeness * 0.3 + activity * 0.4 + impact * 0.3)));

    let rank = 'Bronze IV';
    if (powerLevel > 85) rank = 'Challenger I';
    else if (powerLevel > 70) rank = 'Diamond IV';
    else if (powerLevel > 55) rank = 'Gold III';
    else if (powerLevel > 35) rank = 'Silver II';

    // 10. Generate dynamic stats array
    const stats: Stat[] = [
      { label: 'Commits', value: totalCommits, modifier: `+${Math.floor(totalCommits / 52)} weekly avg` },
      { label: 'Merged PRs', value: totalPRs, modifier: `Merged ${totalPRs} raids` },
      { label: 'Stars Earned', value: totalStars, modifier: `Accumulated ${totalStars} favor` },
      { label: 'Contrib Streak', value: `${streak} days`, modifier: streak > 10 ? 'Unstoppable!' : 'Streak active' },
    ];

    // 11. Create achievements list
    const achievements: Achievement[] = [
      { title: 'First Milestone', tier: 'Bronze', detail: 'Created a GitHub account' }
    ];

    if (totalCommits >= 1000) {
      achievements.push({ title: 'Commit Overlord', tier: 'Gold', detail: 'Over 1000 repositories commits logged' });
    } else if (totalCommits >= 100) {
      achievements.push({ title: 'Code Crusader', tier: 'Silver', detail: 'Cleared 100 commits' });
    }

    if (totalPRs >= 20) {
      achievements.push({ title: 'Guild Champion', tier: 'Emerald', detail: '20+ pull requests merged' });
    } else if (totalPRs >= 1) {
      achievements.push({ title: 'First Contribution', tier: 'Bronze', detail: 'Merged first PR raid' });
    }

    if (totalStars >= 50) {
      achievements.push({ title: 'Celebrity Sage', tier: 'Cyan', detail: 'Fame exceeds 50 stargazers' });
    } else if (totalStars >= 5) {
      achievements.push({ title: 'Star Gatherer', tier: 'Silver', detail: 'Earned 5+ repository stars' });
    }

    if (userData.followers >= 50) {
      achievements.push({ title: 'Guild Leader', tier: 'Gold', detail: 'Commanding a following of 50+' });
    }

    if (streak >= 14) {
      achievements.push({ title: 'Flame Keeper', tier: 'Cyan', detail: 'Maintained a 14+ day contribution streak' });
    }

    // 12. Create quests list from repositories
    const repositories: RepositoryQuest[] = reposData.slice(0, 5).map((repo: any, index: number) => {
      let questType = 'Artifact Code';
      if (repo.language === 'TypeScript' || repo.language === 'JavaScript') questType = 'UI Spellbook';
      else if (repo.language === 'Python') questType = 'AI Artifact';
      else if (repo.language === 'Go' || repo.language === 'Rust') questType = 'Engine Core';
      else if (repo.language === 'CSS' || repo.language === 'HTML') questType = 'Visual Forge';

      let difficulty: 'Normal' | 'Hard' | 'Epic' = 'Normal';
      if (repo.stargazers_count > 50) difficulty = 'Epic';
      else if (repo.stargazers_count > 10) difficulty = 'Hard';

      let status: 'Unlocked' | 'Active' | 'Locked' = 'Unlocked';
      if (index === 0) status = 'Active'; // First repo is active
      else if (index === 4) status = 'Locked'; // Last is locked

      return {
        name: repo.name,
        stars: repo.stargazers_count || 0,
        questType,
        difficulty,
        status,
      };
    });

    // 13. Dynamic Analysis
    const strengths = [
      `${specialization} Specialization`,
      totalCommits > 150 ? 'High Code Output' : 'Consistent Contributions',
    ];
    if (totalStars > 10) strengths.push('Open Source Traction');

    const weaknesses = [];
    if (totalPRs < 5) weaknesses.push('PR Participation');
    if (totalStars < 2) weaknesses.push('Public Repository Stars');
    if (totalCommits < 50) weaknesses.push('Low Commit Volume');
    if (weaknesses.length === 0) weaknesses.push('Balanced stats');

    const missingSkills = [];
    if (!skills.some(s => s.name.startsWith('TypeScript'))) missingSkills.push('TypeScript Precision');
    if (totalPRs < 10) missingSkills.push('CI/CD Workflows');
    if (missingSkills.length === 0) missingSkills.push('Database Tuning', 'System Scalability');

    const profile: DeveloperProfile = {
      name: userData.name || login,
      title: `Developer Tier: ${rank}`,
      className,
      specialization,
      guild: userData.company || 'Independent Mercenary',
      avatarInitials: (userData.name || login).slice(0, 2).toUpperCase(),
      powerLevel,
      xpProgress: Math.min(99, Math.floor(((powerLevel % 25) / 25) * 100)),
      rank,
      battleTag: `${login}#${userData.id ? userData.id.toString().slice(-4) : '2842'}`,
      stats,
      achievements,
      repositories,
      skillTree: skills,
      analysis: {
        characterClass: className,
        powerLevel: `${powerLevel}/100`,
        strengths,
        weaknesses,
        missingSkills,
        nextQuest: totalPRs < 3 ? 'Initiate a collaborative pull request on a trending repository.' : 'Forge a test-driven CI/CD workflow for your primary quest.',
      },
    };

    res.status(200).json(profile);
  } catch (error: any) {
    console.error('Error in github API endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
