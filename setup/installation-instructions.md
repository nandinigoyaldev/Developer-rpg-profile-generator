# Installation & Setup Instructions

## Prerequisites

- **Node.js**: v20+ (v24+ recommended)
- **npm** (comes with Node)

## Quick start (local)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create environment variables**

   Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

   Then update the values for:

   - `VITE_GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   - `GITHUB_TOKEN` (optional, but recommended)

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Open**

   - http://localhost:5173

## Development commands

- **Build (production bundle)**

  ```bash
  npm run build
  ```

- **Lint**

  ```bash
  npm run lint
  ```

- **Preview production build**

  ```bash
  npm run preview
  ```

## Notes on configuration

- This app uses GitHub OAuth via the serverless handlers under `api/`.
- If you don’t set `GITHUB_TOKEN`, you may hit stricter GitHub API rate limits during development.

