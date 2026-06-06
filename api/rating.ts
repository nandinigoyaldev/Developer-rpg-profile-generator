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

    // 1. Calculate Completeness (0-100)
    // Checks for fields and lists size
    const details = [
      { name: 'Avatar Icon', check: !!profile.avatarInitials, weight: 10 },
      { name: 'Name & BattleTag', check: !!profile.name && !!profile.battleTag, weight: 15 },
      { name: 'Class & Specialty', check: !!profile.className && !!profile.specialization, weight: 15 },
      { name: 'Guild/Company info', check: !!profile.guild && profile.guild !== 'Independent Mercenary', weight: 15 },
      { name: 'Skills Registry (>3 skills)', check: profile.skillTree && profile.skillTree.length >= 3, weight: 20 },
      { name: 'Achievements & Trophies', check: profile.achievements && profile.achievements.length > 1, weight: 15 },
      { name: 'Quest Logs (repos)', check: profile.repositories && profile.repositories.length > 0, weight: 10 },
    ];

    const completeness = details.reduce((acc, d) => acc + (d.check ? d.weight : 0), 0);

    // 2. Calculate Consistency (0-100)
    // Mapped from Commits, Merged PRs, and Streak
    const commitsStat = profile.stats.find(s => s.label === 'Commits');
    const prsStat = profile.stats.find(s => s.label === 'Merged PRs');
    const streakStat = profile.stats.find(s => s.label === 'Contrib Streak');

    const commitsVal = commitsStat ? Number(commitsStat.value) || 0 : 0;
    const prsVal = prsStat ? Number(prsStat.value) || 0 : 0;
    const streakVal = streakStat ? parseInt(String(streakStat.value)) || 0 : 0;

    const commitScore = Math.min(40, Math.floor(commitsVal / 8)); // 320 commits maxes out
    const prScore = Math.min(30, prsVal * 2); // 15 PRs maxes out
    const streakScore = Math.min(30, streakVal * 1.5); // 20 days streak maxes out
    const consistency = Math.max(10, Math.min(100, commitScore + prScore + streakScore));

    // 3. Calculate Impact (0-100)
    // Mapped from Repository Stars and specific achievements
    const starsStat = profile.stats.find(s => s.label === 'Stars Earned');
    const starsVal = starsStat ? Number(starsStat.value) || 0 : 0;

    const starsScore = Math.min(50, starsVal * 4); // 12.5 stars maxes out
    const repoScore = Math.min(30, (profile.repositories?.length || 0) * 6); // 5 repos maxes out
    const goldCount = profile.achievements?.filter(a => a.tier.toLowerCase() === 'gold').length || 0;
    const silverCount = profile.achievements?.filter(a => a.tier.toLowerCase() === 'silver').length || 0;
    const achievementScore = Math.min(20, goldCount * 12 + silverCount * 6);

    const impact = Math.max(10, Math.min(100, starsScore + repoScore + achievementScore));

    // 4. Calculate Power Level (weighted average)
    // Completeness (30%), Consistency (40%), Impact (30%)
    const powerLevel = Math.max(10, Math.min(100, Math.floor(completeness * 0.3 + consistency * 0.4 + impact * 0.3)));

    // 5. Tier / Rank naming
    let rank = 'Bronze IV';
    if (powerLevel > 85) rank = 'Challenger I';
    else if (powerLevel > 70) rank = 'Diamond IV';
    else if (powerLevel > 55) rank = 'Gold III';
    else if (powerLevel > 35) rank = 'Silver II';

    // 6. Actionable recommendations
    const tips: string[] = [];
    if (completeness < 80) {
      tips.push('Complete your profile: add a bio, company information, or upload a resume to update your skill tree.');
    }
    if (commitsVal < 100) {
      tips.push('Increase your commit volume in active repositories to boost your Consistency score.');
    }
    if (streakVal < 7) {
      tips.push('Build a contribution streak: push commits daily to sustain a Flame Keeper multiplier.');
    }
    if (prsVal < 5) {
      tips.push('Initiate more Pull Requests: merge code changes into upstream repositories to unlock PR Champion achievements.');
    }
    if (starsVal < 5) {
      tips.push('Create high-quality public repositories, share your work, and collect Stargazer endorsements to raise your Impact level.');
    }
    if (tips.length === 0) {
      tips.push('Amazing stats! Pursue Legendary tier by leading open-source raids or mentoring junior developers.');
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      completeness,
      consistency,
      impact,
      powerLevel,
      rank,
      tips,
    });
  } catch (error: any) {
    console.error('Error calculating rating:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
}
