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
    const publicHeaders: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'developer-rpg-profile-generator',
    };

    const headers: Record<string, string> = { ...publicHeaders };

    if (accessToken) {
      headers['Authorization'] = `token ${accessToken}`;
    } else if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // Determine helper to get request headers to avoid fine-grained scoped token filter bugs
    const getRequestHeaders = () => {
      return (!accessToken && GITHUB_TOKEN) ? publicHeaders : headers;
    };

    // 1. Fetch User Profile
    let userProfileUrl = 'https://api.github.com/user';
    if (!accessToken && username) {
      userProfileUrl = `https://api.github.com/users/${encodeURIComponent(username)}`;
    }

    let userRes = await fetch(userProfileUrl, { headers: getRequestHeaders() });
    if (!userRes.ok && !accessToken && GITHUB_TOKEN) {
      userRes = await fetch(userProfileUrl, { headers });
    }
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
    let reposRes = await fetch(reposUrl, { headers: getRequestHeaders() });
    if (!reposRes.ok && !accessToken && GITHUB_TOKEN) {
      reposRes = await fetch(reposUrl, { headers });
    }
    let reposData = [];
    if (reposRes.ok) {
      reposData = await reposRes.json();
    }

    // 3. Fetch Commits Count (last year)
    let totalCommits = 0;
    try {
      const commitSearchUrl = `https://api.github.com/search/commits?q=author:${encodeURIComponent(login)}`;
      const searchHeaders = {
        ...getRequestHeaders(),
        Accept: 'application/vnd.github.cloak-preview+json',
      };
      let commitSearchRes = await fetch(commitSearchUrl, { headers: searchHeaders });
      if (!commitSearchRes.ok && !accessToken && GITHUB_TOKEN) {
        commitSearchRes = await fetch(commitSearchUrl, {
          headers: {
            ...headers,
            Accept: 'application/vnd.github.cloak-preview+json',
          },
        });
      }
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
      let prSearchRes = await fetch(prSearchUrl, { headers: getRequestHeaders() });
      if (!prSearchRes.ok && !accessToken && GITHUB_TOKEN) {
        prSearchRes = await fetch(prSearchUrl, { headers });
      }
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
      let eventsRes = await fetch(eventsUrl, { headers: getRequestHeaders() });
      if (!eventsRes.ok && !accessToken && GITHUB_TOKEN) {
        eventsRes = await fetch(eventsUrl, { headers });
      }
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
        let branch = 'Spaghetti Arts';
        if (['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Svelte', 'Vue'].includes(lang)) {
          branch = 'Browser Crashing';
        } else if (['Go', 'Rust', 'C++', 'C', 'Zig'].includes(lang)) {
          branch = 'Segfault Generation';
        } else if (['Python', 'R', 'Julia'].includes(lang)) {
          branch = 'Indentation Errors';
        } else if (['Java', 'C#', 'Ruby', 'PHP'].includes(lang)) {
          branch = 'Legacy Maintenance';
        }
        skills.push({ name: `${lang} Mastery`, level, branch });
      });
    } else {
      // Defaults if no languages found
      skills.push({ name: 'Copy-Pasting JS', level: 60, branch: 'Browser Crashing' });
      skills.push({ name: 'Using !important', level: 99, branch: 'Legacy Maintenance' });
    }

    // Add generic developer lifecycle skills
    skills.push({ name: 'Googling Error Messages', level: Math.min(99, 50 + reposData.length * 3), branch: 'Desperation' });
    skills.push({ name: 'Testing in Production', level: Math.min(99, 30 + totalPRs * 4), branch: 'Recklessness' });
    skills.push({ name: 'Breaking the Build', level: Math.min(99, 45 + Math.floor(totalCommits / 25)), branch: 'Chaos' });

    // 8. Classify character based on top language
    let className = 'StackOverflow Copy-Paster';
    let specialization = 'Procrastination';
    if (sortedLanguages.length > 0) {
      const topLang = sortedLanguages[0][0];
      specialization = topLang;
      if (['TypeScript', 'JavaScript'].includes(topLang)) {
        className = 'Div Centering Expert';
      } else if (['Python'].includes(topLang)) {
        className = 'Prompt Engineer';
      } else if (['Go', 'Rust'].includes(topLang)) {
        className = 'Rust Evangelist (Annoying)';
      } else if (['C++', 'C'].includes(topLang)) {
        className = 'Memory Leak Creator';
      } else if (['Java', 'C#'].includes(topLang)) {
        className = 'Enterprise Boilerplater';
      } else if (['HTML', 'CSS'].includes(topLang)) {
        className = 'Color Hex Memorizer';
      } else if (['Ruby', 'PHP'].includes(topLang)) {
        className = 'Legacy Code Whisperer';
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

    let rank = 'Keyboard Smasher';
    if (powerLevel > 85) rank = "Basement Dweller (Mom's Favorite)";
    else if (powerLevel > 70) rank = '10x Developer (Self-Proclaimed)';
    else if (powerLevel > 55) rank = 'StackOverflow Dependent';
    else if (powerLevel > 35) rank = 'Hello World Enthusiast';

    // 10. Generate dynamic stats array
    const stats: Stat[] = [
      { label: 'Commits', value: totalCommits, modifier: `Most are "fixed typo"` },
      { label: 'Merged PRs', value: totalPRs, modifier: `Abandoned ${totalPRs * 3} others` },
      { label: 'Stars Earned', value: totalStars, modifier: totalStars < 5 ? `Begged mom for them` : `Bought them on Fiverr` },
      { label: 'Contrib Streak', value: `${streak} days`, modifier: streak > 10 ? 'Touch grass immediately.' : 'Too lazy for a streak.' },
    ];

    // 10.5. Scrape real achievements from user's GitHub profile page
    let scrapedAchievements: Achievement[] = [];
    try {
      const htmlRes = await fetch(`https://github.com/${encodeURIComponent(login)}`);
      if (htmlRes.ok) {
        const html = await htmlRes.text();
        
        // Match Pro label
        if (html.includes('title="Label: Pro"') || html.includes('Pro</span>') || html.includes('class="label-pro"') || html.toLowerCase().includes('pro status')) {
          scrapedAchievements.push({ title: 'Pro status', tier: 'Gold', detail: 'Unlocked Pro status highlight on GitHub' });
        }
        
        // Common GitHub achievements
        const possibleAchievements = [
          { name: 'Pair Extraordinaire', tier: 'Silver', detail: 'Co-authored commits in public repositories' },
          { name: 'Pull Shark', tier: 'Gold', detail: 'Merged multiple pull request raids' },
          { name: 'YOLO', tier: 'Cyan', detail: 'Merged pull requests directly without review' },
          { name: 'Quickdraw', tier: 'Silver', detail: 'Merged a pull request within minutes' },
          { name: 'Arctic Code Vault Contributor', tier: 'Bronze', detail: 'Preserved code in the Arctic Vault archive' },
          { name: 'Heart on your sleeve', tier: 'Bronze', detail: 'Sponsor of active developers' }
        ];

        possibleAchievements.forEach(ach => {
          if (html.includes(ach.name)) {
            let finalName = ach.name;
            if (ach.name === 'Pull Shark') {
              const pullSharkCountMatch = html.match(/Pull Shark\s*x\s*(\d+)/i);
              if (pullSharkCountMatch) {
                finalName += ` x${pullSharkCountMatch[1]}`;
              }
            }
            scrapedAchievements.push({
              title: finalName,
              tier: ach.tier,
              detail: ach.detail
            });
          }
        });
      }
    } catch (e) {
      console.error('Failed to scrape achievements:', e);
    }

    // 11. Create achievements list
    const achievements: Achievement[] = [
      { title: 'Signed Up', tier: 'Bronze', detail: 'Finally figured out how to create an account' },
      ...scrapedAchievements
    ];

    if (totalCommits >= 1000 && !scrapedAchievements.some(a => a.title.includes('Commit Overlord'))) {
      achievements.push({ title: 'Script Kiddie', tier: 'Gold', detail: 'Probably using a script to fake these 1000+ commits' });
    } else if (totalCommits >= 100 && !scrapedAchievements.some(a => a.title.includes('Code Crusader'))) {
      achievements.push({ title: 'Typo Fixer', tier: 'Silver', detail: 'Cleared 100 commits (mostly README typos)' });
    }

    if (totalPRs >= 20 && !scrapedAchievements.some(a => a.title.includes('Guild Champion'))) {
      achievements.push({ title: 'Annoying Reviewer', tier: 'Emerald', detail: 'Spammed 20+ pull requests' });
    } else if (totalPRs >= 1 && !scrapedAchievements.some(a => a.title.includes('First Contribution'))) {
      achievements.push({ title: 'LGTM', tier: 'Bronze', detail: 'Merged first PR without testing' });
    }

    if (totalStars >= 50 && !scrapedAchievements.some(a => a.title.includes('Celebrity Sage'))) {
      achievements.push({ title: 'Main Character Syndrome', tier: 'Cyan', detail: 'Fame exceeds 50 stargazers' });
    } else if (totalStars >= 5 && !scrapedAchievements.some(a => a.title.includes('Star Gatherer'))) {
      achievements.push({ title: 'Participation Trophy', tier: 'Silver', detail: 'Earned 5+ repository stars' });
    }

    if (userData.followers >= 50 && !scrapedAchievements.some(a => a.title.includes('Guild Leader'))) {
      achievements.push({ title: 'Cult Leader', tier: 'Gold', detail: 'Commanding a following of 50+ bots' });
    }

    if (streak >= 14 && !scrapedAchievements.some(a => a.title.includes('Flame Keeper'))) {
      achievements.push({ title: 'No Social Life', tier: 'Cyan', detail: 'Maintained a 14+ day contribution streak' });
    }

    // 12. Create quests list from repositories
    const repositories: RepositoryQuest[] = reposData.slice(0, 5).map((repo: any, index: number) => {
      let questType = 'Spaghetti Code';
      if (repo.language === 'TypeScript' || repo.language === 'JavaScript') questType = 'Button Centering Saga';
      else if (repo.language === 'Python') questType = 'Jupyter Notebook Mess';
      else if (repo.language === 'Go' || repo.language === 'Rust') questType = 'Unnecessary Rewrite';
      else if (repo.language === 'CSS' || repo.language === 'HTML') questType = 'Z-Index Nightmare';

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
      `${specialization} Obsession`,
      totalCommits > 150 ? 'Quantity over Quality' : 'Barely Working',
    ];
    if (totalStars > 10) strengths.push('Good at Begging for Stars');

    const weaknesses = [];
    if (totalPRs < 5) weaknesses.push('Afraid of Code Reviews');
    if (totalStars < 2) weaknesses.push('Invisible to the World');
    if (totalCommits < 50) weaknesses.push('Too Lazy to Commit');
    if (weaknesses.length === 0) weaknesses.push("Thinks they are perfect (they aren't)");

    const missingSkills = [];
    if (!skills.some(s => s.name.startsWith('TypeScript'))) missingSkills.push('Types? Never heard of em');
    if (totalPRs < 10) missingSkills.push('Writing Clean Code');
    if (missingSkills.length === 0) missingSkills.push('Social Skills', 'Leaving the House');

    const getInitials = (nameStr: string) => {
      const parts = nameStr.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return nameStr.slice(0, 2).toUpperCase();
    };

    const profile: DeveloperProfile = {
      name: userData.name || login,
      title: `Tier: ${rank}`,
      className,
      specialization,
      guild: userData.company || 'Unemployed',
      avatarInitials: getInitials(userData.name || login),
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      blog: userData.blog,
      followers: userData.followers,
      following: userData.following,
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
        nextQuest: totalPRs < 3 ? 'Actually try contributing instead of hoarding repos.' : 'Write a test that actually tests something.',
      },
    };

    res.status(200).json(profile);
  } catch (error: any) {
    console.error('Error in github API endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
