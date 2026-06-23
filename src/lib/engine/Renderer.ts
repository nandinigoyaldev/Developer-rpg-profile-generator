import type { DeveloperProfile } from '../../types/profile';

export interface DynamicSection {
  id: string;
  type: 'hero-card' | 'grid' | 'list';
  title: string;
  narrativeText?: string;
  assetPlacement?: 'right-aligned-gif' | 'inline-badges' | 'header-icon';
  dataBinding: 'github_bio' | 'github_stats' | 'pinned_repos';
  gifIndex?: number; // Maps to which GIF from the fetched queries to use here
}

export interface DynamicBlueprint {
  themeName: string;
  visualDirection: string;
  gifSearchQueries: string[];
  fetchedGifs: string[]; // URLs injected by the backend after querying Giphy
  colorPalette: {
    primary: string;
    bg: string;
    text: string;
  };
  sections: DynamicSection[];
}

export class DynamicRenderer {
  static generateMarkdown(profile: DeveloperProfile, blueprint: DynamicBlueprint): string {
    const { primary, bg } = blueprint.colorPalette;
    
    let markdown = `<!-- AUTOMATICALLY GENERATED DEVELOPER IDENTITY -->
<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:${bg},100:${primary}&text=${encodeURIComponent(blueprint.themeName)}&fontSize=50&fontColor=ffffff&animation=fadeIn&fontAlignY=35&descAlignY=55&descAlign=50" alt="Hero Banner"/>
</div>\n<br>\n`;

    blueprint.sections.forEach(section => {
      markdown += this.renderSection(section, profile, blueprint);
    });

    markdown += `\n<br>\n<div align="center"><sub>Rendered by Dynamic Identity Engine</sub></div>`;
    return markdown;
  }

  private static renderSection(section: DynamicSection, profile: DeveloperProfile, blueprint: DynamicBlueprint): string {
    const { primary, bg, text } = blueprint.colorPalette;
    let sectionHtml = '';
    
    // Attempt to grab a specific GIF for this section, fallback if none
    const gifUrl = typeof section.gifIndex !== 'undefined' && blueprint.fetchedGifs[section.gifIndex]
      ? blueprint.fetchedGifs[section.gifIndex]
      : 'https://media.giphy.com/media/26tn33aiTi1jVDzO0/giphy.gif';

    if (section.type === 'hero-card') {
      sectionHtml += `
<table width="100%" align="center">
  <tr>
    <td width="55%">
      <h2 align="center">✨ ${section.title}</h2>
      ${section.narrativeText ? `<blockquote>"${section.narrativeText}"</blockquote>` : ''}
      <p>
        I am <strong>${profile.name}</strong>, ${profile.bio || 'Building things on the internet.'}
      </p>
<pre><code>const reality = {
  commits: ${profile.totalCommits},
  power_level: "${profile.grade}"
};
</code></pre>
    </td>
    <td width="45%" align="center">
      <img src="${gifUrl}" width="200" style="border-radius:15px;"/>
    </td>
  </tr>
</table>
<br>
`;
    } 
    
    else if (section.type === 'grid') {
      sectionHtml += `
<div align="center">
  <h2 align="center">📈 ${section.title}</h2>
  ${section.narrativeText ? `<p><i>${section.narrativeText}</i></p>` : ''}
  <a href="https://github.com/${profile.login}">
    <img src="https://github-readme-stats.vercel.app/api?username=${profile.login}&show_icons=true&title_color=${primary}&icon_color=${primary}&text_color=${text}&bg_color=${bg}&hide_border=true" alt="GitHub Stats" />
  </a>
</div>
<br>
`;
    }

    else if (section.type === 'list') {
      sectionHtml += `
<h2 align="center">🎮 ${section.title}</h2>
<table align="center" width="90%">
  <tr>
    ${profile.pinnedTrash.slice(0, 3).map((repo: any) => `
    <td align="center" width="33%" style="background-color: #${bg}; padding: 20px; border-radius: 10px;">
      <h3 style="color: #${primary};">${repo.name}</h3>
      <p style="color: #${text};">${repo.roast || repo.description || 'No description provided.'}</p>
      <b>⭐ ${repo.stars} Stars</b>
    </td>
    `).join('')}
  </tr>
</table>
<br>
`;
    }

    return sectionHtml;
  }
}
