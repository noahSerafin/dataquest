import type { Company, Coordinate, SkipReward } from "./types";
import { allPieces } from "./Pieces";
import { DIFFICULTY_RARITY } from "./constants";
import { applyVariant, rollVariant } from "./helperFunctions";
import { generateNode } from "./nodeBuilder";
import { Random } from "./Random";
import type { Piece } from "./Pieces"
import { playerCompany, shopCompany, bossCompany, companies } from "./companies";

interface Level {
  name: string;
  tiles: Coordinate[];
  pieces: Piece[];
}

 //world graph structure
export interface WorldNode {
  id: string;                // "node_1"
  type: "start" | "level" | "skip" | "shop" | "boss" | "hybrid compiler" | "sacrificial altar" | "duplicator" | "workbench";
  next: string[];            // IDs of next nodes
  position: { x: number; y: number }; // For layout on screen
  company: Company;
  difficultyMod: number;
  reward: number;
  level?: Level;             // Only for type: level
  playerSpawns?: Coordinate[]; // Added to store player spawn points
  hiddenUntilVisited?: string; // node id that must be completed first
  visited?: boolean;
  skipReward?: SkipReward; //get shop function into helpers to create these
  resolved?: boolean;          // skip nodes only
  visible?: boolean;
}

export interface WorldMap {
  nodes: Record<string, WorldNode>;
  startNode: string;
}

function chooseRandomCompany(){
  return Random.pick(companies);
}

type PathSpec = {
  type: 'level'| 'skip' | 'hiddenShop' | 'hiddenCompiler' | 'hiddenAltar' | 'hiddenDuplicator' | 'hiddenWorkbench';// add typed strings here
  mods: [number, number];    // difficultyMod for node 1 and node 2
  rewards: [number, number]; //add non monetary rewards? like programs/admins?
};

function shuffle(array: PathSpec[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Random.floor(i + 1);
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function getEasyPath(difficulty: number): PathSpec {
  const options: PathSpec[] = [
    
    { type: 'level', mods: [0, 0], rewards: [3, 3] },
    { type: 'hiddenAltar', mods: [0, 0], rewards: [3, 3] }
  ];
  if (difficulty > 1 ){
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'skip',  mods: [0, 0], rewards: [0, 3] });
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] });
    options.push({ type: 'hiddenShop',  mods: [0, 0], rewards: [3, 3] });
  }
  if (difficulty > 2 ){
    options.push({ type: 'skip',  mods: [0, 0], rewards: [0, 3] }),//skip path
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'level', mods: [0, 0], rewards: [3, 3] }),
    options.push({ type: 'hiddenAltar',  mods: [0, 0], rewards: [3, 3] });
    options.push({ type: 'hiddenDuplicator',  mods: [0, 0], rewards: [3, 3] });
    options.push({ type: 'hiddenWorkbench',  mods: [0, 0], rewards: [3, 3] });
    options.push({ type: 'hiddenCompiler',  mods: [0, 0], rewards: [3, 3] });
  }
  shuffle(options);
  return options[0];
}

function getIndividualPath(difficulty: number): PathSpec {
  const options: PathSpec[] = [
    { type: 'skip',  mods: [0, 1], rewards: [0, 5] },//skip path
    { type: 'level', mods: [0, 1], rewards: [3, 5] },// risky path
    { type: 'hiddenShop',  mods: [0, 1], rewards: [3, 5] }
  ];
  if (difficulty > 1 ){
    options.push({ type: 'level',  mods: [1, 2], rewards: [4, 7] })
    options.push({ type: 'hiddenShop',  mods: [1, 2], rewards: [4, 7] });
  }
  if (difficulty > 2 ){
    options.push({ type: 'skip',  mods: [0, 2], rewards: [0, 7] });
    options.push({ type: 'hiddenAltar',  mods: [0, 1], rewards: [3, 5] });
    options.push({ type: 'hiddenAltar',  mods: [1, 2], rewards: [4, 7] });
    options.push({ type: 'hiddenDuplicator',  mods: [0, 1], rewards: [3, 5] });
    options.push({ type: 'hiddenDuplicator',  mods: [1, 2], rewards: [4, 7] });
    options.push({ type: 'hiddenWorkbench',  mods: [0, 1], rewards: [3, 5] });
    options.push({ type: 'hiddenWorkbench',  mods: [1, 2], rewards: [4, 7] });
    options.push({ type: 'hiddenCompiler',  mods: [0, 1], rewards: [3, 5] });
    options.push({ type: 'hiddenCompiler',  mods: [1, 2], rewards: [4, 7] });
    //secret nodes (the type string) in middle of path between two nodes
    //options.push({ type: 'altar',  mods: [1, 2], rewards: [4, 7] });
    //options.push({ type: 'skipAndAltar',  mods: [1, 2], rewards: [4, 7] });
  }
  shuffle(options);
  return options[0];
}

function getPathSpecsForDifficulty(difficulty: number): PathSpec[] {
  /*const safePaths: PathSpec[] = [
    { type: 'level', mods: [0, 0], rewards: [3, 3] },
    { type: 'hiddenAltar', mods: [0, 0], rewards: [3, 3] },
  ]
  shuffle(safePaths);
  const safePath = safePaths[0];
  */
  if (difficulty <= 1) {
    return [
      //Random.bool(0.5) ? { type: 'level', mods: [0, 0], rewards: [3, 3] } : { type: 'hiddenAltar', mods: [0, 0], rewards: [3, 3] }, // safe path
      getEasyPath(difficulty),
      //getIndividualPath(difficulty)
      { type: 'skip',  mods: [0, 1], rewards: [0, 5] },
      //{ type: 'hiddenShop',  mods: [1, 2], rewards: [4, 7] }
    ];
  }

  // difficulty 3+
  //if (difficulty > 2) {
    return [
      //{ type: 'level', mods: [0, 0], rewards: [3, 3] },
      getEasyPath(difficulty),
      getIndividualPath(difficulty),
      getIndividualPath(difficulty),
    ];
  //}
}

function getPathPositions(
  pathIndex: number,
  totalPaths: number
) {
  const spacing = 140;
  const startX = 200 - ((totalPaths - 1) * spacing) / 2;

  return {
    node1: { x: startX + pathIndex * spacing, y: 380 },
    node2: { x: startX + pathIndex * spacing, y: 220 },
  };
}

export function generateWorld(
  levelPool: Level[],
  difficulty: number,
  stake: number
): WorldMap {

  //const pick = () => levelPool[Math.floor(Math.random() * levelPool.length)];
  const pick = () => Random.bool(0.5) ? Random.pick(levelPool) : generateNode(difficulty);

  const startId = "start";
  const shopId = "shop";
  const bossId = "boss";

  const pathSpecs = getPathSpecsForDifficulty(difficulty);

  const nodes: Record<string, WorldNode> = {};
  const middleNodeIds: (string | null)[] = new Array(pathSpecs.length).fill(null);


  // --- Start node ---
  nodes[startId] = {
    id: startId,
    type: "start",
    next: [],
    position: { x: 200, y: 500 },
    company: chooseRandomCompany(),
    difficultyMod: -1,
    reward: 0
  };

  // --- Paths ---
  pathSpecs.forEach((spec, i) => {
    const p1 = `path_${i}_1`;
    const p2 = `path_${i}_2`;
    const pos = getPathPositions(i, pathSpecs.length);

    if (spec.type === 'skip') {
      nodes[p1] = {
        id: p1,
        type: 'skip',
        next: [p2],
        position: pos.node1,
        company: bossCompany,
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0],
        resolved: false
      };

      nodes[p2] = {
        id: p2,
        type: 'level',
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }

    if (spec.type === 'hiddenShop') {
      const hiddenShopId = `path_${i}_hidden_shop`;
      middleNodeIds[i] = hiddenShopId;

      nodes[p1] = {
        id: p1,
        type: 'level',
        level: pick(),
        next: [hiddenShopId],
        position: pos.node1,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0]
      };

      nodes[hiddenShopId] = {
        id: hiddenShopId,
        type: 'shop',
        next: [p2],
        position: {
          x: pos.node1.x,
          y: ((pos.node1.y + pos.node2.y) / 2) +16
        },
        company: shopCompany,
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1,
        visible: false
      };

      nodes[p2] = {
        id: p2,
        type: 'level',
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }

    if (spec.type === 'hiddenAltar') {
      const hiddenCompilerId = `path_${i}_hidden_altar`;
      middleNodeIds[i] = hiddenCompilerId;

      nodes[p1] = {
        id: p1,
        type: 'level',
        level: pick(),
        next: [hiddenCompilerId],
        position: pos.node1,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0]
      };

      nodes[hiddenCompilerId] = {
        id: hiddenCompilerId,
        type: 'sacrificial altar',
        next: [p2],
        position: {
          x: pos.node1.x,
          y: ((pos.node1.y + pos.node2.y) / 2) +16
        },
        company: playerCompany,
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1,
        visible: false
      };

      nodes[p2] = {
        id: p2,
        type: 'level',
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }

    if (spec.type === 'hiddenDuplicator') {
      const hiddenCompilerId = `path_${i}_hidden_duplicator`;
      middleNodeIds[i] = hiddenCompilerId;

      nodes[p1] = {
        id: p1,
        type: 'level',
        level: pick(),
        next: [hiddenCompilerId],
        position: pos.node1,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0]
      };

      nodes[hiddenCompilerId] = {
        id: hiddenCompilerId,
        type: 'duplicator',
        next: [p2],
        position: {
          x: pos.node1.x,
          y: ((pos.node1.y + pos.node2.y) / 2) +16
        },
        company: playerCompany,
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1,
        visible: false
      };

      nodes[p2] = {
        id: p2,
        type: 'level',
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }

    if (spec.type === 'hiddenWorkbench') {
      const hiddenCompilerId = `path_${i}_hidden_workbench`;
      middleNodeIds[i] = hiddenCompilerId;

      nodes[p1] = {
        id: p1,
        type: 'level',
        level: pick(),
        next: [hiddenCompilerId],
        position: pos.node1,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0]
      };

      nodes[hiddenCompilerId] = {
        id: hiddenCompilerId,
        type: 'workbench',
        next: [p2],
        position: {
          x: pos.node1.x,
          y: ((pos.node1.y + pos.node2.y) / 2) +10
        },
        company: playerCompany,
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1,
        visible: false
      };

      nodes[p2] = {
        id: p2,
        type: 'level',
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }

    if (spec.type === 'hiddenCompiler') {
      const hiddenCompilerId = `path_${i}_hidden_compiler`;
      middleNodeIds[i] = hiddenCompilerId;

      nodes[p1] = {
        id: p1,
        type: 'level',
        level: pick(),
        next: [hiddenCompilerId],
        position: pos.node1,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0]
      };

      nodes[hiddenCompilerId] = {
        id: hiddenCompilerId,
        type: 'hybrid compiler',
        next: [p2],
        position: {
          x: pos.node1.x,
          y: ((pos.node1.y + pos.node2.y) / 2) +16
        },
        company: playerCompany,
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1,
        visible: false
      };

      nodes[p2] = {
        id: p2,
        type: 'level',
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }
    
    if (spec.type === 'level') {
      nodes[p1] = {
        id: p1,
        type: "level",
        level: pick(),
        next: [p2],
        position: pos.node1,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[0],
        reward: spec.rewards[0]
      };

      nodes[p2] = {
        id: p2,
        type: "level",
        level: pick(),
        next: [shopId],
        position: pos.node2,
        company: chooseRandomCompany(),
        difficultyMod: spec.mods[1],
        reward: spec.rewards[1]
      };
    }
    
    nodes[startId].next.push(p1);
  });

  // --- Split Paths ---
  // Connect one node in the first row to a neighboring second node
  if (pathSpecs.length >= 2) {
    const possibleEdges: { from: number; to: number }[] = [];
    for (let i = 0; i < pathSpecs.length; i++) {
      if (i > 0) possibleEdges.push({ from: i, to: i - 1 });
      if (i < pathSpecs.length - 1) possibleEdges.push({ from: i, to: i + 1 });
    }

    const crosses = (e1: { from: number; to: number }, e2: { from: number; to: number }) => {
      return (e1.from < e2.from && e1.to > e2.to) || (e1.from > e2.from && e1.to < e2.to);
    };

    const selectedEdges: { from: number; to: number }[] = [];

    // First split path
    const firstEdgeIndex = Random.floor(possibleEdges.length);
    const firstEdge = possibleEdges.splice(firstEdgeIndex, 1)[0];
    selectedEdges.push(firstEdge);

    // Second split path (50% chance if paths > 2)
    if (pathSpecs.length > 2 && Random.bool(0.5)) {
      const remainingNonCrossing = possibleEdges.filter(e => !crosses(firstEdge, e));
      if (remainingNonCrossing.length > 0) {
        const secondEdge = Random.pick(remainingNonCrossing);
        selectedEdges.push(secondEdge);
      }
    }

    selectedEdges.forEach(edge => {
      let sourceId = `path_${edge.from}_1`;
      let targetId = `path_${edge.to}_2`;
      
      const roll = Random.next();
      // 30% chance to originate from middle node OR 30% chance to lead to middle node
      // This ensures we never have middle-to-middle connections
      if (roll < 0.3 && middleNodeIds[edge.from]) {
        sourceId = middleNodeIds[edge.from]!;
      } else if (roll < 0.6 && middleNodeIds[edge.to]) {
        targetId = middleNodeIds[edge.to]!;
      }

      if (nodes[sourceId] && nodes[targetId]) {
        if (!nodes[sourceId].next.includes(targetId)) {
          nodes[sourceId].next.push(targetId);
        }
      }
    });
  }

  // --- Shop ---
  const shopXOffset = Random.range(-65, 25);
  nodes[shopId] = {
    id: shopId,
    type: "shop",
    next: [bossId],
    position: { x: 200 + shopXOffset, y: 150 },
    company: shopCompany,
    difficultyMod: 0,
    reward: 0
  };

  // --- Boss ---
  nodes[bossId] = {
    id: bossId,
    type: "boss",
    level: pick(),
    next: [],
    position: { x: 200, y: 50 },
    company: bossCompany,
    difficultyMod: 0,
    reward: Math.min(10, difficulty * 2)// +5;
  };


  for (const node of Object.values(nodes)) {
    if (!node.hiddenUntilVisited) {
      node.visible = true;
    } else {
      node.visible = false;
    }
    
    // Process level spawns if node has a level
    if (node.level && (node.type === 'level' || node.type === 'boss')) {
      const { processedPieces, playerSpawns } = processSpawnPoints(
        node.level.pieces, 
        (node.company && node.company.pieceList && node.company.pieceList.length > 0) ? node.company.pieceList : allPieces, 
        difficulty,
        node.difficultyMod,
        stake
      );
      node.level.pieces = processedPieces;
      node.playerSpawns = playerSpawns;
    }
  }

  return {
    startNode: startId,
    nodes
  };
}

function processSpawnPoints(
  pieces: Piece[], 
  companyPieces: any[], 
  difficulty: number,
  mod: number, 
  stake: number
) {
  const processed: Piece[] = [];
  const playerSpawns: Coordinate[] = [];

  for (const piece of pieces) {
    if (piece.name === 'Spawn') {
      const spawnSize = piece.tiles.length;
      // Enemy spawn → replace with random enemy piece
      if (piece.team === 'enemy') {
        let trueDifficulty = 0;
        if (difficulty + mod > 6) {
          trueDifficulty = 6;
        } else if (difficulty + mod < 1) {
          trueDifficulty = 1;
        } else {
          trueDifficulty = difficulty + mod;
        }
        const { min, max } = DIFFICULTY_RARITY[trueDifficulty];

        const difficultyMatched = companyPieces.filter(EnemyClass => {
          if (!EnemyClass || EnemyClass.name === "Nuke") return false;
          const temp = new EnemyClass(piece.headPosition, 'enemy');
          return temp.rarity >= min && temp.rarity <= max;
        });

        let pool = difficultyMatched.filter(EnemyClass => {
          const temp = new EnemyClass(piece.headPosition, 'enemy');
          return temp.maxSize >= spawnSize;
        });

        if (pool.length === 0) {
          pool = difficultyMatched;
        }

        const EnemyClass = Random.pick(pool);
        const enemyInstance = new EnemyClass(piece.headPosition, 'enemy');
        enemyInstance.tiles = piece.tiles.slice(0, enemyInstance.maxSize);

        const variantChance = Math.min((0.1 * trueDifficulty - 0.1), 1);
        const variant = rollVariant(variantChance, trueDifficulty);
        if (variant) {
          applyVariant(enemyInstance, variant);
        }
        
        enemyInstance.defenceRemaining = enemyInstance.getStat('defence');

        if (stake > 1) enemyInstance.maxSize += difficulty;
        if (stake > 2) enemyInstance.moves += difficulty;
        if (stake > 3) enemyInstance.range += difficulty;
        if (stake > 4) enemyInstance.attack += difficulty;
        if (stake > 5) enemyInstance.defence += difficulty;

        processed.push(enemyInstance);
        continue;
      }

      if (piece.team === 'player') {
        playerSpawns.push(piece.headPosition);
        continue;
      }
    }
    processed.push(piece);
  }

  return { processedPieces: processed, playerSpawns };
}