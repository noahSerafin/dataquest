export interface PlayerCollection {
  pieces: string[];
  admins: string[];
  bosses: string[];
  items: string[];
}

export interface PlayerStats {
  osStats: Record<string, { totalWins: number; winsByStake: Record<number, number> }>;
}

const COLLECTION_KEY = 'dataquest_collection';
const STATS_KEY = 'dataquest_stats';

export const StorageManager = {
  getCollection(): PlayerCollection {
    const data = localStorage.getItem(COLLECTION_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);

        return {
          pieces: parsed.pieces ?? [],
          admins: parsed.admins ?? [],
          bosses: parsed.bosses ?? [],
          items: parsed.items ?? []
        };
      } catch (e) {
        console.error("Error parsing collection data", e);
      }
    }
    return { pieces: [], admins: [], bosses: [], items: [] };
  },

  saveCollection(collection: PlayerCollection) {
    localStorage.setItem(COLLECTION_KEY, JSON.stringify(collection));
    window.dispatchEvent(new CustomEvent('storageManagerCollection', { detail: collection }));
  },

  unlockPiece(name: string) {
    const col = this.getCollection();
    if (!col.pieces.includes(name)) {
      col.pieces.push(name);
      this.saveCollection(col);
    }
  },

  unlockAdmin(name: string) {
    const col = this.getCollection();
    if (!col.admins.includes(name)) {
      col.admins.push(name);
      this.saveCollection(col);
    }
  },

  unlockBoss(name: string) {
    const col = this.getCollection();
    if (!col.bosses) col.bosses = [];
    if (!col.bosses.includes(name)) {
      col.bosses.push(name);
      this.saveCollection(col);
    }
  },

  unlockItem(name: string) {
    const col = this.getCollection();
    if (!col.items.includes(name)) {
      col.items.push(name);
      this.saveCollection(col);
    }
  },

  getStats(): PlayerStats {
    const data = localStorage.getItem(STATS_KEY);
    if (data) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.error("Error parsing stats data", e);
      }
    }
    return { osStats: {} };
  },

  saveStats(stats: PlayerStats) {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    window.dispatchEvent(new CustomEvent('storageManagerStats', { detail: stats }));
  },

  recordOS(osunicode: string) {
    const stats = this.getStats();
    if (!stats.osStats[osunicode]) {
      stats.osStats[osunicode] = { totalWins: 0, winsByStake: {} };
      this.saveStats(stats);
    }
  },

  recordWin(osunicode: string, stake: number) {
    const stats = this.getStats();
    if (!stats.osStats[osunicode]) {
      stats.osStats[osunicode] = { totalWins: 0, winsByStake: {} };
    }
    stats.osStats[osunicode].totalWins++;
    
    if (!stats.osStats[osunicode].winsByStake[stake]) {
      stats.osStats[osunicode].winsByStake[stake] = 0;
    }
    stats.osStats[osunicode].winsByStake[stake]++;

    this.saveStats(stats);
  }
};
