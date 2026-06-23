export class Randomizer {
  /**
   * Generates a deterministic pseudorandom number based on a seed.
   * Useful for ensuring the same profile/day combo generates the same variance,
   * while allowing intentional re-rolls by passing a new seed.
   */
  static seededRandom(seed: number): number {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Randomly shuffles an array in place, optionally using a seed.
   */
  static shuffle<T>(array: T[], seed?: number): T[] {
    const shuffled = [...array];
    let currentIndex = shuffled.length;
    let currentSeed = seed ?? Math.random() * 10000;

    while (currentIndex !== 0) {
      const randomValue = seed ? this.seededRandom(currentSeed++) : Math.random();
      const randomIndex = Math.floor(randomValue * currentIndex);
      currentIndex--;

      [shuffled[currentIndex], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[currentIndex],
      ];
    }

    return shuffled;
  }

  /**
   * Selects N items randomly from an array.
   */
  static pickN<T>(array: T[], n: number, seed?: number): T[] {
    return this.shuffle(array, seed).slice(0, n);
  }
}
