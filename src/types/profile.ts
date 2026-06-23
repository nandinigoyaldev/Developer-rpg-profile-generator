export type RepositoryQuest = {
  name: string;
  stars: number;
  language: string;
  description: string;
  roast: string;
};

export type DeveloperProfile = {
  login: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  followers?: number;
  following?: number;

  totalCommits: number;
  totalPRs: number;
  totalStars: number;
  streak: number;

  grade: string;
  title: string;

  pinnedTrash: RepositoryQuest[];
  toxicTraits: string[];
  activityRoast: string;
};
