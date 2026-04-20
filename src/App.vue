<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import Board from './components/Board.vue';
import Leveleditor from './components/Leveleditor.vue';
import { castled, level1Levels } from './level1Levels';
import { Player } from "./Player";
import { Item, Voucher, allItems } from "./Items";
import type { ItemConstructor } from "./Items";
import { allAdmins } from "./AdminPrograms";
import { Admin } from "./AdminPrograms";
import type { AdminTrigger } from "./AdminPrograms";
import PlayerView from "./components/PlayerView.vue";
import type { Piece } from "./Pieces"
import { Spawn, Dolls } from './Pieces';
import { allPieces } from "./Pieces"
import type { Coordinate, PieceBlueprint, Level, OS, Company } from "./types";
import { runEnemyStateMachine } from "./Enemy";
import WorldMap from "./components/WorldMap.vue";
import { applyVariant, coordKey, findAnyPiecesInRange, getOccupiedTileSet, getTilesInRange, makeBlueprint, pickWeightedRandom, pickWeightedRandomItem, rollVariant, isSoundEnabled } from "./helperFunctions";
import Shop from "./components/Shop.vue";
import BossView from "./components/BossView.vue";
import RoundSummary from "./components/RoundSummary.vue";
import { DIFFICULTY_RARITY } from "./constants";
import BlueprintView from "./components/BlueprintView.vue";
import MainMenu from "./components/MainMenu.vue";
import PieceController from "./components/PieceController.vue";
import HybridCompiler from "./components/HybridCompiler.vue";
import Collection from "./components/Collection.vue";
import { applyTutorialTooltips, reapplyTutorialTooltips } from "./tutorial.ts";
import { allTips } from "./tutorialSteps.ts";
import { StorageManager } from "./StorageManager";
import Altar from "./components/Altar.vue";
import Duplicator from "./components/Duplicator.vue";
import Workbench from "./components/Workbench.vue";
import { Random } from "./Random";
import { allOSes } from "./Operators.ts";

const testSword = {
  id: "274ec329-8c17-4265-8c12-e9a28bcf0833",
  name: "Knife",
  description: "A basic attack piece",
  unicode: "U+1F52A",
  maxSize: 3,
  moves: 2,
  range: 1,
  attack: 2,
  defence: 0,
  rarity: 1,
  color: "#2fc5ebff",
  isPlaced: false,
  cost: 1,
  immunities: {}
}
const testShield = {
  id: "274ec329-8c17-4265-8c12-e9a28bcf0111",
  name: "Shield",
  description: "A basic defensive piece",
  unicode: "U+1F6E1",
  maxSize: 3,
  moves: 2,
  range: 0,
  attack: 0,
  defence: 1,
  rarity: 1,
  color: "#2fc5ebff",
  isPlaced: false,
  cost: 1,
  immunities: {}
}
const test = {
  id: "274ec329-8c17-4265-8c12-e9a28bcf0112",
  name: "Lance",
  description: "A test piece",
  unicode: "U+1F3A0",
  maxSize: 3,
  moves: 2,
  range: 3,
  attack: 2,
  defence: 0,
  rarity: 1,
  color: "#2fc5ebff",
  isPlaced: false,
  cost: 1,
  hybridName: 'LanceHog',
  extraUnicode: 'U+1F994',
  immunities: {}
}
const testVoucher = new Voucher();

const swapDisplay = () => {
  displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
}

const stake = ref(0);//player
const gameStarted = ref(false);

const player = ref(new Player(
  'U+1F60A',
  50, // starting money
  5,  // memory limit
  5, //admin slots
  [testVoucher], // no items yet
  [testSword, testShield, test],//, testShield] // starting pieces
  [],//no admins yet
  2,
  5,
  0,
  0,
  0,
  0,
  stake.value
));
const showInventory = ref(true);
//function closeInventory(){
//showInventory.value = false;
//}
function toggleInventory() {
  showInventory.value = !showInventory.value;
}
const showMainMenu = ref(true);
const currentSeed = ref<string>("");

function createNewPlayer(payload: { os: OS, seed: string, stake?: number }) {
  let { os, seed, stake: payloadStake } = payload;
  let rawSeed = seed;

  if (payloadStake !== undefined) {
    stake.value = payloadStake;
  }

  if (!rawSeed) {
    rawSeed = Math.random().toString(36).substring(2, 10).toUpperCase();
  } else {
    // Standardize: if the seed starts with any OS prefix, we strip it to get the raw PRNG part.
    // This handles cases where a full prefixed seed is pasted into the box but a regular OS button is clicked.
    const allPrefixes = allOSes.map(o => o.prefix).filter(p => !!p);
    if (allPrefixes.includes(rawSeed.charAt(0)) && rawSeed.length > 8) { // Seeds are usually 8 chars + 1 prefix
      rawSeed = rawSeed.substring(1);
      // New seeds also contain the stake as the next character (e.g. S0, S1)
      const possibleStake = parseInt(rawSeed.charAt(0), 10);
      if (!isNaN(possibleStake)) {
        stake.value = possibleStake;
        rawSeed = rawSeed.substring(1);
      }
    }
  }

  currentSeed.value = (os.prefix || "") + stake.value.toString() + rawSeed;

  Random.setSeed(rawSeed);

  player.value.difficulty = 1
  player.value = new Player(
    os.unicode,
    os.money,
    os.memory,
    os.adminSlots,
    os.items,
    os.blueprints,
    os.admins,
    os.lives,
    5,
    0,
    0,
    0,
    0,
    stake.value
  )

  // Track this OS as played
  StorageManager.recordOS(os.unicode);

  // Unlock starting inventory in the collection
  os.blueprints.forEach(bp => StorageManager.unlockPiece(bp.name));
  os.admins.forEach(admin => StorageManager.unlockAdmin(admin.name));
  os.items.forEach(item => StorageManager.unlockItem(item.name));

  showMainMenu.value = false;
  showMap.value = true;
  gameStarted.value = true;
  currentCompany.value = { name: 'Player', abbr: '', unicode: player.value.osunicode, pieceList: [], tileColor: "rgb(17, 31, 15)", edgeColor: "#9CC954" };
  refreshShop(true);
  player.value.canPlace = false;
}
const showCollection = ref(false);

function incrementMapProgress() {
  player.value.extraDifficulty = 0;
  player.value.mapProgress++
  //console.log('progress increased:', mapProgress.value)
  if (player.value.hasAdmin('Clippy')) {
    reapplyTutorialTooltips(200);
  }
}

function openMainMenu() {
  showBoard.value = false;
  showSummary.value = false;
  showMainMenu.value = true;
  //sessionStorage.clear();
  //localStorage.clear(); // only if you aren't using it yet
  window.location.reload();
}
const showFastControls = ref<boolean>(true);
function toggleFastControls() {
  showFastControls.value = !showFastControls.value
}

function sellBlueprint(pieceId: string) {
  // find the index
  const idx = player.value.programs.findIndex(p => p.id === pieceId);
  if (idx === -1) return; // piece not found

  const piece = player.value.programs[idx];

  // remove from programs
  player.value.programs.splice(idx, 1);
  pieceToPlace.value = null;
  // refund money (e.g., half cost or some formula)
  player.value.money += piece.rarity;
}

function sellItem(itemId: string) {
  const idx = player.value.items.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const item = player.value.items[idx];
  player.value.items.splice(idx, 1);
  player.value.money += Math.round(item.cost / 2);
}

function sellAdmin(itemId: string) {//TODO NEXT
  const idx = player.value.admins.findIndex(i => i.id === itemId);
  if (idx === -1) return;
  const admin = player.value.admins[idx];
  if (admin.triggerType === 'other' && admin.targetType === 'player') {
    admin.remove({ player: player.value });
  }
  player.value.admins.splice(idx, 1);
  player.value.money += Math.round(admin.cost / 2);
}

function handleApplyItem(payload: { item: Item, id: string }) {
  const item = payload.item;
  const itemMult = 1 + player.value.admins.filter(a => a.name === 'Chemistry').length;
  console.log('itemMult:', itemMult);
  if (item.targetType === 'playerAndGame' && selectedPiece.value) {
    if (item.name === 'Jar' && selectedPiece.value.team === 'enemy' && selectedPiece.value.defenceRemaining <= 0 && selectedPiece.value.tiles.length <= 1) {
      item.apply({ id: selectedPiece.value.id, activePieces: activePieces.value, player: player.value }, itemMult);
      player.value.removeItem(item);
      deselectPiece();
    } else {
      item.apply({ id: selectedPiece.value.id, activePieces: activePieces.value, player: player.value }, itemMult);
    }
  }
  if (item.targetType === 'piecesAndBoard') {
    item.apply({ activePieces: activePieces.value, board: level.value.tiles }, itemMult);
    playerSpawns.value = newPlacementHighlights();
    player.value.removeItem(item);
  }
  //check it is to be applied to playerBlueprints
  if (item.targetType === "blueprint") {
    const id = payload.id;
    const blueprint = player.value.programs.find(bp => bp.id === id);
    if (!blueprint) return;
    player.value.applyItemToPieceBlueprint(payload, itemMult);
    return;
  }
  if (item.targetType === "piece" && selectedPiece.value) {
    const id = selectedPiece.value?.id;
    const piece = activePieces.value.find(p => p.id === id);
    if (!piece) return;
    item.apply(piece, itemMult);
    player.value.removeItem(item)
    return;
  }

  if (item.targetType === "player") {
    item.apply(player.value, itemMult);
    if (!['Gift Box', 'Genie', 'Mystery Box', 'Pinata', 'Pandora', 'Dupe'].includes(item.name)) {
      player.value.removeItem(item);
    }
  }

  if (item.targetType === "shopItem" && item.name === 'Voucher') {
    console.log('using voucher on ', shopTarget.value?.name)
    if (shopTarget.value?.id) {
      const id = shopTarget.value.id;
      const shopBp = shopBlueprints.value.find(p => p.id === id);
      const shopItem = shopItems.value.find(i => i.id === id);
      if (shopBp) {
        item.apply(shopBp, 1)
        player.value.removeItem(item)
      }
      if (shopItem) {
        item.apply(shopItem, 1)
        player.value.removeItem(item)
      }
    }
  }

  if (item.targetType === 'gameState') {
    if (item.name === 'Hourglass') {
      reloadLevel();
      player.value.removeItem(item);
    }
    if (item.name === 'Magic Wand') {
      //if(player placed last turn, (there is an extra player piece in active not in lastturn) find the blueprint by piece name in player.programs and renew that blueprint if it exists)
      //then:
      const lastIds = new Set(lastTurnPieces.value.map(p => p.id));
      const newPiece = activePieces.value.find(p => !lastIds.has(p.id)) || null;
      if (newPiece) {
        const bp = player.value.programs.find(
          bp => bp.name === newPiece.name
        );
        if (bp) {
          bp.isPlaced = false; // or bp.reset(), if you have a helper
        }
      }
      activePieces.value = lastTurnPieces.value.map(p => p.clone());
      // pieces in lastTurn but NOT in activePieces
      const diedThisTurn = lastTurnPieces.value.filter(
        lp => !activePieces.value.some(ap => ap.id === lp.id)
      );

      diedThisTurn.forEach(dead => {
        const idx = graveyard.value.findIndex(g => g.id === dead.id);
        if (idx !== -1) {
          graveyard.value.splice(idx, 1); // remove from graveyard
        }
      });
      activePieces.value.forEach(piece => {
        piece.movesRemaining = piece.moves;
        piece.actions = 1
      })
      player.value.removeItem(item);
      player.value.canMove = true;
      player.value.canPlace = true;
      player.value.canAction = true;
    }
    item.apply(activePieces.value, itemMult);
    player.value.removeItem(item)// not working for keygen?
  }

  /*if(item.targetType === 'piecesAndBoard'){
    item.apply(activePieces, level.value.tiles);//{activePieces, board }: {activePieces: Piece[], board: Coordinate[] }
  }*/

  console.warn("Item has unknown target type:", item.targetType);
  //selectedPiece.value =
}
//or gameState
//or shop/shop items


//SHOP functions
const shopTarget = ref<PieceBlueprint | Item | null>(null);
function clearShopTarget() {
  shopTarget.value = null;
}
function selectShopTarget(target: Item | PieceBlueprint | null) {
  shopTarget.value = target;
}

const shopBlueprints = ref<PieceBlueprint[]>([]);
const shopItems = ref<Item[]>([]);
const rerollCost = ref(player.value.hasAdmin('Wheel of Dharma') ? 0 : 5);//to be reset after shop
const prevFib = ref(0);//to be reset after shop
const currentFib = ref(1);//to be reset after shop
const canProceedFromShop = ref<boolean>(false);
const hasStolenFromThisShop = ref<boolean>(false);

function refreshShop(isFree: boolean) {
  shopTarget.value = null;
  if (!isFree && !player.value.hasAdmin('Wheel of Dharma')) {//player is rerolling
    player.value.spend(rerollCost.value);
    const nextFib = prevFib.value + currentFib.value;
    prevFib.value = currentFib.value;
    currentFib.value = nextFib;
    if (player.value.hasAdmin('Wheel of Dharma')) {
      rerollCost.value = 0;
    } else {
      rerollCost.value += currentFib.value;
    }
  } else { //boss/level has been defeated
    rerollCost.value = player.value.hasAdmin('Wheel of Dharma') ? 0 : 5;
    prevFib.value = 0;
    currentFib.value = 1;
    hasStolenFromThisShop.value = false;
  }
  if (player.value.hasAdmin("Slots")) {
    rerollCost.value = Math.max(0, rerollCost.value - 2);
  }

  const appraisalDiscount = 2 * player.value.admins.filter(a => a.name === 'Appraisal').length;

  const classes = [
    pickWeightedRandom(allPieces, player.value),
    pickWeightedRandom(allPieces, player.value),
    pickWeightedRandom(allPieces, player.value),
  ];
  shopBlueprints.value = classes.map(c => makeBlueprint(c.class, c.variant ?? undefined, appraisalDiscount));

  //no reappearing admins
  const ownedAdmins = new Set(player.value.admins.map(a => a.name));
  const availableAdmins = (player.value.hasAdmin('Bouquet')) ? allAdmins : allAdmins.filter(AdminClass => !ownedAdmins.has(AdminClass.name));

  const allItemsAndAdmins: ItemConstructor[] = [...allItems, ...availableAdmins];
  shopItems.value = [
    pickWeightedRandomItem(allItemsAndAdmins, player.value, appraisalDiscount),
    pickWeightedRandomItem(allItemsAndAdmins, player.value, appraisalDiscount),
    pickWeightedRandomItem(allItemsAndAdmins, player.value, appraisalDiscount),
  ];
  if (player.value.hasAdmin('Department Store')) {
    const extraP = pickWeightedRandom(allPieces, player.value);
    shopBlueprints.value.push(makeBlueprint(extraP.class, extraP.variant ?? undefined, appraisalDiscount));
    const extraI = pickWeightedRandomItem(allItems, player.value, appraisalDiscount);
    const extraA = pickWeightedRandomItem(availableAdmins, player.value, appraisalDiscount);
    shopItems.value.push(extraI, extraA);
  }
  //if triggered by player
}

function buyBlueprint(bp: PieceBlueprint) {
  shopBlueprints.value = shopBlueprints.value.filter(b => b.id !== bp.id);
  if (player.value.hasAdmin('Five Finger Discount') && !hasStolenFromThisShop.value) {
    hasStolenFromThisShop.value = true;
  } else {
    player.value.spend(bp.cost);
    if (player.value.hasAdmin('Piggy')) {
      player.value.money += 2;
    }
  }
  player.value.addProgram(bp);
  shopTarget.value = null;
}
async function buyItem(item: Item) {
  shopItems.value = shopItems.value.filter(i => i.id !== item.id);
  if (player.value.hasAdmin('Five Finger Discount') && !hasStolenFromThisShop.value) {
    hasStolenFromThisShop.value = true;
  } else {
    player.value.spend(item.cost);
    if (player.value.hasAdmin('Piggy')) {
      player.value.money += 2;
    }
  }
  // decide which inventory to place it in
  if (item instanceof Admin) {
    player.value.admins.push(item);
    StorageManager.unlockAdmin(item.name);
    if (item.targetType === 'player' && item.triggerType == 'other') {
      await item.apply({ player: player.value })
    }
  } else {
    player.value.items.push(item);
    StorageManager.unlockItem(item.name);
  }
  shopTarget.value = null;
}
const showShop = ref(false)
const showCompiler = ref(false)
const showAltar = ref(false)
const showDuplicator = ref(false)
const showWorkbench = ref(false)
const showMap = ref(false)
const showBoard = ref(false)
//--shop-----

//round logic
const roundHasStarted = ref(false);//player
//pieceMap to track occupied spaces
const activePieces = ref<InstanceType<typeof Piece>[]>([]);
const graveyard = ref<InstanceType<typeof Piece>[]>([]);
//Record: key ID, Modifier for piece with that ID
//stats should be applied to activePieces after select level
const bossAdmins = ref<Admin[]>([]);
function addBossAdmin(admin: Admin) {
  bossAdmins.value.push(admin)
  StorageManager.unlockBoss(admin.name);
}
function replaceBosses(admins: Admin[]) {
  bossAdmins.value = admins;
}

async function handleApplyAdmins(trigger: AdminTrigger, id: string, piece?: Piece, onAdminTriggered?: () => Promise<void>) {//admin and target
  const playerAdmins = player.value.admins;
  for (const admin of playerAdmins) {
    if (admin.disabled) continue;
    if (trigger === admin.triggerType) {
      if (admin.triggerType === 'onTurnStart' || admin.triggerType === 'onRoundLoss') {
        admin.isTriggering = true;
        setTimeout(() => admin.isTriggering = false, 500);
      }
      // sort through target types, decide what to pass
      console.log(admin.name, 'trigger', trigger)
      if (admin.targetType === 'gameState') {
        await admin.apply({ id: id, activePieces: activePieces.value, piece })
      }
      if (admin.targetType === 'playerAndGame') {
        await admin.apply({ id: id, activePieces: activePieces.value, player: player.value, piece })
      }
      if (admin.targetType === 'piecesAndBoard') {
        await admin.apply({ activePieces: activePieces.value, board: level.value.tiles })
      }
      if (admin.targetType === 'player') {
        await admin.apply({ player: player.value, piece })
      }
      if (onAdminTriggered) await onAdminTriggered();
    }
  }
  //we do bosses second for onPlacement immunities to take effect
  if (!player.value.hasAdmin('Umbrella')) {
    for (const admin of bossAdmins.value) {
      if (trigger === admin.triggerType) {//'onTurnStart' 'onRoundEnd' 'onReceiveDamage' 'onRoundLoss'  | 'other';
        if (admin.triggerType === 'onTurnStart' || admin.triggerType === 'onRoundLoss') {
          admin.isTriggering = true;
          setTimeout(() => admin.isTriggering = false, 500);
        }
        // sort through target types, decide what to pass
        if (admin.targetType === 'player') {
          await admin.apply({ player: player.value })
        }
        if (admin.targetType === 'gameState') {
          await admin.apply({ id: id, activePieces: activePieces.value, piece })
        }
        if (admin.targetType === 'playerAndGame') {
          await admin.apply({ id: id, activePieces: activePieces.value, player: player.value })
        }
        if (admin.targetType === 'piecesAndBoard') {
          await admin.apply({ activePieces: activePieces.value, board: level.value.tiles })
        }
        if (admin.targetType === 'all') {
          await admin.apply({ id, activePieces: activePieces.value, removeCallback: removePiece, board: level.value.tiles, player: player.value, playerSpawns: playerSpawns.value, bosses: bossAdmins.value });//, graveyard: graveyard.value})
        }
        if (onAdminTriggered) await onAdminTriggered();
      }
    }
  };
}

const selectedPiece = ref<Piece | null>(null)
const playerSpawns = ref<Coordinate[]>([]);
const isPlacing = ref(false);//player
const isMoving = ref(false);//player
const hasFinishedTurn = ref(false);//player
const isFirstTurn = ref(true);//player
const pieceToPlace = ref<PieceBlueprint | null>(null);
//world logic
const showSummary = ref(false);//player
const level = ref(castled);//tiles
const displayEditor = ref(false);
const foggedTiles = ref<Coordinate[]>([]);//player

function clearFog() {
  if (!player.value.fogged) return;
  const revealKeys = new Set<string>();
  playerSpawns.value.forEach(p => revealKeys.add(`${p.x},${p.y}`));

  const levelSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));
  /*if (selectedPiece.value) {//for persistant clearance
    const piece = selectedPiece.value;  
    const rangeTiles = getTilesInRange(piece.headPosition, piece.range, levelSet);
    rangeTiles.forEach(t => revealKeys.add(`${t.x},${t.y}`));
  }*/

  //for non persistent clearance - we need to do all active pieces every time
  activePieces.value.forEach(pieceToCheck => {
    if (pieceToCheck.team === 'player') {
      const rangeTiles = getTilesInRange(pieceToCheck.headPosition, pieceToCheck.range, levelSet);
      rangeTiles.forEach(t => revealKeys.add(`${t.x},${t.y}`));
      pieceToCheck.tiles.forEach(t => revealKeys.add(`${t.x},${t.y}`));
    }
  });

  // 2. Filter the foggedTiles by checking if their key exists in the revealKeys Set
  // This removes both spawns and piece-range in one go without overwriting
  foggedTiles.value = foggedTiles.value.filter(tile =>
    !revealKeys.has(`${tile.x},${tile.y}`)
  );
}

//map
const toggleMap = () => {
  showMap.value = !showMap.value;
}
const openSummary = (state: boolean) => {
  showSummary.value = state;
}

const renewBlueprints = async () => {
  for (const blueprint of player.value.programs) {
    blueprint.isPlaced = false;
  };
}

const lastTurnPieces = ref<InstanceType<typeof Piece>[]>([]);//player
const originalPieces = ref<InstanceType<typeof Piece>[]>([]);//player
const originalSpawns = ref<Coordinate[]>([]);//player
const currentCompany = ref<Company>({ name: 'Player', abbr: '', unicode: player.value.osunicode || '', pieceList: [], tileColor: "rgb(17, 31, 15)", edgeColor: "#9CC954" });

async function selectLevel(newLevel: Level, company: Company, difficultyMod: number, lReward: number) {//load level, start 
  pieceToPlace.value = null;
  currentCompany.value = { ...company };
  showBoard.value = true;
  renewBlueprints()//shouldnt be needed in final;
  for (const admin of player.value.admins) {
    admin.disabled = false;
  }
  hasFinishedTurn.value = false;
  player.value.canPlace = true;
  player.value.canMove = true;
  player.value.canAction = true;
  isFirstTurn.value = true;
  activePieces.value = [];
  graveyard.value = [];
  level.value = newLevel;
  player.value.nextReward = lReward;
  const newPieces = rehydratePieces(newLevel.pieces);
  player.value.extraDifficulty = difficultyMod;
  activePieces.value = processSpawnPoints(newPieces, company.pieceList, difficultyMod);
  console.log('originalSpawns: ', originalSpawns.value);
  //originalSpawns.value = [...playerSpawns.value];
  originalPieces.value = activePieces.value.map(p => p.clone());
  //originalSpawns.value = playerSpawns.value.map(s => ({ ...s }));
  boardRef.value.clearHighlights();
  await handleApplyAdmins('onRoundStart', '');
  if (player.value.fogged) {
    foggedTiles.value = [...level.value.tiles];
    clearFog();
  }
  showMap.value = false;
  roundHasStarted.value = true;
}

function handleProceed() {
  for (const admin of player.value.admins) {
    if (admin.onRoundEnd) admin.onRoundEnd();
  };
  const currentBossAdmins = [...bossAdmins.value];
  for (const admin of currentBossAdmins) {
    if (admin.onRoundEnd) admin.onRoundEnd(bossAdmins.value);
  };
  openSummary(false);
  incrementMapProgress();
  if (player.value.mapProgress >= 3) {
    increaseDifficulty();
    player.value.mapProgress = 0
    if (player.value.bossesCleared > 6) {
      player.value.hasWonGame = false;
    }
  }
  showMap.value = true;
  currentCompany.value.abbr = '';
  currentCompany.value.unicode = player.value.osunicode;
}

async function reloadLevel() {
  for (const admin of player.value.admins) {
    admin.disabled = false;
    if (admin.onRoundEnd) admin.onRoundEnd();
  };
  const currentBossAdmins = [...bossAdmins.value];
  for (const admin of currentBossAdmins) {
    if (admin.onRoundEnd) admin.onRoundEnd(bossAdmins.value);
  };
  renewBlueprints();
  activePieces.value = originalPieces.value.map(p => p.clone());
  //if piece has no tiles, use headposition
  graveyard.value = [];
  lastTurnPieces.value = originalPieces.value.map(p => p.clone());
  console.log('originalspawns:', originalSpawns.value);
  playerSpawns.value = originalSpawns.value.map(s => ({ ...s }));//not working?
  console.log('playerSpawns:', playerSpawns.value);
  selectedPiece.value = null;
  isPlacing.value = true;
  openSummary(false);
  await handleApplyAdmins('onRoundStart', '');
  roundHasStarted.value = true;
  isFirstTurn.value = true;
  if (player.value.fogged) {
    foggedTiles.value = [...level.value.tiles];
    clearFog();
  }
}

function retryLevel() {
  if (player.value.lives <= 1) return
  player.value.lives--
  reloadLevel();
}

//game loop
const shopDisabled = ref<boolean>(false);
const openDisabledShop = () => {
  console.log('shop disabled')
  shopDisabled.value = true;
  showShop.value = true;
  canProceedFromShop.value = false;
}
const toggleShop = () => {
  showShop.value = !showShop.value;
  shopDisabled.value = false;
  canProceedFromShop.value = false;
}
const openShop = () => {
  showShop.value = true;
  canProceedFromShop.value = true;
  shopDisabled.value = false;
}
const closeShop = () => {
  showShop.value = false;
  if (!shopDisabled.value && canProceedFromShop.value) {
    refreshShop(true);
  }
  canProceedFromShop.value = false;
}
const toggleCompiler = () => {
  showCompiler.value = !showCompiler.value;
}
const openCompiler = () => {
  showCompiler.value = true;
}
const toggleAltar = () => {
  showAltar.value = !showAltar.value;
}
const openAltar = () => {
  showAltar.value = true;
}
const toggleDuplicator = () => {
  showDuplicator.value = !showDuplicator.value;
}
const openDuplicator = () => {
  showDuplicator.value = true;
}
const toggleWorkbench = () => {
  showWorkbench.value = !showWorkbench.value;
}
const openWorkbench = () => {
  showWorkbench.value = true;
}

const newPlacementHighlights = (): Coordinate[] => {//board should only show these if isPlacing
  const highlights: Coordinate[] = [];
  const tileSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));

  activePieces.value.forEach(piece => {
    if (piece.team === 'player') {
      // For each tile of the piece, check the 4 orthogonal neighbors
      piece.tiles.forEach(tile => {
        const neighbors = [
          { x: tile.x + 1, y: tile.y },
          { x: tile.x - 1, y: tile.y },
          { x: tile.x, y: tile.y + 1 },
          { x: tile.x, y: tile.y - 1 },
        ];

        neighbors.forEach(n => {
          // Skip tiles not on the board
          if (!tileSet.has(`${n.x},${n.y}`)) return;
          // Skip if tile is already occupied
          const isOccupied = activePieces.value.some(p =>
            p.tiles.some(t => t.x === n.x && t.y === n.y)
          );

          if (!isOccupied) highlights.push(n);
        });
      });
    }
  });
  // Optional: remove duplicates
  const uniqueHighlights = Array.from(
    new Map(highlights.map(h => [`${h.x},${h.y}`, h])).values()
  );
  return uniqueHighlights;
};

//(pieces(already in level), companyPieceList, mod)
function processSpawnPoints(pieces: Piece[], companyPieces: any[], mod: number) {
  const processed: Piece[] = [];
  const newPlayerSpawns: Coordinate[] = [];

  for (const piece of pieces) {
    if (piece instanceof Spawn) {
      const spawnSize = piece.tiles.length;
      // Enemy spawn → replace with random enemy piece
      if (piece.team === 'enemy') {
        //difficulty from constants ramp
        let trueDifficulty = 0;
        if (player.value.difficulty + mod > 6) {
          trueDifficulty = 6; //remove later when endless mode is done
        } else if (player.value.difficulty + mod < 1) {
          trueDifficulty = 1;
        } else {
          trueDifficulty = player.value.difficulty + mod;
        }
        const { min, max } = DIFFICULTY_RARITY[trueDifficulty];

        // 1. Get all enemies that match the current difficulty rarity
        const difficultyMatched = companyPieces.filter(EnemyClass => {
          if (EnemyClass.name === "Nuke") return false;

          // Create a temp instance to check rarity and maxSize
          const temp = new EnemyClass(piece.headPosition, 'enemy', removePiece);
          return temp.rarity >= min && temp.rarity <= max;
        });
        // 2. Try to find one from that group that fits the spawn size
        let pool = difficultyMatched.filter(EnemyClass => {
          const temp = new EnemyClass(piece.headPosition, 'enemy', removePiece);
          return temp.maxSize >= spawnSize;
        });
        // 3. FALLBACK: If none fit the size, stay within the difficulty but allow smaller pieces
        if (pool.length === 0) {
          console.warn(`No enemy of rarity ${min}-${max} fits spawn size ${spawnSize}. Falling back to smaller units.`);
          pool = difficultyMatched;
        }
        // 4. LAST RESORT: If no enemies match the rarity at all, only then use allPieces
        /*if (pool.length === 0) {
          pool = allPieces;
        }*/

        const EnemyClass = Random.pick(pool);

        const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', removePiece);
        enemyInstance.tiles = piece.tiles.slice(0, enemyInstance.maxSize);//trims the larger spawn down, might be a problem on castled
        
        const variantChance = Math.min((0.1 * trueDifficulty - 0.1), 1)
        const variant = rollVariant(variantChance, trueDifficulty);
        if (variant) {
          applyVariant(enemyInstance, variant);
        }
        enemyInstance.defenceRemaining = enemyInstance.getStat('defence');//not working??
        //add tiles here? if spawn.tiles.length <= enemy.getStat(maxsize){ enemy.tiles = spawn.tiles }

        if (player.value.stake > 1) enemyInstance.maxSize += player.value.difficulty;
        if (player.value.stake > 2) enemyInstance.defence += player.value.difficulty;
        if (player.value.stake > 3) enemyInstance.moves += player.value.difficulty;
        if (player.value.stake > 4) enemyInstance.attack += player.value.difficulty;
        if (player.value.stake > 5) enemyInstance.range += player.value.difficulty;

        processed.push(enemyInstance);
        continue;
      }

      if (piece.team === 'player') {
        //placementHighlights.value.push(piece.headPosition);
        newPlayerSpawns.push(piece.headPosition);
        // Do *not* add Spawn to active pieces — it is a marker, not a unit
        continue;
      }
    }
    //console.log("placementHighlights after:", playerSpawns.value);
    processed.push(piece);
  }
  playerSpawns.value = newPlayerSpawns;
  originalSpawns.value = newPlayerSpawns.map(s => ({ ...s }));

  return processed;
}

function rehydratePieces(rawPieces: any[]): InstanceType<typeof Piece>[] {
  const pieceClasses = [...allPieces];
  pieceClasses.unshift(Spawn);
  return rawPieces.map(p => {
    const PieceClass = pieceClasses.find(cls => cls.name === p.name)
    return PieceClass ? Object.assign(new PieceClass(p.headPosition, p.team, removePiece), p) : p
  })
}

onMounted(() => {
  const initPieces = rehydratePieces(level.value.pieces);
  activePieces.value = processSpawnPoints(initPieces, allPieces, 0); // sets placementHighlights internally
  refreshShop(true)//handle in round, or don't for crystal ball
});

//round state functions
function highlightPlacements(pieceBlueprint: PieceBlueprint) {
  if (!roundHasStarted) return
  boardRef.value.clearHighlights();
  if (player.value.hasAdmin('Backdoor')) {
    const unnocupiedSpaces: Coordinate[] = [];
    level.value.tiles.forEach(tile => {
      const isOccupied = activePieces.value.some(p =>
        p.tiles.some(t => t.x === tile.x && t.y === tile.y)
      );
      if (!isOccupied) unnocupiedSpaces.push(tile);
    });
    playerSpawns.value = unnocupiedSpaces;
  }
  else if (!isFirstTurn.value) {
    playerSpawns.value = newPlacementHighlights();
  }
  pieceToPlace.value = pieceBlueprint;
  isPlacing.value = true;
}

async function removePiece(piece: Piece) {
  if (player.value.hasAdmin('Parachute') && piece.team === 'player') {
    piece.tiles = [piece.headPosition];
    const index = player.value.admins.findIndex(a => a.name === 'Parachute');
    if (index !== -1) player.value.admins.splice(index, 1);
  } else {
    const idx = activePieces.value.findIndex(p => p.id === piece.id);
    if (idx !== -1) {
      activePieces.value.splice(idx, 1);
    }
    await handleApplyAdmins('onPieceDestruction', piece.id, piece);
    //graveyard?
    if (piece.name == 'Dolls') {
      if (piece.getStat('maxSize') > 1) {
        const NewDoll = new Dolls(
          piece.headPosition,
          piece.team,
          removePiece,
          crypto.randomUUID()
        );
        NewDoll.maxSize = piece.getStat('maxSize') - 1;
        activePieces.value.push(NewDoll);
      }
    }
    checkForRoundEnd();
  }
}

function instantiatePieceFromBlueprint(//this goes in app
  bp: PieceBlueprint,
  coord: Coordinate,
  team: string,
  removeCallback: (p: Piece) => void
): Piece {

  /*const primaryName =
  bp.hybridName ? bp.hybridName : bp.name*/

  // Step 1: always instantiate PRIMARY class
  const PieceClass = allPieces.find(p => p.name === bp.name)
  if (!PieceClass) {
    throw new Error(`Unknown piece: ${bp.name}`)
  }

  const piece = new PieceClass(coord, team, removeCallback, bp.id)

  piece.maxSize = bp.maxSize
  piece.moves = bp.moves
  piece.range = bp.range
  piece.attack = bp.attack
  piece.defence = bp.defence
  piece.defenceRemaining = bp.defence
  piece.immunities = bp.immunities;

  // Step 3: hybrid-specific augmentation
  if (bp.hybridName) {
    piece.hybridName = bp.hybridName;
    piece.description = bp.description;
    //piece.unicode = bp.unicode //should already be the case
    piece.extraUnicode = bp.extraUnicode
  }
  if (bp.variantName) {
    piece.variantName = bp.variantName;
  }

  return piece;//modified piece with new stats
}

async function placePieceOnBoardAt(coord: Coordinate) {
  if (!pieceToPlace.value) return

  const bp = pieceToPlace.value;
  pieceToPlace.value = null;

  const PieceInstance = instantiatePieceFromBlueprint(bp, coord, 'player', removePiece)
  if (!PieceInstance) return

  //we're definitely making a move, so store pieces
  lastTurnPieces.value = activePieces.value.map(p => p.clone());

  //pass admin modifiers to the piece
  PieceInstance.movesRemaining = PieceInstance.getStat('moves');
  activePieces.value.push(PieceInstance);

  // Mark blueprint as placed so it greys in inventory
  bp.isPlaced = true

  // Reset placement state
  await handleApplyAdmins('onPlacement', PieceInstance.id)
  playerSpawns.value = newPlacementHighlights();
  clearFog();

  //applyStatModifications()
  //if(player.value.hasAdmin('Copier')){}

  const hasDove = player.value.hasAdmin('Dove');
  const hasPalette = player.value.hasAdmin('Palette');

  // First-turn rules
  if (isFirstTurn.value) {
    player.value.canAction = false;//admin for attacking on first turn?
    // palette: allow one extra placement
    if (hasPalette) {
      player.value.canPlace = true; // allow next placement
    } else {
      player.value.canPlace = false; // normally cannot place again
    }
    // dove: allow one move after placing
    if (hasDove) {
      player.value.canMove = true;
    } else {
      player.value.canMove = false;
    }
    isFirstTurn.value = false; //must set to false after to avoid a loop
    // If neither admin, end immediately
    if (!hasDove && !hasPalette) {
      await endTurn();
    }
  } else {
    // Not first turn -> normal behaviour
    isPlacing.value = false;
    await endTurn();
  }
}

const isDraggingPlacement = ref(false)

function startPlacementDrag(bp: PieceBlueprint) {
  console.log('dragging')
  pieceToPlace.value = bp
  isPlacing.value = true
  isDraggingPlacement.value = true
  //debug here
}

//mousemove func 'hoverPlacement'

function placeAt(coord: Coordinate) {
  const isOccupied = activePieces.value.some(p =>
    p.tiles.some(t => t.x === coord.x && t.y === coord.y)
  );
  if (isOccupied) return;
  if (!playerSpawns.value.some(
    s => s.x === coord.x && s.y === coord.y
  )) {
    pieceToPlace.value = null;
    isPlacing.value = false;
    isDraggingPlacement.value = false;
    boardRef.value.clearHighlights();
    return
  }

  placePieceOnBoardAt(coord);
  isDraggingPlacement.value = false;
}

function clearDrag() {//TODO reuse in board when we click normally
  pieceToPlace.value = null;
  isPlacing.value = false;
  isDraggingPlacement.value = false;
}
//previous board functions
//highlight functions
const boardRef = ref();

//selectedPiece functions
function handlePieceSelect(piece: Piece) {
  if (isPlacing.value) {
    isPlacing.value = false;
    pieceToPlace.value = null;
    if (player.value.hasAdmin('Backdoor')) {
      const occupied = getOccupiedTileSet(activePieces.value);
      playerSpawns.value = level.value.tiles?.filter(tile =>
        !occupied.has(coordKey(tile))
      );
    }
  }
  if (!(piece.statuses.hidden && piece.team === 'enemy')) {
    selectedPiece.value = piece
  }
  //highlight range
  if (piece.team === 'enemy' && !piece.statuses.charmed) {
    boardRef.value.highlightTargets(piece);
  } else if (player.value.canMove) {
    boardRef.value.highlightMoves(piece);
  }
  if (player.value.hasAdmin('Clippy')) {
    reapplyTutorialTooltips(200);
  }
}

const deselectPiece = () => {
  selectedPiece.value = null;
  boardRef.value.clearHighlights();
}

const movePiece = async (coord: Coordinate) => {
  if (!selectedPiece.value || !player.value.canMove) return;
  isPlacing.value = false;
  player.value.canPlace = false;
  //we're definitely making a move, so store pieces
  lastTurnPieces.value = activePieces.value.map(p => p.clone());

  boardRef.value.clearHighlights();
  selectedPiece.value.moveTo(coord);
  //checkForTrap
  const trap = activePieces.value.find(p =>
    p.targetType == 'trapPiece' && p.tiles.some(t => t.x === coord.x && t.y === coord.y)
  );
  if (trap && trap.id !== selectedPiece.value.id) {
    if (player.value.hasAdmin('Wings')) {//still trigger and remove, but don't damage
      trap.isTriggering = true;
      trap.statuses.hidden = false;
      await new Promise(resolve => setTimeout(resolve, 350));
      removePiece(trap)
    } else {
      await trap.triggerTrap(selectedPiece.value);
    }
  }
  if (selectedPiece.value.targetType === 'trapPiece') {
    //check for others
    const trapTarget = activePieces.value.find(p =>
      (p.tiles.some(t => t.x === coord.x && t.y === coord.y) && p.id !== selectedPiece.value?.id)
    );
    if (trapTarget) {
      await selectedPiece.value.triggerTrap(trapTarget);
    }
  }
  if (selectedPiece.value.movesRemaining > 0) {
    boardRef.value.highlightMoves(selectedPiece.value);
  } else {
    boardRef.value.clearHighlights();
  }
  playerSpawns.value = newPlacementHighlights();
  if (player.value.fogged) {
    foggedTiles.value = [...level.value.tiles];//non persistant clearance
    clearFog();
  }
}

function checkForRoundEnd() {
  //console.log('checking for round end: ', activePieces.value)
  const enemyPieces = activePieces.value.filter(p => p.team === 'enemy');
  const playerPiecesRemaining = activePieces.value.filter(p => p.team === 'player');
  if (enemyPieces.length === 0) {
    console.log('round won!')
    endRound(true);
    return;
  }

  let hiddenEnemies = []
  enemyPieces.forEach(enemy => {
    if (enemy.statuses.hidden)
      hiddenEnemies.push(enemy)
  });
  if (hiddenEnemies.length === enemyPieces.length) {
    activePieces.value.forEach(piece => {
      if (piece.team === 'enemy') piece.statuses.hidden = false
    });
  }

  // If no player pieces → round lost
  if (playerPiecesRemaining.length === 0) {
    console.log('round failed!')
    endRound(false);
  }
}

const damagePieceAt = async (coord: Coordinate) => {
  if (!selectedPiece.value) return
  if ((selectedPiece.value.team === 'enemy' && !selectedPiece.value.statuses.charmed)) return; //don't wan't control of enemies pieces
  if (selectedPiece.value.actions <= 0) return
  player.value.canPlace = false;
  //if (selectedPiece.value.team !== 'player') return //damaging your own pieces is actually useful sometimes
  const damageReceiver = activePieces.value.find(piece =>
    piece.tiles.some(t => t.x === coord.x && t.y === coord.y)
  );
  if (!damageReceiver) return;
  selectedPiece.value.actions--//prevent double clicking
  //console.log('receiver: ', damageReceiver?.name)
  //if (!damageReceiver || (damageReceiver.team === selectedPiece.value.team && !selectedPiece.value.statuses.charmed)) return;
  //console.log("Damage call:", coord, damage)
  const baseDamage = selectedPiece.value.getStat('attack');
  const baseMult = selectedPiece.value.damageMult;
  const attackPopup = damageReceiver.addPopup({ text: `${baseDamage}${baseMult > 1 ? ` x${baseMult.toFixed(1)}` : ''}`, type: 'attack', isFixed: true });
  // Initial pause so the user can see the starting attack value

  let lastSeenMult = baseMult;
  await handleApplyAdmins('onDealDamage', selectedPiece.value.id, damageReceiver, async () => {
    const attacker = activePieces.value.find(p => p.id === selectedPiece.value?.id);
    if (attacker && attacker.damageMult !== lastSeenMult) {
      lastSeenMult = attacker.damageMult;
      console.log('adding mult, now: ', lastSeenMult)
      // Update text and force Vue to detect the change by re-assigning the array
      attackPopup.text = `${baseDamage} x${lastSeenMult.toFixed(1)}`;
      damageReceiver.popups = [...damageReceiver.popups];

      await new Promise(resolve => setTimeout(resolve, 350));
    }
  });
  const damage = Math.floor(baseDamage * (activePieces.value.find(p => p.id === selectedPiece.value!.id)?.damageMult ?? 1));
  // Brief pause before showing the final damage total
  //await new Promise(resolve => setTimeout(resolve, 200));
  await damageReceiver.takeDamage(damage, attackPopup);
  if (damageReceiver.team === 'player') {
    await handleApplyAdmins('onReceiveDamage', selectedPiece.value.id, damageReceiver)
  }
  if (selectedPiece.value.statuses.hidden) {
    selectedPiece.value.statuses.hidden = false;
  }
  if (damageReceiver.willRetaliate || damageReceiver.name === 'Hedgehog') {
    await selectedPiece.value.takeDamage(damageReceiver.getStat('attack'));
    await handleApplyAdmins('onReceiveDamage', damageReceiver.id, selectedPiece.value)
    if (damageReceiver.name === 'Puffer' && !selectedPiece.value.immunities.poisoned) {
      selectedPiece.value.statuses.poisoned = true;
    }
  }
  selectedPiece.value.willRetaliate = false;//pieces that have enacted defensive option
  //could trigger blood tax here using 'other'
  selectedPiece.value.damageMult = baseMult;
  //console.log(damageReceiver?.name, ' tiles afterdmg: ', damageReceiver.tiles)
  boardRef.value.clearHighlights();
}

const handleSpecialActionAt = async (target: Coordinate) => {
  //the enemy should also be able to use special moves, handle in enemy?
  if (!selectedPiece.value || selectedPiece.value.actions <= 0) return
  if ((selectedPiece.value.team === 'enemy' && !selectedPiece.value.statuses.charmed) || selectedPiece.value.team === 'player' && selectedPiece.value.statuses.charmed) return
  boardRef.value.clearHighlights();
  // find piece at targeted coordinate
  const targetPiece = activePieces.value.find(piece =>
    piece.tiles.some(t => t.x === target.x && t.y === target.y)
  );
  // --- piece target ---
  if (selectedPiece.value.targetType === 'piece') {
    if (targetPiece) {
      await selectedPiece.value.special(targetPiece);
    }
  }
  // --- piece + player payload ---
  if (selectedPiece.value.targetType === 'pieceAndPlayer') {
    if (targetPiece) {
      await selectedPiece.value.special({
        piece: targetPiece,
        player: player.value
      });
    }
  }
  if (selectedPiece.value.targetType === 'pieceAndPlace') {
    if (targetPiece) {
      await selectedPiece.value.special({
        piece: targetPiece,
        target: target
      });
    }
  }
  if (selectedPiece.value.targetType === 'placeAndPieces') {
    if (targetPiece) {
      await selectedPiece.value.special({
        target: target,
        activePieces: activePieces.value
      });
    }
  }
  // --- space target --- target must be// --- space target
  if (selectedPiece.value.targetType === 'space') {
    if (!targetPiece) {
      await selectedPiece.value.special({
        target: target,
        activePieces: activePieces.value,
        player: player.value
      });
    }
  }
  // --- one target but effects all --- target can be a piece
  if (selectedPiece.value.targetType === 'all') {
    await selectedPiece.value.special({
      target: target,
      activePieces: activePieces.value
    });
  }
  // --- group target (AOE) ---
  if (selectedPiece.value.targetType === 'group') {
    // get every piece inside selectedPiece.value.range
    const inRange = findAnyPiecesInRange(selectedPiece.value, activePieces.value);
    await selectedPiece.value.special(inRange);
  }
  if (selectedPiece.value.targetType === 'line') {
    const actor = selectedPiece.value;
    const ax = actor.headPosition.x;
    const ay = actor.headPosition.y;
    const tx = target.x;
    const ty = target.y;
    if (ax !== tx && ay !== ty) {
      // optional: warn player
      selectedPiece.value = null;
      return;
    }
    const dx = Math.sign(tx - ax);
    const dy = Math.sign(ty - ay);
    const tilesInLine: Coordinate[] = [];
    // Step along the line *from actor towards target*
    let x = ax + dx;
    let y = ay + dy;
    while (x !== tx || y !== ty) {
      tilesInLine.push({ x, y })
      x += dx;
      y += dy;
    }
    tilesInLine.push(target);
    await actor.special({
      line: tilesInLine,
      activePieces: activePieces.value
    });
  }
  // --- self target ---
  if (selectedPiece.value.targetType === 'self') {
    await selectedPiece.value.special(target);
  };
  if (selectedPiece.value.targetType === 'graveyard') {//test
    if (!targetPiece) {
      await selectedPiece.value.special({
        target: target,
        activePieces: activePieces.value,
        graveyard: graveyard.value
      });
    }
  }
  playerSpawns.value = newPlacementHighlights();
  selectedPiece.value = null;
  clearFog();
  return;
};

const hasWonRound = ref<boolean>(false);

const endRound = async (roundWon: boolean) => {
  //reset counts
  player.value.admins.forEach(admin => {
    if (admin.onRoundEnd) admin.onRoundEnd();
  });
  bossAdmins.value.forEach(admin => {
    if (admin.onRoundEnd) admin.onRoundEnd();
  });
  graveyard.value = [];
  lastTurnPieces.value = [];
  selectedPiece.value = null;
  if (roundWon) {
    hasWonRound.value = true;
    await handleApplyAdmins('onRoundEnd', '');
    activePieces.value = [];//for needle
    originalPieces.value = [];
    console.log('player map progress: ', player.value.mapProgress)
    console.log('player previous bosses cleared: ', player.value.bossesCleared)
    if (player.value.mapProgress >= 2) {
      player.value.bossesCleared += 1;
      console.log('boss defeated, new player bosses cleared: ', player.value.bossesCleared)
      if (player.value.bossesCleared === 6) {
        player.value.hasWonGame = true;
        console.log('player has won game!!!')
        StorageManager.recordWin(player.value.osunicode, player.value.stake);
      }
    }
    openSummary(true);
  } else {
    hasWonRound.value = false;
    activePieces.value = [];
    openSummary(true);
    //check admins for onion
    if (player.value.hasAdmin('Onion')) {
      const index = player.value.admins.findIndex(a => a.name === 'Onion');
      if (index !== -1) player.value.admins.splice(index, 1);
    }
    else if (player.value.lives > 0) {
      player.value.lives -= 1;
      await handleApplyAdmins('onRoundLoss', '');
    } else {
      alert('game over!')
    }
  }
  renewBlueprints();//after applyadmins for school
  for (const admin of bossAdmins.value) {//only necessary if we keep boss admins
    admin.onRoundEnd?.();
  }
  /*for (const admin of player.value.admins) {
    admin.onRoundEnd?.();
  }*/
  player.value.canPlace = false;
  player.value.fogged = false;
  roundHasStarted.value = false;
}

async function onReceiveDamage(id: string, receiver: Piece) {
  await handleApplyAdmins("onReceiveDamage", id, receiver);
}

//enemy moves
async function enemyTurn() {

  const tileSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));

  await runEnemyStateMachine(
    activePieces.value,
    //removePiece, // callback to remove dead pieces
    boardRef.value.highlightMoves,
    boardRef.value.highlightTargets,//highlightspecials?
    boardRef.value.clearHighlights,
    //handleSpecialActionAt,
    tileSet,
    onReceiveDamage,
    player.value,
    300
  );
  playerSpawns.value = newPlacementHighlights();
}

const endTurn = async () => {
  hasFinishedTurn.value = true;
  selectedPiece.value = null;
  pieceToPlace.value = null;
  //closeInventory();
  player.value.canPlace = false;
  player.value.canMove = false;
  player.value.canAction = false;
  await handleApplyAdmins('onTurnEnd', '');//sprinkler
  const statusMult = 1 + player.value.admins.filter(a => a.name === 'Volatile').length;
  for (const piece of activePieces.value) {
    if (piece.team === 'player') {
      await piece.applyStatusEffects(statusMult);
      piece.resetDefence();
    }
    if (piece.team === 'enemy') {
      await piece.resetTempModifiers();
      piece.actions = 1;
      await piece.applyStartingStatusEffects(statusMult);
      piece.resetMoves();
      piece.willRetaliate = false;
    }
  };
  await enemyTurn();
  //player piece tempstats reset
  await handleApplyAdmins('onEnemyTurnEnd', '');
  for (const piece of activePieces.value) {
    if (piece.team === 'enemy') {
      await piece.applyStatusEffects(statusMult);
      piece.resetDefence();
    }
    if (piece.team === 'player') {
      await piece.resetTempModifiers();
      piece.actions = 1;
      await piece.applyStartingStatusEffects(statusMult);
      piece.resetMoves();
      piece.willRetaliate = false;
    }
  };
  if (isFirstTurn) {
    isFirstTurn.value = false;
  }
  player.value.canPlace = true;
  player.value.canMove = true;
  player.value.canAction = true;
  hasFinishedTurn.value = false;
  handleApplyAdmins('onTurnStart', '');
}

// When editor exports a new level, shouldn't be needed in final
const handleExport = (levelData: any) => {
  level.value.tiles = levelData.tiles;
  level.value.pieces = levelData.pieces;
  // Hydrate pieces once
  const initPieces = rehydratePieces(level.value.pieces);
  activePieces.value = processSpawnPoints(initPieces, allPieces, 0);
  displayEditor.value = false; // swap to board view
};

//css
const shopClass = computed(() =>
  showShop.value ? 'visible' : 'collapsed'
)
const mapClass = computed(() =>
  showMap.value ? 'visible' : 'collapsed'
)

const worldSeed = ref(0);
const combinedMapSeed = computed(() => {
  // Extract raw seed (everything after the prefix and stake)
  const raw = currentSeed.value.length > 2 ? currentSeed.value.substring(2) : currentSeed.value;
  // Combine with the world reroll counter
  return raw + (worldSeed.value || '');
});
const increaseDifficulty = () => {
  player.value.difficulty += 1;
  if (player.value.difficulty < 7 || player.value.stake >= 1) {//cumulate bosses in endless mode
    bossAdmins.value = [];
  }
  refreshShop(true);
  worldSeed.value++
}
const decreaseDifficulty = () => {
  player.value.difficulty -= 1;
  worldSeed.value--
}
const increaseStake = () => {
  if (stake.value < 6) {
    stake.value += 1;
  }
}
const decreaseStake = () => {
  if (stake.value > 0) {
    stake.value -= 1;
  }
}

watch(
  () => [
    showBoard.value,
    showMap.value,
    roundHasStarted.value,
    activePieces.value.length,
  ],
  () => {
    if (player.value.hasAdmin("Clippy")) {
      requestAnimationFrame(() => {
        applyTutorialTooltips(allTips);
      });
    }
  }
);

//HOTKEYS
onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

function onKeydown(e: KeyboardEvent) {
  // ignore typing in inputs
  if (hasFinishedTurn.value || !roundHasStarted.value) return;
  const tag = (e.target as HTMLElement)?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  e.preventDefault();
  switch (e.code) {
    case 'Space':
    case 'Enter':
      e.preventDefault(); // stop page scroll
      endTurn();
      break;
    case 'Tab':
      //cycle thru activepieces
      break;
    case 'KeyI':
      toggleInventory();
      break;
    //inside pieceview???
    case 'KeyA':
      if (selectedPiece.value?.canAttack) {
        boardRef.value.highlightTargets(selectedPiece.value);
      }
      break;

    case 'KeyS':
      if (selectedPiece.value?.specialName) {
        boardRef.value.highlightSpecials(selectedPiece.value);
      }
      break;

    case 'KeyD':
      if (selectedPiece.value) {
        selectedPiece.value = null;
        boardRef.value.clearHighlights();
      }
      break;
  }
}

const debugMode = ref<boolean>(false);
function toggleDebug() {
  debugMode.value = !debugMode.value;
}
</script>

<template>
  <div class="app-root">
    <div class="debug-controls">
      <button @click="showCollection = !showCollection">Info</button>
      <button v-if="debugMode === true" class="swap-display" @mousedown="swapDisplay()">
        {{ displayEditor ? "Show Board" : "Show Editor" }}
      </button>
      <button v-if="debugMode === true" class="swap-display" @mousedown="renewBlueprints()">
        Renew Blueprints
      </button>
      <button v-if="player.hasAdmin('Convenience Store') || debugMode === true" class="shop-toggle"
        @mousedown="toggleShop()">
        Toggle Shop
      </button>
      <button v-if="player.hasAdmin('Gene Splicing') || debugMode === true" class="compiler-toggle"
        @mousedown="toggleCompiler()">
        Toggle Compiler
      </button>
      <button v-if="debugMode === true" class="altar-toggle" @mousedown="toggleAltar()">
        Toggle Altar
      </button>
      <button v-if="debugMode === true" class="duplicator-toggle" @mousedown="toggleDuplicator()">
        Toggle Duplicator
      </button>
      <button v-if="debugMode === true" class="workbench-toggle" @mousedown="toggleWorkbench()">
        Toggle Workbench
      </button>
      <button v-if="debugMode === true" class="map-toggle" @mousedown="toggleMap()">
        Toggle Map
      </button>
      <button v-if="debugMode === true" class="board-toggle" @mousedown="showBoard = true">
        Toggle Board
      </button>
      <div v-if="debugMode === true" class="flex">
        <button class="phone-hide" @mousedown="decreaseDifficulty()">
          -
        </button>
        <span>Security</span>
        <button class="phone-hide" @mousedown="increaseDifficulty()">
          +
        </button>
      </div>
      <button class="phone-hide" @mousedown="toggleFastControls()">
        Fast Controls
      </button>
      <div v-if="!gameStarted" class="flex">
        <button class="phone-hide" @mousedown="decreaseStake()">
          -
        </button>
        <span>Infamy: {{ stake }}</span>
        <button class="phone-hide" @mousedown="increaseStake()">
          +
        </button>
      </div>
      <button class="phone-hide" @mousedown="toggleDebug()">
        Debug mode
      </button>
      <button class="phone-hide" @mousedown="isSoundEnabled = !isSoundEnabled">
        Sound FX: {{ isSoundEnabled ? 'ON' : 'OFF' }}
      </button>
    </div>
    <div class="top-hud">
      <div class="enemy-info">
        <span v-if="currentCompany">
          <div>{{ currentCompany.abbr }}</div>
          <div>{{ currentCompany.unicode ? String.fromCodePoint(parseInt(currentCompany.unicode.replace('U+', ''), 16),
            0xFE0F) : '' }}</div>
        </span>
        <p class="security"><strong>Security level: </strong>{{ player.difficulty + player.extraDifficulty }}</p>
        <p class="infamy"><strong>Infamy: </strong>{{ stake }}</p>
        <span class="enemy-bosses">
          <BossView v-if="bossAdmins.length > 0" :admins="bossAdmins" />
        </span>
      </div>
      <div v-if="!displayEditor && roundHasStarted" class="player-helper">
        <div v-if="!hasFinishedTurn && !isPlacing" class="turn-info">Your turn</div>
        <div v-if="isPlacing && pieceToPlace">
          <p>Placing:</p>
          <button @click="pieceToPlace = null">Cancel</button>
        </div>
        <div v-if="isPlacing && pieceToPlace" class="info">
          <BlueprintView :blueprint="pieceToPlace" :tileSize="60" :cssclass="'placing'" />
        </div>
      </div>
    </div>
    <div class="stage">
      <MainMenu v-if="showMainMenu && !displayEditor" @createNewPlayer="createNewPlayer" class="stage-panel"
        :class="{ active: showMainMenu }" :debugMode="debugMode" />
      <RoundSummary v-if="showSummary" class="stage-panel" :class="{ active: showSummary }" :hasWonRound="hasWonRound"
        :player="player" :bosses="bossAdmins" @proceedFromEndOfRound="handleProceed" @reloadLevel="reloadLevel"
        @mainMenu="openMainMenu" />
      <WorldMap v-if="!displayEditor" class="stage-panel" :class="{ active: showMap }" :allLevels="level1Levels"
        :player="player" :seed="combinedMapSeed" :cssclass="mapClass" :bosses="bossAdmins" @selectLevel="selectLevel"
        @openShop="openShop" @openDisabledShop="openDisabledShop" @openCompiler="openCompiler" @openAltar="openAltar"
        @openDuplicator="openDuplicator" @openWorkbench="openWorkbench" @incrementProgress="incrementMapProgress"
        @addBoss="addBossAdmin" @replaceBosses="replaceBosses" @increaseDifficulty="increaseDifficulty" />
      <Shop v-if="!displayEditor" class="stage-panel" :class="{ active: showShop }" :cssclass="shopClass"
        :shopBlueprints="shopBlueprints" :shopItems="shopItems" :rerollCost="rerollCost" :target="shopTarget"
        :hasStolen="hasStolenFromThisShop" @refresh-shop="refreshShop(false)" @buy-blueprint="buyBlueprint"
        @buy-item="buyItem" @selectTarget="selectShopTarget" @clearTarget="clearShopTarget" @closeShop="closeShop"
        :player="player" :shop-disabled="shopDisabled" :canProceed="canProceedFromShop" />
      <HybridCompiler v-if="!displayEditor" class="stage-panel" :class="{ active: showCompiler }" :player="player"
        :pieceToPlace="pieceToPlace" :isDraggingPlacement="isDraggingPlacement" @openCompiler="openCompiler"
        @toggleCompiler="toggleCompiler" @clear-drag="clearDrag" @close="toggleCompiler" />
      <Altar v-if="!displayEditor" class="stage-panel" :class="{ active: showAltar }" :player="player"
        :pieceToPlace="pieceToPlace" :isDraggingPlacement="isDraggingPlacement" @openAltar="openAltar"
        @toggleAltar="toggleAltar" @clear-drag="clearDrag" @close="toggleAltar" />
      <Duplicator v-if="!displayEditor" class="stage-panel" :class="{ active: showDuplicator }" :player="player"
        :pieceToPlace="pieceToPlace" :isDraggingPlacement="isDraggingPlacement" @openDuplicator="openDuplicator"
        @toggleDuplicator="toggleDuplicator" @clear-drag="clearDrag" @close="toggleDuplicator" />
      <Workbench v-if="!displayEditor" class="stage-panel" :class="{ active: showWorkbench }" :player="player"
        :pieceToPlace="pieceToPlace" :isDraggingPlacement="isDraggingPlacement" @openWorkbench="openWorkbench"
        @toggleWorkbench="toggleWorkbench" @clear-drag="clearDrag" @close="toggleWorkbench" />
      <Board ref="boardRef" v-if="!displayEditor" class="stage-panel" :class="{ active: showBoard }"
        :tiles="level.tiles" :foggedTiles="foggedTiles" :pieces="activePieces" :selectedPiece="selectedPiece"
        :placementHighlights="playerSpawns" :isFirstTurn="isFirstTurn" :placementMode="isPlacing"
        :movementMode="isMoving" :hasFinishedTurn="hasFinishedTurn" :player="player"
        :showFastControls="showFastControls" :isDraggingPlacement="isDraggingPlacement" :pieceToPlace="pieceToPlace"
        :tileColor="currentCompany.tileColor" :edgeColor="currentCompany.edgeColor" @placeOnBoard="placePieceOnBoardAt"
        @handlePieceSelect="handlePieceSelect" @deselect="deselectPiece" @movePiece="movePiece"
        @damagePieceAt="damagePieceAt" @specialActionAt="handleSpecialActionAt" @placeAt="placeAt" gameStart="true" />
      <Collection class="stage-panel" :class="{ active: showCollection }" @close="showCollection = false"
        :debugMode="debugMode" :currentSeed="currentSeed" />
    </div>
    <Leveleditor v-if="displayEditor" @export-level="handleExport" />
    <div class="player-area">
      <!-- PlayerView + End Turn / Retry -->
      <PlayerView v-if="!displayEditor" :player="player" :showInventory="showInventory"
        @highlightPlacements="highlightPlacements" @sellBlueprint="sellBlueprint" @sellItem="sellItem"
        @applyItem="handleApplyItem" @sellAdmin="sellAdmin" @reorderAdmins="player.admins = $event"
        @startPlacementDrag="startPlacementDrag" @closeInventory="toggleInventory" @openInventory="toggleInventory" />
      <PieceController v-if="selectedPiece && !hasFinishedTurn" :piece="selectedPiece" mode="action"
        :hasFinishedTurn="hasFinishedTurn" :canBuy="false" :canMove="player.canMove" :canAction="player.canAction"
        :defaultPosition="{ x: 0, y: 0 }" @highlightMoves="boardRef.highlightMoves"
        @highlightTargets="boardRef.highlightTargets" @highlightSpecials="boardRef.highlightSpecials"
        @close="deselectPiece" />
      <div v-if="!displayEditor" class="player-actions">
        <button v-if="(!displayEditor && roundHasStarted && !hasFinishedTurn && !isFirstTurn) || debugMode"
          class="end-turn" v-on:click="endTurn()">End Turn</button>
        <!--<button class="mt-2 px-2 py-1 bg-blue-500 text-white rounded" @click="showInventory = !showInventory">{{showInventory ? 'Hide Inventory' : 'Inventory' }}</button>-->
        <!--<div v-if="!displayEditor && roundHasStarted" class="graveyard">
        <button>🪦</button>
      </div>-->
        <button :disabled="hasFinishedTurn" v-if="!displayEditor && roundHasStarted && player.lives > 1"
          class="retry-btn" v-on:click="retryLevel()">Retry</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.player-helper {
  position: absolute;
  top: 10px;
  right: 10px;
}

.turn-info {
  font-weight: bold;
  color: red;
}

.enemy-info {
  display: flex;
  gap: 2rem;
}

.info {
  position: relative;
  height: 60px;
  display: flex;
  justify-content: center;
}

.debug-controls {
  position: absolute;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 2px 4px;
  top: 2%;
  left: 2%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.end-turn,
.retry-btn {
  border: 1px solid white;
  z-index: 9999;
  margin-bottom: 0.5rem;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}

.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}

.collapsed {
  top: 100%;
}

@media (max-width: 500px) {
  .enemy-info {
    display: block;
  }

  .debug-controls {
    left: unset;
    right: 2%;
    font-size: 0.9rem;
    padding: 0.5rem;
    border: unset;
  }

  .top-hud p {
    margin: 0;
    min-height: 30px;
  }

  .player-area {
    p {
      margin: 0;
    }
  }

  .phone-hide {
    display: none;
  }

  .overlay-route {
    left: 100%;
  }
}

.enemy-bosses,
.security,
.infamy {
  position: relative;
}
</style>
