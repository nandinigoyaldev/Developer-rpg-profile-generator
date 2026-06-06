export type Stat = {
  label: string;
  value: number | string;
  modifier: string;
};

export type Achievement = {
  title: string;
  tier: string;
  detail: string;
};

export type RepositoryQuest = {
  name: string;
  stars: number;
  questType: string;
  difficulty: 'Normal' | 'Hard' | 'Epic';
  status: 'Unlocked' | 'Active' | 'Locked';
};

export type SkillNode = {
  name: string;
  level: number;
  branch: string;
};

export type Analysis = {
  characterClass: string;
  powerLevel: string;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  nextQuest: string;
};

export type DeveloperProfile = {
  name: string;
  title: string;
  className: string;
  specialization: string;
  guild: string;
  avatarInitials: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  blog?: string;
  followers?: number;
  following?: number;
  powerLevel: number;
  xpProgress: number;
  rank: string;
  battleTag: string;
  stats: Stat[];
  achievements: Achievement[];
  repositories: RepositoryQuest[];
  skillTree: SkillNode[];
  analysis: Analysis;
};

export type OriginTheme = {
  id: string;
  name: string;
  flavor: string;
  accent: string;
  perks: string[];
};
