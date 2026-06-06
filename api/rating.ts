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
        tip: 'Set a profile picture or avatar image to personalize your developer presence.' 
      },
      { 
        id: 'name', 
        name: 'Profile Display Name', 
        checked: !!profile.name && profile.name !== 'Adventurer Coder' && profile.name.trim() !== '', 
        weight: 10, 
        tip: 'Add your full display name so collaborators can recognize your real-world identity.' 
      },
      { 
        id: 'username', 
        name: 'Verified GitHub Username', 
        checked: !!profile.battleTag && !profile.battleTag.startsWith('Adventurer#'), 
        weight: 15, 
        tip: 'Authenticate with a custom GitHub username rather than browsing in sandbox mode.' 
      },
      { 
        id: 'guild', 
        name: 'Guild Affiliation (Company)', 
        checked: !!profile.guild && profile.guild !== 'Independent Mercenary' && profile.guild.trim() !== '', 
        weight: 10, 
        tip: 'List a company or organization in your GitHub settings to show off your guild.' 
      },
      { 
        id: 'skills', 
        name: 'Technical Skills Registry (>3)', 
        checked: !!(profile.skillTree && profile.skillTree.length >= 3), 
        weight: 15, 
        tip: 'Build a comprehensive skill tree by listing languages or parsing your technical resume.' 
      },
      { 
        id: 'repos', 
        name: 'Quest Log (Public Repos)', 
        checked: !!(profile.repositories && profile.repositories.length > 0), 
        weight: 10, 
        tip: 'Publish public repositories to build up your code quest logs.' 
      },
      { 
        id: 'achievements', 
        name: 'Achievements & Milestones (>1)', 
        checked: !!(profile.achievements && profile.achievements.length > 1), 
        weight: 10, 
        tip: 'Unlock achievements by committing code, merging pull request raids, and collecting stargazers.' 
      },
      { 
        id: 'commits', 
        name: 'Activity Records (>50 Commits)', 
        checked: commitsVal >= 50, 
        weight: 10, 
        tip: 'Push code regularly to establish a solid commit record.' 
      },
      { 
        id: 'stars', 
        name: 'Social Impact (Stars > 0)', 
        checked: starsVal > 0, 
        weight: 10, 
        tip: 'Gather stargazer stars on your repositories to make an impact in the open-source grid.' 
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
    let rank = 'Bronze IV';
    if (powerLevel > 85) rank = 'Challenger I';
    else if (powerLevel > 70) rank = 'Diamond IV';
    else if (powerLevel > 55) rank = 'Gold III';
    else if (powerLevel > 35) rank = 'Silver II';

    // 5. Generate highly personalized tips based on actual data
    const personalTips: string[] = [];

    // Generic names check
    if (profile.repositories && profile.repositories.length > 0) {
      const genericRepos = profile.repositories.filter(r => 
        ['test', 'hello', 'hello-world', 'demo', 'sandbox', 'practice', 'analysis'].some(w => r.name.toLowerCase().includes(w))
      );
      if (genericRepos.length > 0) {
        personalTips.push(`Your repository name '${genericRepos[0].name}' is somewhat generic. Try naming projects descriptively to showcase distinct coding quests.`);
      }

      // Stars check
      const unstarredRepos = profile.repositories.filter(r => r.stars === 0);
      if (unstarredRepos.length > 0) {
        personalTips.push(`Your repository '${unstarredRepos[0].name}' has zero stars. Polish its README, add screenshots, and share it with peers to gather stargazer favor!`);
      }
    }

    // Guild Check
    if (profile.guild === 'Independent Mercenary') {
      personalTips.push("You are listed as an 'Independent Mercenary'. Update the 'Company' field in your GitHub profile to affiliate with a specific organization and boost your team rating.");
    }

    // Skill Tree branch checks
    if (profile.skillTree) {
      const hasSystems = profile.skillTree.some(s => s.branch === 'Deep Systems');
      const hasFrontend = profile.skillTree.some(s => s.branch === 'Core Magic');
      
      if (!hasSystems && hasFrontend) {
        personalTips.push("Your spellbook is front-end heavy. Try learning low-level magic like Go, Rust, or C++ to unlock Systems engineering quests.");
      } else if (hasSystems && !hasFrontend) {
        personalTips.push("Your spellbook focuses on backend runic math. Pick up TypeScript/React UI skills so you can forge responsive mirrors for your command pipelines.");
      }
    }

    // PR checks
    if (prsVal < 3) {
      personalTips.push(`With only ${prsVal} merged PRs, your collaboration record is raw. Contribute bug fixes or open-source additions to other guilds to unlock new trophies.`);
    }

    // Fallbacks
    if (personalTips.length === 0) {
      personalTips.push("Exceptional stats! Keep clearing high-difficulty quests and mentoring other adventurers to maintain your Challenger standing.");
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
