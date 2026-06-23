import { DeveloperProfile } from '../types/profile';

export function judgeProfile(profile: DeveloperProfile): { roasts: string[], tips: string[] } {
  const roasts: string[] = [];
  const tips: string[] = [];

  // Evaluate Bio
  if (!profile.bio) {
    roasts.push("No bio. Are you a ghost, or just too lazy to type one sentence about yourself?");
    tips.push("Add a bio! Even a simple 'I write code sometimes' is better than an empty void. It helps people know you exist.");
  } else if (profile.bio.toLowerCase().includes('enthusiast')) {
    roasts.push("Ah, an 'enthusiast'. That's just a polite way of saying you watched one YouTube tutorial and put it in your bio.");
    tips.push("Try being more specific in your bio about what you actually build or work on instead of using vague buzzwords.");
  }

  // Evaluate Location
  if (!profile.location) {
    roasts.push("No location set. Where do you live? In the node_modules folder?");
    tips.push("Set your location. It helps with networking and lets recruiters know what timezone you're ignoring them from.");
  }

  // Evaluate Activity
  if (profile.totalCommits < 50) {
    roasts.push(`Only ${profile.totalCommits} commits in the last year? Do you type with your elbows?`);
    tips.push("Try to commit more regularly. Break your work into smaller, logical commits instead of pushing everything once a month.");
  } else if (profile.totalCommits > 2000) {
    roasts.push(`${profile.totalCommits} commits. Have you heard of 'squashing' or do you just commit every time you add a semicolon?`);
    tips.push("High activity is great, but ensure your commits are meaningful. Consider squashing minor typos and formatting changes.");
  }

  // Evaluate Repos
  if (profile.pinnedTrash && profile.pinnedTrash.length === 0) {
    roasts.push("No pinned repositories. Either you have nothing to show, or everything you have is too embarrassing to pin.");
    tips.push("Pin your best up to 6 repositories on your GitHub profile. It's the first thing people see.");
  } else if (profile.pinnedTrash && profile.pinnedTrash.every(repo => repo.stars === 0)) {
    roasts.push("None of your pinned repos have stars. Maybe try writing something useful?");
    tips.push("Promote your open source work. Add good READMEs to your pinned projects to help people understand and star them.");
  }

  // Evaluate Social
  if (profile.followers === 0) {
    roasts.push("0 followers. Not even your alt accounts follow you.");
    tips.push("Engage with the community! Contribute to open source, open useful issues, or just participate in discussions.");
  }

  // Fallback if somehow they are perfect (unlikely)
  if (roasts.length === 0) {
    roasts.push("Your profile is so average that I couldn't even find anything to roast. How boring.");
  }
  if (tips.length === 0) {
    tips.push("Keep doing what you're doing, I guess. You're doing okay.");
  }

  return { roasts, tips };
}
