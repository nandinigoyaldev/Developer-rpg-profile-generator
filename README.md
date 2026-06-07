# Developer RPG Profile Generator

Generate an RPG-style character sheet from a GitHub profile (and optionally a resume), then export a themed `README.md` you can paste into your GitHub profile.

- **GitHub stats → RPG stats** (commits, merged PRs, stars, streak)
- **Power Level (0–100) + rank**
- **Skill Tree + Quest Log**
- **README exporter** (copy / download)


Built with **React 19**, **TypeScript 6**, **Vite 8**, **Node.js Serverless Functions**, and **Vanilla CSS** with a custom neobrutalist/cyberpunk design system.

---

## 🎮 How it works (quick, for humans)

1. Open the app and enter a **GitHub username** (public mode) or sign in with GitHub (OAuth).
2. The backend fetches your GitHub profile, repositories, commit/PR counts, and contribution activity.
3. The app converts those metrics into RPG-style stats: **class, rank, power level**, a **skill tree**, and a **quest log**.
4. (Optional) Upload your resume (PDF/DOCX). We extract skill keywords and upgrade your skill tree + achievements.
5. Go to **README Generator** and export a themed `README.md` for your GitHub profile (copy or download).

---

## 🎮 Features & Gameplay

1. **GitHub OAuth Login & Public Search**

   - Click "Sign in with GitHub" to securely exchange authentication codes for an access token via `/api/github`.
   - Fetches profile info, repositories, commit counts, and merged pull request totals.
   - Parses the active event stream to calculate a real contribution streak.
   - **Fallback**: Enter any public username to compile profile details instantly without signing in.

2. **Interactive RPG Dashboard**
   - **Identity Panel**: Visualizes developer rank (e.g. Diamond, Gold, Silver), guild (company), custom specialization, and level.
   - **Combat Stats Grid**: Commits, merged PRs, stars earned, and streak days translated to game statistics.
   - **Achievement Vault**: Sequential loading cards displaying milestones (e.g. Code Crusader, Guild Leader, Flame Keeper).
   - **Quest Log**: Visual quest cards representing repositories (mapped to Unlocked, Active, or Locked statuses with difficulty classes).
   - **Skill Tree**: Progress meters showing language masteries (calculated from repository bytes) alongside engineering lifecycle skills (Git, CI/CD, Testing).
   - **Diagnostics Performance Report**: Formulates strengths, weaknesses, missing skills, and next recommended quests.

3. **Resume Upgrader (Optional)**
   - Upload PDF or DOCX resumes directly in the sandbox to parse experience metrics.
   - Parses document text on the server (`/api/resume`), extracts skills, and merges them to upgrade your dashboard Skill Tree and unlock special achievements (e.g. "Battle Hardened", "Scholar Archetype").

4. **Dynamic Visual Themes**
   - Five prebuilt dashboard themes: **Gaming 🎮**, **Cute 🌸**, **Cloud ☁️**, **Cyberpunk ⚡**, and **Minimalist 🖤**.
   - Redefines design tokens (backgrounds, fonts, shadows, borders, and corner rounding) to visually transform the interface instantly.

5. **README.md Generator**
   - Renders a markdown string based on your active dashboard statistics, skills, achievements, and selected theme.
   - Features dynamic text-based progress bars, shields.io badges, and quest logs.
   - Provides options to copy to clipboard or download as a `.md` file.

---

## 📁 System Architecture & Directory Structure

```text
├── api/                          # Vercel Serverless Backend Functions (Node.js)
│   ├── github.ts                 # Fetches GitHub profile details, events, and repo stats
│   ├── rating.ts                 # Evaluates profile completeness, consistency, and impact scores
│   ├── readme.ts                 # Compiles themed markdown layouts (5 prebuilt styles)
│   └── resume.ts                 # Deciphers text from PDF and DOCX binary resumes
├── src/
│   ├── components/               # React Presentation & Feature Widgets
│   │   ├── AchievementVault.tsx  # Grid of developer milestones
│   │   ├── AnalysisReport.tsx    # Diagnostic panel containing strengths & growth recommendations
│   │   ├── OriginSelector.tsx    # Interactive character creator for theme previews
│   │   ├── ProfilePanel.tsx      # Main character avatar, rank, and XP progress bar
│   │   ├── QuestBoard.tsx        # Repositories styled as active/locked/unlocked quests
│   │   ├── ReadmePanel.tsx       # Live README generator, preview, copy, and download actions
│   │   ├── SideNav.tsx           # Sticky left-hand navigation linking page anchors
│   │   ├── SkillTree.tsx         # Skill progression nodes with visual meters
│   │   └── StatPanel.tsx         # Matrix of combat tiles displaying commits, stars, and PRs
│   ├── data/                     # Content registries
│   │   ├── character.ts          # Central developer profile (initial fallback data)
│   │   └── origins.ts            # Archetypes data registry for the Character Creator
│   ├── styles/                   # Modular CSS stylesheets
│   │   ├── base.css              # Reset rules, layouts, uploader, rating meters, and loading states
│   │   ├── components.css        # Interactive grids, cards, transitions, and hover animations
│   │   └── tokens.css            # Scoped variables defining Gaming, Cute, Cloud, Cyberpunk, and Minimalist overrides
│   ├── types/                    # Core TypeScript contracts
│   │   └── profile.ts            # Data models
│   ├── App.tsx                   # Central React composition containing state coordinates
│   ├── index.css                 # Style entry point importing Google Web Fonts
│   └── main.tsx                  # React mounting node
├── index.html                    # Root HTML template
├── package.json                  # Scripts and dependencies configurations
├── tsconfig.json                 # TypeScript compiler configuration
├── vercel.json                   # Vercel SPA rewrites and API routing configuration
└── vite.config.ts                # Intercepts /api/* requests to execute handlers locally in development
```

---

## 🛠️ Local Development & Setup

### 1. Prerequisites
- **Node.js**: `v20+` or `v24+` recommended.
- **nvm** (Optional): Used to switch node environments.

### 2. Environment Configuration
Create a `.env` or `.env.local` file at the root based on [`.env.example`](./.env.example):

```bash
# Register a GitHub OAuth App to obtain client keys:
# Homepage URL = http://localhost:5173
# Callback URL = http://localhost:5173
VITE_GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# Optional: Add a Personal Access Token to avoid public API rate limits:
GITHUB_TOKEN=your_personal_access_token_here
```

### 3. Execution Commands
Run these commands from the root directory:

- **Start Dev Server**
  ```bash
  npm run dev
  ```
  Starts Vite on **http://localhost:5173** and serves the SPA + local `/api/*` routes.

- **Build (production bundle)**
  ```bash
  npm run build
  ```
  Runs `tsc -b` then builds the app into `dist/`.

- **Lint**
  ```bash
  npm run lint
  ```

- **Preview production build**
  ```bash
  npm run preview
  ```


---

## 🚀 Deployment to Vercel

1. Connect the repo in your Vercel dashboard.
2. Vercel builds the React SPA and deploys the `/api/*` serverless handlers.
3. Add env vars in **Vercel → Project Settings → Environment Variables**:
   - `VITE_GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_TOKEN` (optional but recommended to reduce rate limits)
4. Deploy.

