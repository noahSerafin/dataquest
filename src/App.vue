<script setup lang="ts">
  import { ref, onMounted, computed} from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { castled } from './levels';
  import { Player } from "./Player";
  import { Item, allItems} from "./Items";
  import { Admin } from "./AdminPrograms";
  import PlayerView from "./components/PlayerView.vue";
  import type { Piece } from "./Pieces"
  import { Spawn } from './Pieces';
  import { allPieces } from "./Pieces"
  import type { Coordinate, PieceBlueprint } from "./types";
  import { takeEnemyTurn } from "./Enemy";
  import Shop from "./components/Shop.vue";

  //import { Map } from "./components/Map.vue";

  //testing fields 
  import BlueprintView from "./components/BlueprintView.vue";

  // Instantiate real piece objects
  
  const testSword = {
    id: "274ec329-8c17-4265-8c12-e9a28bcf0833",
    name: "Knife",
    description: "A basic attack piece",
    unicode: "U+1F5E1",
    maxSize: 3,
    moves: 2,
    range: 1,
    attack: 2,
    defence: 0,
    rarity: 1,
    color: "#dddcd7",
    isPlaced: false
  }
  const testSword2 = {
    id: "274ec329-8c17-4265-8c12-e9a28bcf0111",
    name: "Knife",
    description: "A basic attack piece",
    unicode: "U+1F5E1",
    maxSize: 3,
    moves: 2,
    range: 1,
    attack: 2,
    defence: 0,
    rarity: 1,
    color: "#dddcd7",
    isPlaced: false
  }

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
  }

  //pieceMap to track occupied spaces
  const activePieces = ref<InstanceType<typeof Piece>[]>([]);
  
  const player = ref(new Player(
    20, // starting money
    5,  // memory limit
    3, //admin slots
    [], // no items yet
    [testSword, testSword2],//, testShield] // starting pieces
    []//no admins yet
  ));

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
    console.log('idx: ', weighted[idx])
    const PickedClass = weighted[idx];

    return new PickedClass();  // RETURN INSTANCE
  }

  function pickThreeItems(itemClasses: any[]) {
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
    console.log(rerollCost.value)
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
    shopItems.value = pickThreeItems(allItems);
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
    // add to player inventory
    player.value.items.push(item);
  }
  function buyAdmin(admin: Admin) {
    shopItems.value = shopItems.value.filter(i => i.id !== admin.id);
    player.value.money -= admin.cost;
    player.value.admins.push(admin);
  }
  //--shop-----

  const level = ref(castled);
  const displayEditor = ref(false);
  const isPlacing = ref(false);
  const hasFinishedTurn = ref(false);
  const isFirstTurn = ref(true);

  const pieceToPlace = ref<PieceBlueprint | null>(null);
  const playerSpawns = ref<Coordinate[]>([]);
  
  const newPlacementHighlights = () => {//board should only show these if isPlacing
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

    console.log("processSpawnPoints called with:", pieces);

    for (const piece of pieces) {
      if (piece instanceof Spawn) {

        // Enemy spawn → replace with random enemy piece
        if (piece.team === 'enemy') {
          const EnemyClass = allPieces[Math.floor(Math.random() * allPieces.length)];//base this off rarity/difficulty later
          const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', removePiece);
          enemyInstance.team = 'enemy'
          processed.push(enemyInstance);
          continue;
        }

        //if player has backdoor{
        //all unnoccupied tiles are placementHighlights
        //} else if
        // Player spawn → record placement highlight coordinates
        if (piece.team === 'player') {
          console.log("FOUND SPAWN:", piece);
          //placementHighlights.value.push(piece.headPosition);
          playerSpawns.value = [//for reactivity
            ...playerSpawns.value,
            piece.headPosition
          ];
          // Do *not* add Spawn to active pieces — it is a marker, not a unit
          continue;
        }
      }
      console.log("placementHighlights after:", playerSpawns.value);
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

  function handleSell(piece: Piece) {
    console.log('sell clicked');
    //player.value.sell(piece)
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
</script>

<template>
  <button class="swap-display" @mousedown="swapDisplay()">
    {{ displayEditor ? "Show Board" : "Show Editor" }}
  </button>
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

  <PlayerView v-if="!displayEditor" :player="player" @highlightPlacements="highlightPlacements"/>
  <Shop
    :shopBlueprints="shopBlueprints"
    :shopItems="shopItems"
    :rerollCost="rerollCost"
    @refresh-shop="refreshShop(false)"
    @buy-blueprint="buyBlueprint"
    @buy-item="buyItem"
    @buy-admin="buyAdmin"
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
button{
  position: absolute;
  background-color: transparent;
  color: white;
  border: 1px solid white;
  padding: 2px 4px;
}
.swap-display{
  top: 2%;
  left: 2%;
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
</style>
