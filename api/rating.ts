/* eslint-disable */
import type { DeveloperProfile } from '../src/types/profile';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    return;
  }

  try {
    const profile: DeveloperProfile = req.body;
    if (!profile) {
      throw new Error('No profile data provided.');
    }

    // Extract stats value helpers
    const commitsStat = profile.stats.find(s => s.label === 'Commits');
    const prsStat = profile.stats.find(s => s.label === 'Merged PRs');
    const streakStat = profile.stats.find(s => s.label === 'Contrib Streak');
    const starsStat = profile.stats.find(s => s.label === 'Stars Earned');

    const commitsVal = commitsStat ? Number(commitsStat.value) || 0 : 0;
    const prsVal = prsStat ? Number(prsStat.value) || 0 : 0;
    const streakVal = streakStat ? parseInt(String(streakStat.value)) || 0 : 0;
    const starsVal = starsStat ? Number(starsStat.value) || 0 : 0;

    // 1. Build Checklist
    const checklist = [
      { 
        id: 'avatar', 
        name: 'Profile Avatar / Photo', 
        checked: !!profile.avatarInitials && profile.avatarInitials.length > 0, 
        weight: 10, 
        tip: 'Upload a picture so we can see who wrote this terrible code.' 
      },
      { 
        id: 'name', 
        name: 'Profile Display Name', 
        checked: !!profile.name && profile.name !== 'Adventurer Coder' && profile.name.trim() !== '', 
        weight: 10, 
        tip: 'Add your real name unless you are too ashamed of your commit history.' 
      },
      { 
        id: 'username', 
        name: 'Verified GitHub Username', 
        checked: !!profile.battleTag && !profile.battleTag.startsWith('Adventurer#'), 
        weight: 15, 
        tip: 'Stop hiding in the sandbox and put in a real GitHub username.' 
      },
      { 
        id: 'guild', 
        name: 'Guild Affiliation (Company)', 
        checked: !!profile.guild && profile.guild !== 'Independent Mercenary' && profile.guild.trim() !== '', 
        weight: 10, 
        tip: 'List a company, or are you still "looking for new opportunities"?' 
      },
      { 
        id: 'skills', 
        name: 'Technical Skills Registry (>3)', 
        checked: !!(profile.skillTree && profile.skillTree.length >= 3), 
        weight: 15, 
        tip: 'You need at least 3 skills to pretend you are a full-stack developer.' 
      },
      { 
        id: 'repos', 
        name: 'Quest Log (Public Repos)', 
        checked: !!(profile.repositories && profile.repositories.length > 0), 
        weight: 10, 
        tip: 'Make a repo public! It\'s okay, nobody is going to steal your spaghetti code.' 
      },
      { 
        id: 'achievements', 
        name: 'Achievements & Milestones (>1)', 
        checked: !!(profile.achievements && profile.achievements.length > 1), 
        weight: 10, 
        tip: 'Unlock achievements. It\'s easier than actually fixing your bugs.' 
      },
      { 
        id: 'commits', 
        name: 'Activity Records (>50 Commits)', 
        checked: commitsVal >= 50, 
        weight: 10, 
        tip: 'Push more code. Empty commit messages don\'t count, but we\'ll pretend they do.' 
      },
      { 
        id: 'stars', 
        name: 'Social Impact (Stars > 0)', 
        checked: starsVal > 0, 
        weight: 10, 
        tip: 'Beg your mom to star your repository so you have at least 1.' 
      }
    ];

    // Compute completeness as sum of checked weights
    const completeness = checklist.reduce((acc, item) => acc + (item.checked ? item.weight : 0), 0);

    // 2. Calculate Consistency (0-100)
    const commitScore = Math.min(40, Math.floor(commitsVal / 8)); // 320 commits maxes out
    const prScore = Math.min(30, prsVal * 2); // 15 PRs maxes out
    const streakScore = Math.min(30, streakVal * 1.5); // 20 days streak maxes out
    const consistency = Math.max(10, Math.min(100, commitScore + prScore + streakScore));

    // 3. Calculate Impact (0-100)
    const starsScore = Math.min(50, starsVal * 4); // 12.5 stars maxes out
    const repoScore = Math.min(30, (profile.repositories?.length || 0) * 6); // 5 repos maxes out
    const goldCount = profile.achievements?.filter(a => a.tier.toLowerCase() === 'gold').length || 0;
    const silverCount = profile.achievements?.filter(a => a.tier.toLowerCase() === 'silver').length || 0;
    const achievementScore = Math.min(20, goldCount * 12 + silverCount * 6);
    const impact = Math.max(10, Math.min(100, starsScore + repoScore + achievementScore));

    // 4. Power level and Rank
    const powerLevel = Math.max(10, Math.min(100, Math.floor(completeness * 0.3 + consistency * 0.4 + impact * 0.3)));
    let rank = 'Keyboard Smasher';
    if (powerLevel > 85) rank = "Basement Dweller (Mom's Favorite)";
    else if (powerLevel > 70) rank = '10x Developer (Self-Proclaimed)';
    else if (powerLevel > 55) rank = 'StackOverflow Dependent';
    else if (powerLevel > 35) rank = 'Hello World Enthusiast';

    // 5. Generate highly personalized tips based on actual data
    const personalTips: string[] = [];

    // Generic names check
    if (profile.repositories && profile.repositories.length > 0) {
      const genericRepos = profile.repositories.filter(r => 
        ['test', 'hello', 'hello-world', 'demo', 'sandbox', 'practice', 'analysis'].some(w => r.name.toLowerCase().includes(w))
      );
      if (genericRepos.length > 0) {
        personalTips.push(`Your repository name '${genericRepos[0].name}' is incredibly uninspired. Nobody wants to look at a 'hello-world' project from 2 years ago.`);
      }

      // Stars check
      const unstarredRepos = profile.repositories.filter(r => r.stars === 0);
      if (unstarredRepos.length > 0) {
        personalTips.push(`Your repository '${unstarredRepos[0].name}' has 0 stars. Did you even try to spam it on LinkedIn?`);
      }
    }

    // Guild Check
    if (profile.guild === 'Independent Mercenary' || profile.guild === 'Unemployed') {
      personalTips.push("You are listed as 'Unemployed'. Maybe spend less time tweaking your VS Code theme and more time sending out resumes.");
    }

    // Skill Tree branch checks
    if (profile.skillTree) {
      const hasSystems = profile.skillTree.some(s => s.branch === 'Segfault Generation');
      const hasFrontend = profile.skillTree.some(s => s.branch === 'Browser Crashing');
      
      if (!hasSystems && hasFrontend) {
        personalTips.push("You only know frontend? Try learning a real systems language so you can write memory leaks instead of just infinite loops.");
      } else if (hasSystems && !hasFrontend) {
        personalTips.push("You write backend code but your CSS is trash. Learn how to center a div before you start rewriting everything in Rust.");
      }
    }

    // PR checks
    if (prsVal < 3) {
      personalTips.push(`Only ${prsVal} merged PRs? I guess you're too scared of code reviews to contribute to anyone else's codebase.`);
    }

    // Fallbacks
    if (personalTips.length === 0) {
      personalTips.push("Honestly, we couldn't find much to roast. You're probably using a secondary account or just really boring.");
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      completeness,
      consistency,
      impact,
      powerLevel,
      rank,
      checklist,
      tips: personalTips
    });
  } catch (error: any) {
    console.error('Error calculating rating:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
}
