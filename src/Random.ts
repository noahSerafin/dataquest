export class Random {
    private static originalSeed: string | number = '';
    private static currentSeed: number = 0;
    private static generator: () => number = () => Math.random();
    /**
     * Hashes a string into a 32-bit integer.
     * Based on cyrb128 logic or a simple string hash.
     */
    private static hashString(str: string): number {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h = Math.imul(h ^ str.charCodeAt(i), 16777619);
        }
        return h >>> 0;
    }

    /**
     * Mulberry32 algorithm for fast, seeded 32-bit PRNG.
     */
    private static mulberry32(a: number) {
        return function() {
            let t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    /**
     * Sets the seed for the global random generator.
     * If the seed is a string, it will be hashed first.
     */
    public static setSeed(seed: string | number) {
        this.originalSeed = seed;
        const numericSeed = typeof seed === 'string' ? this.hashString(seed) : seed;
        this.currentSeed = numericSeed;
        this.generator = this.mulberry32(numericSeed);
    }

    /**
     * Gets the original seed that was set (either string or number).
     */
    public static getSeed(): string | number {
        return this.originalSeed;
    }
    public static getCurrentSeed(): number {
        return this.currentSeed;
    }

    /**
     * Returns a random float between 0 (inclusive) and 1 (exclusive).
     */
    public static next(): number {
        return this.generator();
    }

    /**
     * Returns a random integer between 0 (inclusive) and max (exclusive).
     */
    public static floor(max: number): number {
        if (max <= 0) return 0;
        return Math.floor(this.next() * max);
    }

    /**
     * Returns a random integer between min (inclusive) and max (exclusive).
     */
    public static range(min: number, max: number): number {
        if (max <= min) return min;
        return Math.floor(this.next() * (max - min)) + min;
    }

    /**
     * Picks a random element from an array.
     */
    public static pick<T>(array: T[]): T {
        if (array.length === 0) throw new Error("Cannot pick from empty array");
        return array[this.floor(array.length)];
    }

    /**
     * Returns true with a given probability (between 0 and 1).
     */
    public static bool(chance: number): boolean {
        return this.next() < chance;
    }
}
