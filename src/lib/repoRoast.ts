export function generateRepoRoast(repoStats: any): { roast: string, grade: string, tips: string[] } {
  const { stars, forks, issues, hasReadme, language, structure, description, isLive, license, topics } = repoStats;

  let roast = '';
  let grade = 'F';
  const tips: string[] = [];

  // Roast and Grade logic
  if (!hasReadme) {
    roast = "No README. Are we supposed to guess what this spaghetti code does by reading your commit messages? Oh wait, those probably just say 'fix'.";
    grade = 'F';
  } else if (stars === 0 && forks === 0) {
    roast = "0 stars. 0 forks. It's like a graveyard in here, except graveyards have visitors.";
    grade = 'D';
  } else if (issues > 20 && issues > stars) {
    roast = `More issues (${issues}) than stars (${stars}). Did you write this with your eyes closed, or do you just hate your users?`;
    grade = 'F';
  } else if (language === 'HTML' || language === 'CSS') {
    roast = "Ah yes, 'programming'. Nice div centering skills you got there.";
    grade = 'C';
  } else if (stars > 100) {
    roast = `Wow, ${stars} stars. Did you pay for bots, or did you just copy something from StackOverflow that happened to be useful?`;
    grade = 'A';
  } else {
    roast = "Another mediocre repository that will be abandoned in 2 weeks. Groundbreaking.";
    grade = 'C';
  }

  // Adding some funny structure roasts if possible
  if (structure && structure.length > 0) {
    const hasNodeModules = structure.some((f: any) => f.name === 'node_modules');
    if (hasNodeModules) {
      roast += " And you committed node_modules. Absolute menace to society.";
      grade = 'F';
    }
    const hasEnv = structure.some((f: any) => f.name === '.env');
    if (hasEnv) {
      roast += " You committed your .env file. Hackers love you.";
      grade = 'F';
    }
  }

  // Tips logic
  if (!hasReadme) {
    tips.push("Write a README.md. Explain what the project does, how to install it, and how to use it.");
  }
  
  if (!description || description.trim() === '') {
    tips.push("Add a repository description. A blank description makes it look like an accidental commit.");
  }

  if (!isLive && (language === 'TypeScript' || language === 'JavaScript' || language === 'HTML' || language === 'Vue' || language === 'Svelte')) {
    tips.push("Your web project isn't deployed! Use Vercel, Netlify, or GitHub Pages so people can actually see it instead of just staring at the code.");
  }

  if (!license || license === 'None') {
    tips.push("Add an open-source license (like MIT). Without one, nobody is legally allowed to use your code.");
  }

  if (!topics || topics.length === 0) {
    tips.push("Add repository topics/tags. It helps people find your project when searching GitHub.");
  }

  if (issues > 0) {
    tips.push(`You have ${issues} open issues. Try to close some or label them 'help wanted' if you've given up.`);
  }

  // General tip if nothing else triggered
  if (tips.length === 0) {
    tips.push("The repo looks decent on paper. Keep updating it so it doesn't rot.");
  }

  return { roast, grade, tips };
}
