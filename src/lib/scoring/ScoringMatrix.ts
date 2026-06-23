import type { CuratedAsset } from '../engine/AssetManager';

export interface UserContext {
  primaryTheme: string;
  interestTags: string[];
  colorHex: string;
}

export class ScoringMatrix {
  /**
   * Evaluates all assets in a database against the user's specific context.
   * Returns an array of assets sorted by their computed score (highest first).
   */
  static rankAssets(assets: CuratedAsset[], context: UserContext): Array<{ asset: CuratedAsset; score: number }> {
    const scored = assets.map(asset => {
      let score = 1.0; // Base score

      // 1. Theme Match (Heaviest Weight)
      if (asset.category === context.primaryTheme) {
        score += 20;
      }

      // 2. Interest Tag Match (Medium Weight)
      // If the asset has a tag that matches the user's interests
      const matchingTags = asset.tags.filter(tag => context.interestTags.includes(tag));
      if (matchingTags.length > 0) {
        score += (matchingTags.length * 15);
      }

      // 3. (Mock) Color Compatibility (Light Weight)
      // In a real DB, asset.colorCompatibility would be checked against context.colorHex
      
      // 4. Controlled Random Variance
      // Adds a float between 0 and 5 to ensure that equally weighted assets shuffle order
      score += (Math.random() * 5);

      return { asset, score };
    });

    // Sort descending by score
    return scored.sort((a, b) => b.score - a.score);
  }

  /**
   * Helper to retrieve the top N assets of a specific type
   */
  static selectTopAssets(assets: CuratedAsset[], context: UserContext, type: string, count: number): CuratedAsset[] {
    const filteredByType = assets.filter(a => a.assetType === type);
    const ranked = this.rankAssets(filteredByType, context);
    
    // Return just the asset objects for the top N results
    return ranked.slice(0, count).map(r => r.asset);
  }
}
