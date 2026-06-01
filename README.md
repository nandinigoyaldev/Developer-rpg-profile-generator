# Developer RPG Profile (Hackathon)

A premium gaming-inspired profile system where a GitHub developer identity is rendered as an RPG character dashboard.

## Product Vision

- Profile-first interface inspired by game career pages and character screens.
- Information-dense layout with strong hierarchy and minimal dead space.
- Bright, energetic color system: electric blue, cyan, emerald, gold, and white.
- README generation framed as a character creator flow.

## Key Experiences

- Character panel with class, guild, rank, power level, and animated XP progress.
- Achievement vault with unlock cards.
- Quest board where repositories are represented as missions.
- Skill tree with progression meters.
- README character creator with origin archetypes:
  - Space Explorer
  - Cyber Warrior
  - Guild Master
  - Open Source Hero
  - Dungeon Coder
  - Pixel Adventurer
- Game report analysis with strengths, weaknesses, missing skills, and next quest.

## GitHub Sign-In Flow

Use GitHub, not Google, if you want the app to update a user's README on their behalf.

Recommended flow:

1. Sign in with GitHub via OAuth or a GitHub App.
2. Read the user's GitHub profile and target repository.
3. Generate the README preview in the app.
4. Ask for explicit confirmation before writing.
5. Commit directly or open a pull request with the README change.

For a hackathon demo, you can also accept a GitHub profile URL or repo URL as input and keep the write step as a preview-only action.

What to connect in code:

- Replace the sign-in button label in src/App.tsx with GitHub-auth wording.
- Wire the button to your backend OAuth endpoint.
- Store the returned access token/session securely.
- Use that token to call the GitHub API for profile data and README writes.

Minimum backend permission idea:

- Read profile/repo metadata.
- Write only to the selected repository README, or open a PR instead of direct push.

If you do not have backend auth yet, keep the UI as a GitHub connect prompt and let the generator output a preview that the user copies manually.

## Tech Stack

- React
- TypeScript
- Vite
- CSS design tokens + modular component styles

## Scripts

- npm run dev: start local development server
- npm run build: create production build
- npm run preview: preview built app

## Project Structure

- src/App.tsx: screen composition and panel ordering
- src/components/: reusable UI modules
- src/data/: content registries for profile and archetypes
- src/types/: API contracts for extensible data
- src/styles/: tokenized style system
- docs/component-api.md: contributor-facing extension guide

## Open Source Contribution Model

Contributors can extend content without touching core logic:

- Add classes, stats, achievements, quests, and skills in src/data/character.ts.
- Add new README origin themes in src/data/origins.ts.
- Keep shape compatibility with src/types/profile.ts.
- Add new feature cards as isolated components in src/components and register in src/App.tsx.
