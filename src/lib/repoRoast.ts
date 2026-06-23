export function generateRepoRoast(repoStats: any): { roast: string, grade: string } {
  const { stars, forks, issues, hasReadme, size, language, structure, name } = repoStats;

  let roast = '';
  let grade = 'F';

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
  }

  return { roast, grade };
}
