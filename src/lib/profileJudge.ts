import type { DeveloperProfile } from '../types/profile';

export function judgeProfile(profile: DeveloperProfile): { tips: string[] } {
  const tips: string[] = [];

  // Evaluate Bio
  if (!profile.bio) {
    tips.push("You look like a ghost online. Add a bio! Even a simple 'I write code sometimes' is better than this empty void.");
  } else {
    const bioLen = profile.bio.length;
    if (bioLen < 15) {
      tips.push(`Your bio is "${profile.bio}". Wow, so mysterious. Try expanding it so people know what you actually build.`);
    } else if (profile.bio.toLowerCase().includes('enthusiast')) {
      tips.push("Ah, an 'enthusiast'. Stop using vague buzzwords and tell people what technologies you actually write code in.");
    }
  }

  // Evaluate Avatar
  if (!profile.avatarUrl || profile.avatarUrl.includes('gravatar') || profile.avatarUrl.includes('default')) {
    tips.push("You don't even have a real profile picture. Upload something so people don't think you're a bot.");
  }

  // Evaluate Location
  if (!profile.location) {
    tips.push("You have no location set. Do you live in the node_modules folder? Add a location to help with networking.");
  }

  // Evaluate Activity
  if (profile.totalCommits === 0) {
    tips.push("0 commits. Are you sure you're a developer? Push some code before asking anyone to look at your profile.");
  } else if (profile.totalCommits < 50) {
    tips.push(`Only ${profile.totalCommits} commits this year? Try to commit more regularly instead of pushing everything once a month.`);
  }

  // Evaluate Repos
  if (!profile.pinnedTrash || profile.pinnedTrash.length === 0) {
    tips.push("You have no pinned repositories. Either you have nothing to show, or everything is too embarrassing. Pin your best projects!");
  } else {
    const totalStars = profile.pinnedTrash.reduce((acc, r) => acc + r.stars, 0);
    if (totalStars === 0) {
      tips.push("None of your pinned repos have stars. Add good READMEs so people actually know what they do.");
    }
  }

  // Evaluate Social
  if (profile.followers === 0) {
    tips.push("0 followers. Not even your alt accounts follow you. Try contributing to open source or opening useful issues.");
  }

  // Fallback if somehow they are perfect
  if (tips.length === 0) {
    tips.push("Your profile is weirdly decent. Maybe try writing a blog post so I have something to critique.");
  }

  // Return at most 2 tips for impact
  return { tips: tips.slice(0, 2) };
}
