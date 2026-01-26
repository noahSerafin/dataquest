import type { Company, Coordinate, SkipReward } from "./types";
import type { Piece } from "./Pieces";
import { companies } from "./companies";

interface Level {
  name: string;
  tiles: Coordinate[];
  pieces: Piece[];
}

 //world graph structure
export interface WorldNode {
  id: string;                // "node_1"
  type: "start" | "level" | "skip" | "shop" | "boss" | "hybrid compiler";//compiler altar
  next: string[];            // IDs of next nodes
  position: { x: number; y: number }; // For layout on screen
  company: Company;
  difficultyMod: number;
  reward: number;
  level?: Level;             // Only for type: level
  hiddenUntilVisited?: string; // node id that must be completed first
  skipReward?: SkipReward; //get shop function into helpers to create these
  resolved?: boolean;          // skip nodes only
}

export interface WorldMap {
  nodes: Record<string, WorldNode>;
  startNode: string;
}

function chooseRandomCompany(){
  return companies[Math.floor(Math.random() * companies.length)];
}

type PathSpec = {
  type: 'level'| 'skip' | 'hiddenShop' | 'hiddenCompiler';// add typed strings here
  mods: [number, number];    // difficultyMod for node 1 and node 2
  rewards: [number, number]; //add non monetary rewards? like programs/admins?
};

function shuffle(array: PathSpec[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
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
    options.push({ type: 'hiddenCompiler',  mods: [1, 2], rewards: [4, 7] })
    options.push({ type: 'hiddenCompiler',  mods: [0, 1], rewards: [3, 5] });
    //secret nodes (the type string) in middle of path between two nodes
    //options.push({ type: 'altar',  mods: [1, 2], rewards: [4, 7] });
    //options.push({ type: 'skipAndAltar',  mods: [1, 2], rewards: [4, 7] });
  }
  shuffle(options);
  return options[0];
}

function getPathSpecsForDifficulty(difficulty: number): PathSpec[] {
  // difficulty 0 / 1
  if (difficulty <= 2) {
    return [
      { type: 'level', mods: [0, 0], rewards: [3, 3] }, // safe path
      //getIndividualPath(difficulty)
      { type: 'skip',  mods: [0, 1], rewards: [0, 5] },
      //{ type: 'hiddenShop',  mods: [1, 2], rewards: [4, 7] }
    ];
  }

  // difficulty 3+
  //if (difficulty > 2) {
    return [
      { type: 'level', mods: [0, 0], rewards: [3, 3] },
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
    node1: { x: startX + pathIndex * spacing, y: 280 },
    node2: { x: startX + pathIndex * spacing, y: 120 },
  };
}

export function generateWorld(
  levelPool: Level[],
  difficulty: number
): WorldMap {

  const pick = () => levelPool[Math.floor(Math.random() * levelPool.length)];

  const startId = "start";
  const shopId = "shop";
  const bossId = "boss";

  const pathSpecs = getPathSpecsForDifficulty(difficulty);

  const nodes: Record<string, WorldNode> = {};

  // --- Start node ---
  nodes[startId] = {
    id: startId,
    type: "level",
    next: [],
    position: { x: 200, y: 400 },
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
        company: chooseRandomCompany(),
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
          y: (pos.node1.y + pos.node2.y) / 2
        },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1
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
      const hiddenShopId = `path_${i}_hidden_compiler`;

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
        type: 'hybrid compiler',
        next: [p2],
        position: {
          x: pos.node1.x,
          y: (pos.node1.y + pos.node2.y) / 2
        },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 0,
        hiddenUntilVisited: p1
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

  // --- Shop ---
  nodes[shopId] = {
    id: shopId,
    type: "shop",
    next: [bossId],
    position: { x: 200, y: 50 },
    company: chooseRandomCompany(),
    difficultyMod: 0,
    reward: 0
  };

  // --- Boss ---
  nodes[bossId] = {
    id: bossId,
    type: "boss",
    level: pick(),
    next: [],
    position: { x: 200, y: 0 },
    company: chooseRandomCompany(),
    difficultyMod: 0,
    reward: 5 + Math.min(10, difficulty * 2)
  };

  return {
    startNode: startId,
    nodes
  };
}

/*original method
export function generateWorld(levelPool: Level[], difficulty: number): WorldMap {
  const pick = () => levelPool[Math.floor(Math.random() * levelPool.length)];

  const start = "start";
  const a1 = "pathA_1";
  const a2 = "pathA_2";
  const b1 = "pathB_1";
  const b2 = "pathB_2";
  const merge = "shop";
  const final = "boss";

  return {
    startNode: start,
    nodes: {
      [start]: {//have a shop at start?
        id: start,
        //level: arena,
        type: "level",
        next: [a1, b1],
        position: { x: 200, y: 400 },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 3
      },
      [a1]: {
        id: a1,
        level: pick(),
        type: "level",
        next: [a2],
        position: { x: 100, y: 250 },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 3
      },
      [a2]: {
        id: a2,
        level: pick(),
        type: "level",
        next: [merge],
        position: { x: 100, y: 100 },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 3
      },
      [b1]: {
        id: b1,
        type: "level",
        level: pick(),
        next: [b2],
        position: { x: 300, y: 250 },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 3
      },
      [b2]: {
        id: b2,
        type: "level",
        level: pick(),
        next: [merge],
        position: { x: 300, y: 100 },
        company: chooseRandomCompany(),
        difficultyMod: 1,
        reward: 5
      },
      [merge]: {
        id: merge,
        type: "shop", //might have themed shops later
        next: [final],
        position: { x: 200, y: 50 },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 0
      },
      [final]: {
        id: final,
        type: "boss",
        level: pick(),
        next: [],
        position: { x: 200, y: 0 },
        company: chooseRandomCompany(),
        difficultyMod: 0,
        reward: 2
      }
    }
  };
}*/