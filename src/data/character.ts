import type { DeveloperProfile } from '../types/profile';

export const characterProfile: DeveloperProfile = {
  name: 'Nandini',
  title: 'Developer Level 42',
  className: 'Frontend Mage',
  specialization: 'React',
  guild: 'Open Source',
  avatarInitials: 'ND',
  powerLevel: 78,
  xpProgress: 67,
  rank: 'Diamond IV',
  battleTag: 'UIArcana#2842',
  stats: [
    { label: 'Commits', value: 1324, modifier: '+14 this week' },
    { label: 'Merged PRs', value: 278, modifier: '+6 this week' },
    { label: 'Stars Earned', value: 941, modifier: '+31 this month' },
    { label: 'Contrib Streak', value: '29 days', modifier: 'Personal best' },
  ],
  achievements: [
    { title: '100 Commits', tier: 'Gold', detail: 'Cleared in Sprint 8' },
    { title: 'First Pull Request', tier: 'Silver', detail: 'Questline unlocked' },
    { title: 'Documentation Master', tier: 'Emerald', detail: '42 guides completed' },
    { title: 'Bug Hunter', tier: 'Cyan', detail: '158 critical fixes' },
  ],
  repositories: [
    { name: 'spellbook-ui', stars: 311, questType: 'UI Artifact', difficulty: 'Hard', status: 'Unlocked' },
    { name: 'react-raid-kit', stars: 224, questType: 'Component Forge', difficulty: 'Epic', status: 'Active' },
    { name: 'guild-docs-engine', stars: 117, questType: 'Knowledge Dungeon', difficulty: 'Normal', status: 'Unlocked' },
    { name: 'quest-log-api', stars: 91, questType: 'Backend Trial', difficulty: 'Hard', status: 'Locked' },
  ],
  skillTree: [
    { name: 'React Mastery', level: 92, branch: 'Core Magic' },
    { name: 'TypeScript Precision', level: 85, branch: 'Rune Control' },
    { name: 'UI Crafting', level: 90, branch: 'Visual Arts' },
    { name: 'Testing Discipline', level: 46, branch: 'Defense' },
    { name: 'CI/CD Automation', level: 38, branch: 'Machinery' },
    { name: 'Database Architecture', level: 31, branch: 'Deep Systems' },
  ],
  analysis: {
    characterClass: 'Frontend Mage',
    powerLevel: '78/100',
    strengths: ['React Mastery', 'UI Crafting', 'Fast Prototyping'],
    weaknesses: ['Testing', 'Backend Systems'],
    missingSkills: ['CI/CD', 'Database Architecture'],
    nextQuest: 'Build a collaborative full-stack application.',
  },
};
