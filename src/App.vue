<script setup lang="ts">
  import { ref, onMounted, computed} from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { testLevels } from './levels';
  import { castled, level1Levels } from './level1Levels';
  import { Player } from "./Player";
  import { Item, allItems} from "./Items";
  import { allAdmins } from "./AdminPrograms";
  import { Admin } from "./AdminPrograms";
  import PlayerView from "./components/PlayerView.vue";
  import type { Piece } from "./Pieces"
  import { Spawn } from './Pieces';
  import { allPieces } from "./Pieces"
  import type { Coordinate, PieceBlueprint, Level } from "./types";
  import { takeEnemyTurn } from "./Enemy";
  import WorldMap from "./components/WorldMap.vue";
  import Shop from "./components/Shop.vue";
  import { DIFFICULTY_RARITY } from "./constants";

  //import { Map } from "./components/Map.vue";

  //testing fields 
  import BlueprintView from "./components/BlueprintView.vue";

  // Instantiate real piece objects
  
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
    isPlaced: false
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
    isPlaced: false
  }
  const testSling = {
    id: "274ec329-8c17-4265-8c12-e9a28bcf0112",
    name: "Sling",
    description: "A basic ranged piece",
    unicode: "U+1F94F",
    maxSize: 3,
    moves: 2,
    range: 2,
    attack: 1,
    defence: 0,
    rarity: 1,
    color: "#2fc5ebff",
    isPlaced: false
  }


  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
  }
  
  const player = ref(new Player(
    50, // starting money
    5,  // memory limit
    5, //admin slots
    [], // no items yet
    [testSword, testShield, testSling],//, testShield] // starting pieces
    []//no admins yet
  ));

  function sellPiece(pieceId: string) {
    // find the index
    const idx = player.value.programs.findIndex(p => p.id === pieceId);
    if (idx === -1) return; // piece not found

    const piece = player.value.programs[idx];
    
    // remove from programs
    player.value.programs.splice(idx, 1);

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

  function handleApplyItem(payload: {item: Item, id:string}) {
    player.value.applyItemToPiece(payload);
  }


  //SHOP functions

  function makeBlueprint(PieceClass: any) {
    const temp = new PieceClass({ x: -1, y: -1 }, "player");

    return {
      id: crypto.randomUUID(),
      name: PieceClass.name,
      description: PieceClass.description,
      unicode: PieceClass.unicode,
      maxSize: temp.maxSize,
      moves: temp.moves,
      range: temp.range,
      attack: temp.attack,
      defence: temp.defence,
      rarity: temp.rarity,
      color: PieceClass.color,
      isPlaced: false                       
      };
  }
  
  function pickWeightedRandom(PieceClasses: any[]) {
    const weighted: any[] = [];

    for (const PieceClass of PieceClasses) {
      const temp = new PieceClass({ x: -1, y: -1 }, "player"); 
      const weight = 7 - temp.rarity;

      for (let i = 0; i < weight; i++) {
        weighted.push(PieceClass);
      }
    }

    const idx = Math.floor(Math.random() * weighted.length);
    return weighted[idx];
  }

  function pickThreePieces(PieceClasses: any[]) {
    return [
      pickWeightedRandom(PieceClasses),
      pickWeightedRandom(PieceClasses),
      pickWeightedRandom(PieceClasses),
    ];
  }

  function pickWeightedRandomItem(itemClasses: any[]) {
    const weighted: any[] = [];

    for (const itemClass of itemClasses) {
      const rarity = itemClass.rarity ?? 1;   // fallback default
      const weight = 7 - rarity;

      for (let i = 0; i < weight; i++) {
        weighted.push(itemClass);
      }
    }

    const idx = Math.floor(Math.random() * weighted.length);
    //console.log('idx: ', weighted[idx])
    const PickedClass = weighted[idx];

    return new PickedClass();  // RETURN INSTANCE
  }

  function pickThreeItems(itemClasses: Array<typeof Item>) {
    return [
      pickWeightedRandomItem(itemClasses),
      pickWeightedRandomItem(itemClasses),
      pickWeightedRandomItem(itemClasses),
    ];
  }

  const shopBlueprints = ref<PieceBlueprint[]>([]);
  const shopItems = ref<Item[]>([]);
  const rerollCost = ref(5);//to be reset after shop
  const prevFib = ref(1);//to be reset after shop
  const currentFib = ref(1);//to be reset after shop

  function refreshShop(isFree: boolean) {
    //console.log(rerollCost.value)
    if(!isFree && player.value.money < rerollCost.value) return;//show to shop for disabled button
    if(!isFree) {
      player.value.money -= rerollCost.value;
      const nextFib = prevFib.value + currentFib.value;
      prevFib.value = currentFib.value;
      currentFib.value = nextFib;

    rerollCost.value = currentFib.value;
      // 1, 2, 3, 5, etc
    }

    const classes = pickThreePieces(allPieces);
    shopBlueprints.value = classes.map(c => makeBlueprint(c));
    const allItemsAndAdmins = [...allItems, ...allAdmins];
    shopItems.value = pickThreeItems(allItemsAndAdmins);
    //if triggered by player
  }

  function buyBlueprint(bp: PieceBlueprint) {
    shopBlueprints.value = shopBlueprints.value.filter(b => b.id !== bp.id);
    player.value.money -= (bp.rarity * 2 -1);
    player.value.programs.push(bp);
  }
  function buyItem(item: Item) {
    // remove from shop
    shopItems.value = shopItems.value.filter(i => i.id !== item.id);
    player.value.money -= item.cost;
    // decide which inventory to place it in
    if (item instanceof Admin) {
      player.value.admins.push(item);
    } else {
      player.value.items.push(item);
    }
  }
  const showShop = ref(false)
  const showMap = ref(false)
  //--shop-----

  //round logic
  //pieceMap to track occupied spaces
  const activePieces = ref<InstanceType<typeof Piece>[]>([]);
  const playerSpawns = ref<Coordinate[]>([]);
  const level = ref(castled);//tiles
  const difficulty = ref(1);
  const displayEditor = ref(false);
  const isPlacing = ref(false);
  const hasFinishedTurn = ref(false);
  const isFirstTurn = ref(true);
  const pieceToPlace = ref<PieceBlueprint | null>(null);
  
  //map
  const toggleMap = () => {
    showMap.value = !showMap.value;
  }

  const renewBlueprints = () => {
    player.value.programs.forEach(blueprint => {
      blueprint.isPlaced = false;
    });
  }

  const selectLevel = (newLevel: Level) => {
    isFirstTurn.value = true;
    activePieces.value = []
    level.value = newLevel;
    const newPieces = rehydratePieces(newLevel.pieces);
    activePieces.value = processSpawnPoints(newPieces);
    renewBlueprints();
    toggleMap();
  }

  //game loop
  const toggleShop = () => {
    showShop.value = !showShop.value;
  }
  //linear: round -> shop -> map
  //split paths: round -> map -> shopIfShop -> else jround

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

  function processSpawnPoints(pieces: Piece[]) {
    const processed: Piece[] = [];
    playerSpawns.value = []

    for (const piece of pieces) {
      if (piece instanceof Spawn) {

        // Enemy spawn → replace with random enemy piece
        if (piece.team === 'enemy') {
          //difficulty from constants ramp
          const { min, max } = DIFFICULTY_RARITY[difficulty.value];
          const validEnemies = allPieces.filter(p =>
            p.rarity >= min && p.rarity <= max
          );
          const pool = validEnemies.length > 0 ? validEnemies : allPieces;
          //console.log('lengths:', min, max, allPieces.length, pool.length)

          const EnemyClass = pool[Math.floor(Math.random() * pool.length)];
          //allPieces[Math.floor(Math.random() * allPieces.length)];//base this off rarity/difficulty later

          const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', removePiece);
          processed.push(enemyInstance);
          continue;
        }

        //if player has backdoor{
        //all unnoccupied tiles are placementHighlights
        //} else if
        // Player spawn → record placement highlight coordinates
        if (piece.team === 'player') {
          //placementHighlights.value.push(piece.headPosition);
          playerSpawns.value = [//for reactivity
            ...playerSpawns.value,
            piece.headPosition
          ];
          // Do *not* add Spawn to active pieces — it is a marker, not a unit
          continue;
        }
      }
      //console.log("placementHighlights after:", playerSpawns.value);
      processed.push(piece);
    }

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
    activePieces.value = processSpawnPoints(initPieces); // sets placementHighlights internally
    refreshShop(true)//handle in round, or don't for crystal ball
  });

  function highlightPlacements(pieceBlueprint: PieceBlueprint) {
    if(!isFirstTurn){
      playerSpawns.value = newPlacementHighlights();
    }
    pieceToPlace.value = pieceBlueprint;
    isPlacing.value = true;
  }

  function removePiece(piece: Piece) {
    activePieces.value = activePieces.value.filter(p => p.id !== piece.id);
  }
  //graveyard?

  function placePieceOnBoardAt(coord: Coordinate) {
    if (!pieceToPlace.value) return

    const bp = pieceToPlace.value

    const PieceClass = allPieces.find(p => p.name === bp.name)
    if (!PieceClass) return

    const instance = new PieceClass(coord, 'player', removePiece, bp.id);   // now real placement!

    activePieces.value.push(instance)

    // Mark blueprint as placed so it greys in inventory
    bp.isPlaced = true

    // Reset placement state
    pieceToPlace.value = null;
    //playerSpawns.value = newPlacementHighlights();
    isPlacing.value = false;
    if(isFirstTurn){
      isFirstTurn.value = false;
    }
    endTurn();
  }

  const boardRef = ref();

  async function enemyTurn() {
    const enemyPieces = activePieces.value.filter(p => p.team === 'enemy');
    const playerPieces = activePieces.value.filter(p => p.team === 'player');
    const tileSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));

    await takeEnemyTurn(
      enemyPieces,
      playerPieces,
      activePieces.value,
      removePiece, // callback to remove dead pieces
      boardRef.value.highlightMoves,
      boardRef.value.highlightTargets,
      boardRef.value.clearHighlights,
      tileSet
    );

    // Reset enemy actions/moves after their turn if needed
    enemyPieces.forEach(p => {
      p.actions = 1;
      p.movesRemaining = p.moves;
    });
    playerSpawns.value = newPlacementHighlights();
    hasFinishedTurn.value = false;
  }

  const endTurn = () => {
    hasFinishedTurn.value = true;
    activePieces.value.forEach(piece => {
      piece.movesRemaining = piece.moves;
      piece.actions = 1;
    });
    enemyTurn();  
  }

  
  // When editor exports a new level, shouldn't be needed in final
  const handleExport = (levelData: any) => {
    level.value.tiles = levelData.tiles;
    level.value.pieces = levelData.pieces;
    // Hydrate pieces once
    const initPieces = rehydratePieces(level.value.pieces);
    activePieces.value = processSpawnPoints(initPieces);

    displayEditor.value = false; // swap to board view
  };

  //css
  const shopClass = computed(() => 
    showShop.value ? 'visible' : 'collapsed'
  )

  const mapClass = computed(() => 
    showMap.value ? 'visible' : 'collapsed'
  )

  const increaseDifficulty = () => {
    difficulty.value += 1;
  }
  const decreaseDifficulty = () => {
    difficulty.value -= 1;
  }

</script>

<template>
  <div class="controls">
    <button class="swap-display" @mousedown="swapDisplay()">
      {{ displayEditor ? "Show Board" : "Show Editor" }}
    </button>
    <button class="shop-toggle" @mousedown="toggleShop()">
      Toggle Shop
    </button>
    <button class="map-toggle" @mousedown="toggleMap()">
      Toggle Map
    </button>
    <p>Security level: {{ difficulty }}</p>
    <button class="difficulty" @mousedown="increaseDifficulty()">
      Increase Security
    </button>
    <button class="difficulty" @mousedown="decreaseDifficulty()">
      Decrease Security
    </button>
  </div>
  <div v-if="isPlacing && pieceToPlace">
    <p>Placing:</p>
  </div>
  <div v-if="isPlacing && pieceToPlace"
    class="info">
    <BlueprintView :blueprint="pieceToPlace"
    :tileSize="60"
    :cssclass="'placing'"
    />
  </div>
  <div v-if="!hasFinishedTurn && !isPlacing">Your turn</div>

  <PlayerView v-if="!displayEditor" :player="player" @highlightPlacements="highlightPlacements" @sellPiece="sellPiece" @sellItem="sellItem" @applyItem="handleApplyItem"/>
  <WorldMap
    :levels="testLevels"
    @select-level="selectLevel"
    :cssclass="mapClass"
  />
  <Shop
    :cssclass="shopClass"
    :shopBlueprints="shopBlueprints"
    :shopItems="shopItems"
    :rerollCost="rerollCost"
    @refresh-shop="refreshShop(false)"
    @buy-blueprint="buyBlueprint"
    @buy-item="buyItem"
    :player="player"
  />
  <Board ref="boardRef" v-if="!displayEditor"
  :tiles="level.tiles"
  :pieces="activePieces"
  :placementHighlights="playerSpawns"
  :isFirstTurn="isFirstTurn"
  :placementMode="isPlacing"
  :hasFinishedTurn="hasFinishedTurn"
  @place-on-board="placePieceOnBoardAt"/>
  <Leveleditor v-else @export-level="handleExport"/>
  <button v-if="!displayEditor && !hasFinishedTurn" class="end-turn" v-on:click="endTurn()">End Turn</button>
</template>

<style scoped>
.info{
  position: relative;
  height: 60px;
  display: flex;
  justify-content: center;
}
.controls{
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
.end-turn{
  margin-top: 1rem;
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
.collapsed{
  top: 100%;
}
</style>
