import type { DeveloperProfile } from '../src/types/profile';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { profile, customStyle } = req.body as { profile: DeveloperProfile, customStyle: string };

    if (!profile) {
      res.status(400).json({ error: 'Missing profile data' });
      return;
    }

    // 1. DYNAMIC AI GENERATION (using Gemini API if Key is present)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';
    if (GEMINI_API_KEY && customStyle.trim() !== 'fallback_trigger') {
      try {
        const aiPrompt = `You are an expert GitHub profile README designer. Create a highly visual, extremely humorous and brutal roasting README.md.

Developer Profile details: ${JSON.stringify(profile)}
User's style request: "${customStyle}"

Core Constraints & Elements to include:
- Use rich visual elements: capsule-render banners, readme-typing-svg, github-readme-stats, and skillicons.dev.
- Use HTML tables for multi-column layouts (e.g. side-by-side text and GIFs).
- Randomize the design: it should look stunning and premium (like synthwave, retro hacker, kawaii, or minimalist themes).
- Keep the tone hilariously toxic and roasting. Mock their 'toxicTraits' and 'pinnedTrash'.
- Output ONLY raw Markdown content. Do NOT wrap output in markdown code fences.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: aiPrompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 2048 }
          })
        });

        if (response.ok) {
          const aiData = await response.json();
          let markdown = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          markdown = markdown.trim().replace(/^```markdown|```$/g, '').trim();

          if (markdown) {
            res.setHeader('Content-Type', 'text/markdown');
            res.status(200).send(markdown);
            return;
          }
        }
      } catch (aiErr) {
        console.error('Gemini API call failed, falling back:', aiErr);
      }
    }

    // 2. EXPANSIVE RULE-BASED FALLBACK (Rich Visual Randomization)
    const username = profile.login;

    // A. Randomize Theme Colors & Styles
    const THEMES = [
      { id: 'synthwave', bg: '0:2D0B5A,100:E53888', text: 'E53888', stats: 'synthwave', border: '1A1B27' },
      { id: 'hacker', bg: '0:000000,100:00FF00', text: '00FF00', stats: 'tokyonight', border: '0d1117' },
      { id: 'kawaii', bg: '0:FFB6C1,100:FF69B4', text: 'FF1493', stats: 'buefy', border: 'FFF0F5' },
      { id: 'abyss', bg: '0:0D1117,100:58A6FF', text: '58A6FF', stats: 'github_dark', border: '161b22' }
    ];
    const theme = THEMES[Math.floor(Math.random() * THEMES.length)];

    // B. Randomize GIFs based on theme
    const GIFS = {
      synthwave: ['https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif', 'https://media.giphy.com/media/l41lFw057lAJQMwg0/giphy.gif'],
      hacker: ['https://media.giphy.com/media/YQitE4YNQxWuM/giphy.gif', 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif'],
      kawaii: ['https://media.giphy.com/media/3oz8xAFtjouKvtCE7u/giphy.gif', 'https://media.tenor.com/dR8VeofA1RoAAAAm/sanrio-cute.webp'],
      abyss: ['https://media.giphy.com/media/f3iwJFOVOwuy7K6FFw/giphy.gif', 'https://media.giphy.com/media/6yRVg0HWzgS88/giphy.gif']
    };
    // @ts-ignore
    const randomGif = GIFS[theme.id][Math.floor(Math.random() * 2)];

    // C. Randomize Layout Blocks
    const headerType = ['waving', 'rect', 'cylinder', 'transparent'][Math.floor(Math.random() * 4)];
    const alignStr = Math.random() > 0.5 ? 'center' : 'left';

    // Build Typing SVG Lines
    const typedLines = profile.toxicTraits.length > 0 
      ? profile.toxicTraits.map(t => encodeURIComponent(t.substring(0, 40))).join(';') 
      : encodeURIComponent('Writing bugs since day one;');

    // Identify languages for skillicons
    const languagesSet = new Set<string>();
    profile.pinnedTrash.forEach((r: any) => {
      const l = r.language.toLowerCase();
      if (['javascript', 'typescript', 'python', 'java', 'c++', 'c', 'c#', 'ruby', 'php', 'go', 'rust', 'html', 'css', 'react'].includes(l)) {
        languagesSet.add(l);
      }
    });
    if (languagesSet.size === 0) languagesSet.add('markdown');
    const skillIconsStr = Array.from(languagesSet).join(',');

    let finalMarkdown = `<!-- AUTOMATICALLY GENERATED BRUTAL PROFILE -->
<div align="${alignStr}">
  
  <img src="https://capsule-render.vercel.app/api?type=${headerType}&height=220&color=${theme.bg}&text=${encodeURIComponent(profile.name)}&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=${encodeURIComponent(profile.title)}&descAlignY=55&descAlign=50" alt="Hero Banner"/>
  
  <br>

  <img src="https://readme-typing-svg.herokuapp.com?font=Share+Tech+Mono&pause=1000&color=${theme.text}&width=600&center=${alignStr === 'center' ? 'true' : 'false'}&lines=${typedLines}" alt="Typing Text" />
  
  <br><br>

  <a href="https://github.com/${username}"><img src="https://img.shields.io/badge/-GitHub-181717?style=flat-square&logo=github&logoColor=white"/></a>
  <a href="#"><img src="https://img.shields.io/badge/-StackOverflow-F58025?style=flat-square&logo=stackoverflow&logoColor=white"/></a>
</div>

<br>

<table width="100%" align="center">
  <tr>
    <td width="55%">
      <h2 align="center">👾 <code>whoami</code></h2>
      <blockquote>
        "${profile.activityRoast}"
      </blockquote>
      <p>
        I am <strong>${profile.name}</strong>, a proud <strong>${profile.grade}</strong> grade developer. ${profile.bio ? profile.bio : 'I am too lazy to write a real bio.'}
      </p>
<pre><code>const reality = {
  commits: ${profile.totalCommits}, // Mostly typos
  streak: ${profile.streak}, // Needs to touch grass
  power_level: "Embarrassing"
};
</code></pre>
    </td>
    <td width="45%" align="center">
      <img src="${randomGif}" width="250" style="border-radius:15px;"/>
    </td>
  </tr>
</table>

<br>

<h2 align="center">✨ Tech Toolkit (Allegedly)</h2>
<div align="center">
  <i>Languages I claim to know but actually just ask ChatGPT for</i><br><br>
  <img src="https://skillicons.dev/icons?i=${skillIconsStr}&theme=light" />
</div>

<br>

<div align="center">
  <h2 align="center">📈 GitHub Radar of Shame</h2>
  
  <a href="https://github.com/${username}">
    <img src="https://github-readme-activity-graph.vercel.app/graph?username=${username}&theme=${theme.stats}&bg_color=${theme.border}&hide_border=true" alt="Activity Graph" width="90%" />
  </a>
  
  <br><br>
  
  <a href="https://github.com/${username}">
    <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=${theme.stats}&hide_border=true&bg_color=${theme.border}" alt="GitHub Stats" />
  </a>
  <a href="https://github.com/${username}">
    <img src="https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=${theme.stats}&hide_border=true&background=${theme.border}" alt="GitHub Streak" />
  </a>
</div>

<br>

<h2 align="center">🎮 Featured Quests (Projects I Abandoned)</h2>
<table align="center" width="90%">
  <tr>
    ${profile.pinnedTrash.slice(0, 3).map((repo: any) => `
    <td align="center" width="33%" style="background-color: #${theme.border}; padding: 20px; border-radius: 10px;">
      <h3 style="color: #${theme.text};">${repo.name}</h3>
      <p>${repo.roast}</p>
      <b>⭐ ${repo.stars} Stars</b>
    </td>
    `).join('')}
  </tr>
</table>

<br>

<div align="center">
  <i>"Writing code that makes a difference... in my error logs."</i><br><br>
  <sub>Generated by Developer Roasting Profile Generator</sub>
</div>
`;

    res.setHeader('Content-Type', 'text/markdown');
    res.status(200).send(finalMarkdown);
  } catch (error: any) {
    console.error('Error generating README:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
}
