import { Player } from "./Player";
import { Piece, Spawn } from "./Pieces";
import { allPieces } from "./Pieces";
import { allItems } from "./Items";
import { allAdmins } from "./AdminPrograms";
import { allBosses } from "./Bosses";
import type { WorldMap } from "./worldBuilder";
import { companies, bossCompany, playerCompany, shopCompany } from "./companies";

// Create a combined admins array to search when rehydrating bosses & admins
const allPossibleAdmins = [...allAdmins, ...allBosses];

export function serializeGameState(
  player: Player,
  world: WorldMap,
  currentNodeId: string,
  skipsThisLevel: number,
  boss: any,
  seed: string,
  boardState: any, // null if not in a level, or an object if mid-level
  uiState: any
) {
  return {
    version: 1,
    seed,
    player: JSON.parse(JSON.stringify(player)), // strip methods, keep plain fields
    world: JSON.parse(JSON.stringify(world)),
    currentNodeId,
    skipsThisLevel,
    bossName: boss?.name, // just store constructor name to grab from allBosses
    boardState: boardState ? JSON.parse(JSON.stringify(boardState)) : null,
    uiState: JSON.parse(JSON.stringify(uiState))
  };
}

export function rehydrateGameState(data: any): any {
  // 1. Rehydrate Player
  const pData = data.player;
  const player = new Player(
    pData.osunicode, pData.money, pData.memory, pData.adminSlots,
    [], [], [], pData.lives, pData.interestCap, pData.bonusInterest,
    pData.bonusReward, pData.nextInterest, pData.nextReward, pData.stake
  );
  
  Object.assign(player, pData); // merges flat stats (difficulty, fogged, etc.)
  
  // Rehydrate player.items
  player.items = (pData.items || []).map((iData: any) => {
    const Cls = allItems.find(i => i.name === iData.name);
    if (!Cls) return null;
    const inst = new Cls();
    Object.assign(inst, iData);
    return inst;
  }).filter(Boolean);

  // Rehydrate player.admins
  player.admins = (pData.admins || []).map((aData: any) => {
    const Cls = allPossibleAdmins.find(a => a.name === aData.name);
    if (!Cls) return null;
    const inst = new Cls();
    Object.assign(inst, aData);
    return inst;
  }).filter(Boolean);

  // 2. Rehydrate Boss
  const BossCls = allPossibleAdmins.find((a: any) => a.name === data.bossName);
  const boss = BossCls ? new BossCls() : null;

  // 3. Rehydrate World Map (Restore Skip reward classes)
  const world = data.world;
  if(world && world.nodes) {
    Object.values(world.nodes).forEach((node: any) => {
      
      // Rehydrate Company Reference
      if (node.company) {
        let matchingComp = companies.find(c => c.name === node.company.name && c.abbr === node.company.abbr);
        if (!matchingComp) {
            if (node.company.abbr === 'BOSS') matchingComp = bossCompany;
            else if (node.company.abbr === 'SHOP') matchingComp = shopCompany;
            else if (node.company.abbr === '???') matchingComp = playerCompany;
            else matchingComp = companies[0]; // fallback
        }
        node.company = matchingComp;
      }

      if (node.skipReward) {
        if (node.skipReward.kind === 'item') {
          const Cls = allItems.find(i => i.name === node.skipReward.value.name);
          if (Cls) {
            const inst = new Cls();
            Object.assign(inst, node.skipReward.value);
            node.skipReward.value = inst;
          }
        } else if (node.skipReward.kind === 'admin') {
          const Cls = allPossibleAdmins.find(a => a.name === node.skipReward.value.name);
          if (Cls) {
            const inst = new Cls();
            Object.assign(inst, node.skipReward.value);
            node.skipReward.value = inst;
          }
        }
      }
    });
  }

  // 4. Rehydrate Board State if present
  let boardState = null;
  if (data.boardState) {
    boardState = data.boardState;
    boardState.activePieces = rehydratePieceArray(boardState.activePieces || []);
    boardState.originalPieces = rehydratePieceArray(boardState.originalPieces || []);
    boardState.lastTurnPieces = rehydratePieceArray(boardState.lastTurnPieces || []);
    boardState.graveyard = rehydratePieceArray(boardState.graveyard || []);
    
    boardState.bossAdmins = (boardState.bossAdmins || []).map((aData: any) => {
      const Cls = allPossibleAdmins.find(a => a.name === aData.name);
      if (!Cls) return null;
      const inst = new Cls();
      Object.assign(inst, aData);
      return inst;
    }).filter(Boolean);
  }

  return {
    player,
    world,
    currentNodeId: data.currentNodeId,
    skipsThisLevel: data.skipsThisLevel || 0,
    boss,
    seed: data.seed,
    boardState,
    uiState: data.uiState || {}
  };
}

export function rehydratePieceArray(rawPieces: any[]): Piece[] {
  const pieceClasses = [Spawn, ...allPieces] as any[];
  return rawPieces.map(p => {
    const PieceClass = pieceClasses.find(cls => cls.name === p.name);
    if (PieceClass) {
        const inst = new PieceClass(p.headPosition, p.team, undefined, p.id);
        Object.assign(inst, p); // restores modifiers, remaining moves, etc.
        return inst;
    }
    return p;
  });
}
