import type { DeveloperProfile } from '../src/types/profile';
import { DynamicRenderer, DynamicBlueprint } from '../src/lib/engine/Renderer';

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

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_API_KEY || '';
    const GIPHY_API_KEY = process.env.GIPHY_API_KEY || 'N2Lwz266r3a1K9OigT7u1Xw1H35E4e2x'; // Public test key fallback if none

    if (GEMINI_API_KEY && customStyle.trim() !== 'fallback_trigger') {
      try {
        const aiPrompt = `You are an elite developer identity designer.

Data:
Profile: ${JSON.stringify(profile)}
User Theme/Vibe: "${customStyle}"

Your job is to generate a COMPLETELY UNIQUE thematic layout structure. 
If the theme is "Pokemon", do not use generic names. Use "Trainer Card", "Pokedex Progress".
If the theme is "Minecraft", use "Inventory", "XP Level".
Output ONLY a raw JSON object matching this schema exactly (no markdown formatting around it, no \`\`\`json):
{
  "themeName": "string",
  "visualDirection": "gaming",
  "gifSearchQueries": ["pixel art pokemon walking", "retro arcade fire", "anime sparkle"],
  "colorPalette": {
    "primary": "FF00CC",
    "bg": "0D1117",
    "text": "FFFFFF"
  },
  "sections": [
    {
      "id": "hero",
      "type": "hero-card",
      "title": "A thematic name for whoami",
      "narrativeText": "A thematic description of the user.",
      "dataBinding": "github_bio",
      "gifIndex": 0
    },
    {
      "id": "stats",
      "type": "grid",
      "title": "A thematic name for stats",
      "narrativeText": "Contextual lore.",
      "dataBinding": "github_stats"
    },
    {
      "id": "projects",
      "type": "list",
      "title": "A thematic name for pinned repos",
      "dataBinding": "pinned_repos"
    }
  ]
}

Make sure sections array has exactly 3 sections: a 'hero-card', a 'grid', and a 'list' (in any order).
`;

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
          let jsonString = aiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
          jsonString = jsonString.trim().replace(/^```json|```$/g, '').trim();

          try {
            const blueprint = JSON.parse(jsonString) as DynamicBlueprint;
            
            // Fetch GIFs dynamically based on AI queries
            blueprint.fetchedGifs = [];
            for (const query of blueprint.gifSearchQueries) {
              try {
                const gifRes = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1&rating=g`);
                const gifData = await gifRes.json();
                if (gifData.data && gifData.data.length > 0) {
                  blueprint.fetchedGifs.push(gifData.data[0].images.downsized.url);
                } else {
                  blueprint.fetchedGifs.push('https://media.giphy.com/media/26tn33aiTi1jVDzO0/giphy.gif');
                }
              } catch (e) {
                blueprint.fetchedGifs.push('https://media.giphy.com/media/26tn33aiTi1jVDzO0/giphy.gif');
              }
            }

            const finalMarkdown = DynamicRenderer.generateMarkdown(profile, blueprint);
            
            res.setHeader('Content-Type', 'text/markdown');
            res.status(200).send(finalMarkdown);
            return;
          } catch (e) {
            console.error("Failed to parse Gemini JSON output", jsonString);
          }
        }
      } catch (aiErr) {
        console.error('Gemini API call failed, falling back:', aiErr);
      }
    }

    // FALLBACK
    const fallbackBlueprint: DynamicBlueprint = {
      themeName: "Default Identity",
      visualDirection: "hacker",
      gifSearchQueries: ["hacker terminal code"],
      fetchedGifs: ["https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif"],
      colorPalette: { primary: "00FF00", bg: "000000", text: "FFFFFF" },
      sections: [
        { id: '1', type: 'hero-card', title: 'whoami', dataBinding: 'github_bio', gifIndex: 0 },
        { id: '2', type: 'grid', title: 'Radar', dataBinding: 'github_stats' },
        { id: '3', type: 'list', title: 'System Logs', dataBinding: 'pinned_repos' }
      ]
    };

    const finalMarkdown = DynamicRenderer.generateMarkdown(profile, fallbackBlueprint);
    res.setHeader('Content-Type', 'text/markdown');
    res.status(200).send(finalMarkdown);

  } catch (error: any) {
    console.error('Error generating README:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal Server Error' }));
  }
}

