# Component API

This project uses feature components and data registries so contributors can add content without editing core composition.

## Core Layout

- App shell: src/App.tsx
- Side navigation: src/components/SideNav.tsx
- Feature panels: src/components/*.tsx

## Data Contracts

Defined in src/types/profile.ts.

Primary models:

- DeveloperProfile
- OriginTheme
- Stat
- Achievement
- RepositoryQuest
- SkillNode
- Analysis

## Registry Files

- Character profile and stats: src/data/character.ts
- README origin archetypes: src/data/origins.ts

## Extension Rules

1. Add new developer classes, achievements, quests, or skill nodes in src/data/character.ts.
2. Add new README themes in src/data/origins.ts.
3. Keep object shapes compatible with src/types/profile.ts.
4. If adding a new panel type, create a component in src/components and include it in src/App.tsx.

This keeps core render flow stable while letting contributors extend content quickly.
