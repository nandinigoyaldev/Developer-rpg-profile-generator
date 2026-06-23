export type AssetCategory = 'gaming' | 'anime' | 'cyberpunk' | 'space' | 'fantasy' | 'cute' | 'minimal' | 'professional' | 'hacker';
export type AssetType = 'hero' | 'sticker' | 'divider' | 'badge';

export interface CuratedAsset {
  id: string;
  category: AssetCategory;
  assetType: AssetType;
  url: string;
  tags: string[];
}

export const ASSET_LIBRARY: CuratedAsset[] = [
  // Dividers
  { id: 'div-cyber-1', category: 'cyberpunk', assetType: 'divider', url: 'https://media.giphy.com/media/26AHG5KGFxSkUWw1i/giphy.gif', tags: ['neon', 'line'] },
  { id: 'div-cute-1', category: 'cute', assetType: 'divider', url: 'https://media.giphy.com/media/YkQBB22M9Q2n3FovJ3/giphy.gif', tags: ['sparkles', 'pink'] },
  { id: 'div-game-1', category: 'gaming', assetType: 'divider', url: 'https://media.giphy.com/media/LUIvcbR6yomaQ/giphy.gif', tags: ['pixel', 'mario'] },
  
  // Stickers
  { id: 'st-game-1', category: 'gaming', assetType: 'sticker', url: 'https://media.giphy.com/media/LmNwrBhejkK9EFP504/giphy.gif', tags: ['controller', 'retro'] },
  { id: 'st-cute-1', category: 'cute', assetType: 'sticker', url: 'https://media.tenor.com/dR8VeofA1RoAAAAm/sanrio-cute.webp', tags: ['sanrio', 'kawaii'] },
  { id: 'st-hacker-1', category: 'hacker', assetType: 'sticker', url: 'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif', tags: ['matrix', 'code'] },
  
  // Hero Assets
  { id: 'hero-space-1', category: 'space', assetType: 'hero', url: 'https://media.giphy.com/media/f3iwJFOVOwuy7K6FFw/giphy.gif', tags: ['astronaut', 'galaxy'] },
  { id: 'hero-anime-1', category: 'anime', assetType: 'hero', url: 'https://media.giphy.com/media/1n7DP0FkZ0bNbbvQ30/giphy.gif', tags: ['spirited', 'ghibli'] },
];

export class AssetManager {
  static getAssets(category: AssetCategory, type: AssetType, count: number = 1): CuratedAsset[] {
    const matches = ASSET_LIBRARY.filter(a => a.category === category && a.assetType === type);
    // Shuffle
    const shuffled = matches.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  static getFallbackAsset(type: AssetType): string {
    // If we have no matching category asset, return a safe fallback
    const fallbackMap: Record<AssetType, string> = {
      hero: 'https://media.giphy.com/media/26tn33aiTi1jVDzO0/giphy.gif',
      sticker: 'https://media.giphy.com/media/13HgwGsXF0aiGY/giphy.gif',
      divider: 'https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif',
      badge: 'https://img.shields.io/badge/Status-Active-brightgreen'
    };
    return fallbackMap[type];
  }
}
