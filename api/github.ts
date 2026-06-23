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

    // 3. Fetch exact Commits and Streak from HTML contribution graph
    let totalCommits = 0;
    let streak = 0;
    try {
      const contribHtmlRes = await fetch(`https://github.com/users/${encodeURIComponent(login)}/contributions`);
      if (contribHtmlRes.ok) {
        const html = await contribHtmlRes.text();
        const match = html.match(/(\d{1,3}(?:,\d{3})*)\s+contributions\s+in\s+the\s+last\s+year/i);
        if (match) {
          totalCommits = parseInt(match[1].replace(/,/g, ''), 10);
        }

        const rects = [...html.matchAll(/data-date="(\d{4}-\d{2}-\d{2})".*?data-level="(\d+)"/g)];
        if (rects.length > 0) {
          rects.reverse();
          for (const [, , level] of rects) {
            if (parseInt(level, 10) > 0) {
              streak++;
            } else {
              if (streak === 0) continue; // Skip trailing zero days today/yesterday if streak haven't started counting backwards
              break;
            }
          }
        }
      } else {
        totalCommits = reposData.reduce((acc: number, repo: any) => acc + (repo.size ? Math.floor(repo.size / 100) : 5), 0);
        streak = 0;
      }
    } catch (e) {
      totalCommits = reposData.length * 2; 
      streak = 0;
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
      }
    } catch (e) {
      totalPRs = 0;
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

    // 9. Calculate new grading logic
    let grade = 'F';
    if (totalCommits > 1000 && streak > 30) grade = 'S';
    else if (totalCommits > 500) grade = 'A';
    else if (totalCommits > 200) grade = 'B';
    else if (totalCommits > 50) grade = 'C';
    else if (totalCommits > 10) grade = 'D';

    let title = 'Keyboard Smasher';
    if (grade === 'S') title = "Basement Dweller (Mom's Favorite)";
    else if (grade === 'A') title = '10x Developer (Self-Proclaimed)';
    else if (grade === 'B') title = 'StackOverflow Dependent';
    else if (grade === 'C') title = 'Hello World Enthusiast';

    // 10. Generate toxic traits
    const toxicTraits: string[] = [];
    if (sortedLanguages.length > 0) {
      const topLang = sortedLanguages[0][0];
      if (['TypeScript', 'JavaScript'].includes(topLang)) {
        toxicTraits.push('Relies on npm for left-pad. Has 2GB node_modules per project.');
      } else if (topLang === 'Python') {
        toxicTraits.push('Thinks pip install is programming. Doesn\'t understand pointers.');
      } else if (['Go', 'Rust'].includes(topLang)) {
        toxicTraits.push('Mentions memory safety at parties. No one invites them back.');
      } else if (['C++', 'C'].includes(topLang)) {
        toxicTraits.push('Creates memory leaks intentionally to feel powerful.');
      } else if (['HTML', 'CSS'].includes(topLang)) {
        toxicTraits.push('Claims to be a software engineer. Uses !important to solve life problems.');
      } else if (['Java', 'C#'].includes(topLang)) {
        toxicTraits.push('Writes AbstractSingletonProxyFactoryBean patterns for a todo app.');
      } else {
        toxicTraits.push(`Writes ${topLang}. Refuses to elaborate.`);
      }
    } else {
      toxicTraits.push('Has zero public code. A ghost or a manager.');
    }

    if (totalStars < 2) toxicTraits.push('Nobody stars their repos. Even their mom forgot.');
    if (totalPRs < 3) toxicTraits.push('Hoards code locally. Afraid of PR rejection.');

    // 11. Activity Roast
    let activityRoast = 'You barely do anything.';
    if (streak > 20) activityRoast = `You have a ${streak} day streak. Please go outside, the sun misses you.`;
    else if (totalCommits > 500) activityRoast = `You made ${totalCommits} commits, but how many were just "fix typo"?`;
    else if (totalPRs > 10) activityRoast = `You merged ${totalPRs} PRs. Most of them were probably dependabot updates.`;

    // 12. Pinned Trash
    const pinnedTrash: RepositoryQuest[] = reposData.slice(0, 6).map((repo: any) => {
      let roast = 'Just another forgotten side project.';
      if (repo.stargazers_count === 0) roast = '0 stars. Truly groundbreaking work.';
      else if (repo.language === 'HTML') roast = 'A static site in 2026? Groundbreaking.';
      else if (repo.size < 100) roast = 'Too small to matter. Probably just a README.';
      else if (repo.fork) roast = 'A fork. You didn\'t even write this.';

      return {
        name: repo.name,
        stars: repo.stargazers_count || 0,
        language: repo.language || 'Text',
        description: repo.description || 'No description provided, because why bother documenting trash?',
        roast,
      };
    });

    const profile: DeveloperProfile = {
      login,
      name: userData.name || login,
      title,
      company: userData.company || 'Unemployed',
      avatarUrl: userData.avatar_url,
      bio: userData.bio,
      location: userData.location,
      blog: userData.blog,
      followers: userData.followers,
      following: userData.following,
      totalCommits,
      totalPRs,
      totalStars,
      streak,
      grade,
      pinnedTrash,
      toxicTraits,
      activityRoast,
    };

    res.status(200).json(profile);
  } catch (error: any) {
    console.error('Error in github API endpoint:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
