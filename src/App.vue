<script setup lang="ts">
  import { ref, onMounted, computed, watch } from "vue";
  import Board from './components/Board.vue';
  import Leveleditor from './components/Leveleditor.vue';
  import { castled, level1Levels } from './level1Levels';
  import { Player } from "./Player";
  import { Item, Voucher, allItems} from "./Items";
  import type { ItemConstructor } from "./Items";
  import { allAdmins } from "./AdminPrograms";
  import { Admin } from "./AdminPrograms";
  import type { AdminTrigger } from "./AdminPrograms";
  import PlayerView from "./components/PlayerView.vue";
  import type { Piece } from "./Pieces"
  import { Spawn, Dolls } from './Pieces';
  import { allPieces } from "./Pieces"
  import type { Coordinate, PieceBlueprint, Level, OS } from "./types";
  import { runEnemyStateMachine } from "./Enemy";
  import WorldMap from "./components/WorldMap.vue";
  import { pickWeightedRandom, pickWeightedRandomItem } from "./helperFunctions";
  import Shop from "./components/Shop.vue";
  import BossView from "./components/BossView.vue";
  import RoundSummary from "./components/RoundSummary.vue";
  import { DIFFICULTY_RARITY } from "./constants";
  import BlueprintView from "./components/BlueprintView.vue";
  import MainMenu from "./components/MainMenu.vue";
  import PieceController from "./components/PieceController.vue";
  import HybridCompiler from "./components/HybridCompiler.vue";
  
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
    cost: 1
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
    cost: 1
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
    extraUnicode: 'U+1F994'
  }
  const testVoucher = new Voucher();

  const swapDisplay = () => {
    displayEditor.value = !displayEditor.value;//add map later, make shop an overlay?
  }
  
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
    false,
    false,
  ));
  const showInventory = ref(false);
  //function closeInventory(){
    //showInventory.value = false;
  //}
  function toggleInventory(){
    showInventory.value = !showInventory.value;
  }
  const showMainMenu = ref(true);

  function createNewPlayer(os: OS){
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
      false,
      false
    )
    showMainMenu.value = false;
    showMap.value = true;
  }

  function openMainMenu(){
    showBoard.value = false;
    showSummary.value = false;
    showMainMenu.value = true;
  }
  const showFastControls = ref<boolean>(true);
  function toggleFastControls(){
    showFastControls.value = !showFastControls.value
  }

  function sellBlueprint(pieceId: string) {
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

  function sellAdmin(itemId: string) {//TODO NEXT
    const idx = player.value.admins.findIndex(i => i.id === itemId);
    if (idx === -1) return;
    const admin = player.value.admins[idx];
    if(admin.triggerType === 'other'){
      admin.remove({player: player.value});
    }
    player.value.admins.splice(idx, 1);
    player.value.money += Math.round(admin.cost / 2);
  }

  function handleApplyItem(payload: {item: Item, id:string}) {
    const item = payload.item;
    let itemMult = 1;
    if(player.value.hasAdmin('Chemistry')){
      itemMult = 2;
    }
    //check it is to be applied to playerBlueprints
    if (item.targetType === "blueprint") {
      const id = payload.id;
      const blueprint = player.value.programs.find(bp => bp.id === id);
      if (!blueprint) return;
      player.value.applyItemToPieceBlueprint(payload, itemMult);
      return;
    }
    ////if targetType === Piece
    if (item.targetType === "piece" && selectedPiece.value) {
      const id = selectedPiece.value?.id;
      const piece = activePieces.value.find(p => p.id === id);
      if (!piece) return;
      item.apply(piece, itemMult);
      player.value.removeItem(item)
      return;
    }
    
    if (item.targetType === "player") {
      //some these items cannot be passed allItems/ Alladmins because they are declared in /Items.ts first
      if(item.name === 'Gift Box' && player.value.hasMemorySpace){
        player.value.programs.push(makeBlueprint(pickWeightedRandom(allPieces, player.value)));
        player.value.removeItem(item);
      }
      if(item.name === 'Genie' && player.value.hasMemorySpace){
        const classes = [
          pickWeightedRandom(allPieces, player.value),
          pickWeightedRandom(allPieces, player.value),
          pickWeightedRandom(allPieces, player.value),
        ];
        const bps = classes.map(c => makeBlueprint(c));
        player.value.programs.push(...bps);
        player.value.removeItem(item)
      }
      if(item.name === 'Mystery Box' && player.value.hasMemorySpace){
        player.value.items.push(pickWeightedRandomItem(allItems, player.value))
        player.value.removeItem(item)
      }
      if(item.name === 'Pinata' && player.value.hasAdminSpace){
        player.value.admins.push(pickWeightedRandomItem(allAdmins, player.value))
        player.value.removeItem(item)
      }
      if(!(item.name === 'Gift Box' || item.name === 'Genie' || item.name === 'Mystery Box' || item.name === 'Pinata')) {
        item.apply(player, itemMult)
        player.value.removeItem(item)
      }
    }

    if (item.targetType === "shopItem" && item.name === 'Voucher') {
      console.log('using voucher on ', shopTarget.value?.name)
      //const shopBlueprints = ref<PieceBlueprint[]>([]);
      //const shopItems = ref<Item[]>([]);
      //selectedShopItem
      if(shopTarget.value?.id){
        const id = shopTarget.value.id;
        const shopBp = shopBlueprints.value.find(p => p.id === id);
        const shopItem = shopItems.value.find(i => i.id === id);
        if(shopBp){
          item.apply(shopBp, 1)
          player.value.removeItem(item)
        }
        if(shopItem){
          item.apply(shopItem, 1)
          player.value.removeItem(item)
        }
      }
    }

    if (item.targetType === "gameState") {
      console.log('using voucher on ', shopTarget.value?.name)
      if(item.name === 'Hourglass'){
          reloadLevel();
          player.value.removeItem(item);
      }
      if(item.name === 'Magic Wand'){
          //if(player placed last turn, (there is an extra player piece in active not in lastturn) find the blueprint by piece name in player.programs and renew that blueprint if it exists)
          //then:
          const lastIds = new Set(lastTurnPieces.value.map(p => p.id));
          const newPiece = activePieces.value.find(p => !lastIds.has(p.id)) || null;
          if(newPiece){
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
      item.apply(activePieces, itemMult);
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
  function clearShopTarget(){
    shopTarget.value = null;
  }
  function selectShopTarget(target: Item | PieceBlueprint | null){
    shopTarget.value=target;
  }

  function makeBlueprint(PieceClass: any) {
    const temp = new PieceClass({ x: -1, y: -1 }, "player");

    return {
      id: crypto.randomUUID(),
      name: PieceClass.name,
      description: PieceClass.description,
      unicode: PieceClass.unicode,
      maxSize: temp.maxSize,//get stat?
      moves: temp.moves,
      range: temp.range,
      attack: temp.attack,
      defence: temp.defence,
      rarity: temp.rarity,
      color: PieceClass.color,
      isPlaced: false,
      cost: temp.rarity*2-1                     
    };
  }

  const shopBlueprints = ref<PieceBlueprint[]>([]);
  const shopItems = ref<Item[]>([]);
  const rerollCost = ref(5);//to be reset after shop
  const prevFib = ref(0);//to be reset after shop
  const currentFib = ref(1);//to be reset after shop

  function refreshShop(isFree: boolean) {
    //console.log(rerollCost.value)
    if(!isFree && player.value.money < rerollCost.value) return;//show to shop for disabled button
    if(!isFree) {//player is rerolling
      player.value.money -= rerollCost.value;
      const nextFib = prevFib.value + currentFib.value;
      prevFib.value = currentFib.value;
      currentFib.value = nextFib;

      rerollCost.value += currentFib.value;
      if(player.value.hasAdmin('Slots')){
        rerollCost.value-=2;
      }
    }

    const classes = [
      pickWeightedRandom(allPieces, player.value),
      pickWeightedRandom(allPieces, player.value),
      pickWeightedRandom(allPieces, player.value),
    ];
    shopBlueprints.value = classes.map(c => makeBlueprint(c));

    //no reappearing admins
    let availableAdmins = allAdmins;
    if(player.value.hasAdmin('Bouquet')){
      const ownedAdmins = new Set(player.value.admins.map(a => a.name));
      availableAdmins = allAdmins.filter(
        AdminClass => !ownedAdmins.has(AdminClass.name) // or .name
      );
    }
    const allItemsAndAdmins: ItemConstructor[] = [...allItems, ...availableAdmins];
    shopItems.value = [
      pickWeightedRandomItem(allItemsAndAdmins, player.value),
      pickWeightedRandomItem(allItemsAndAdmins, player.value),
      pickWeightedRandomItem(allItemsAndAdmins, player.value),
    ];
    if(player.value.hasAdmin('Department Store')){
      const extraP = pickWeightedRandom(allPieces, player.value);
      shopBlueprints.value.push(makeBlueprint(extraP));
      const extraI = pickWeightedRandomItem(allItems, player.value);
      const extraA = pickWeightedRandomItem(availableAdmins, player.value);
      shopItems.value.push(extraI, extraA);
    }
    //if triggered by player
  }

  function buyBlueprint(bp: PieceBlueprint) {
    shopBlueprints.value = shopBlueprints.value.filter(b => b.id !== bp.id);
    player.value.money -= bp.cost;
    player.value.programs.push(bp);
    shopTarget.value = null;
  }
  function buyItem(item: Item) {
    // remove from shop
    shopItems.value = shopItems.value.filter(i => i.id !== item.id);
    player.value.money -= item.cost;
    // decide which inventory to place it in
    if (item instanceof Admin) {
      player.value.admins.push(item);
      handleApplyAdmins('other', item.id)
    } else {
      player.value.items.push(item);
    }
    shopTarget.value = null;
  }
  const showShop = ref(false)
  const showCompiler = ref(false)
  const showMap = ref(false)
  const showBoard = ref(false)
  //--shop-----

  //round logic
  const roundHasStarted = ref(false);
  //pieceMap to track occupied spaces
  const activePieces = ref<InstanceType<typeof Piece>[]>([]);
  const graveyard = ref<InstanceType<typeof Piece>[]>([]);
  //Record: key ID, Modifier for piece with that ID
  //stats should be applied to activePieces after select level
  const bossAdmins = ref<Admin[]>([]);
  function addBossAdmin(admin: Admin){
    bossAdmins.value.push(admin)
  }

  async function handleApplyAdmins(trigger: AdminTrigger, id:string){//admin and target
    if(!player.value.hasAdmin('Umbrella')){
      for (const admin of bossAdmins.value) {
        if(trigger === admin.triggerType){
          // sort through target types, decide what to pass
          if(admin.targetType === 'player'){
            await admin.apply({player: player.value})
          }
          if(admin.targetType === 'gameState'){
            await admin.apply({id, activePieces: activePieces.value})
          }
          if(admin.targetType === 'playerAndGame'){
            await admin.apply({id, activePieces: activePieces.value, player: player.value})
          }
          if(admin.targetType === 'piecesAndBoard'){
            await admin.apply({activePieces: activePieces.value, board: level.value.tiles})
          }
          if(admin.targetType === 'all'){
            await admin.apply({activePieces: activePieces.value, board: level.value.tiles, player: player.value});//, graveyard: graveyard.value})
          }
        }
      }
    };
    const playerAdmins = player.value.admins;
    for (const admin of playerAdmins) {
      if(trigger === admin.triggerType){
        // sort through target types, decide what to pass
        if(admin.targetType === 'gameState'){
          await admin.apply({id, activePieces: activePieces.value})
        }
        if(admin.targetType === 'playerAndGame'){
          await admin.apply({id, activePieces: activePieces.value, player: player.value})
        }
        if(admin.targetType === 'player'){
          await admin.apply({player: player.value})
        }
      }
    };
  }

  const selectedPiece = ref<Piece | null>(null)
  const playerSpawns = ref<Coordinate[]>([]);
  const isPlacing = ref(false);
  const isMoving = ref(false);
  const hasFinishedTurn = ref(false);
  const isFirstTurn = ref(true);
  const pieceToPlace = ref<PieceBlueprint | null>(null);
  //world logic
  const level = ref(castled);//tiles
  const displayEditor = ref(false);
  const showSummary = ref(false);
  
  //map
  const toggleMap = () => {
    showMap.value = !showMap.value;
  }
  const openSummary = (state: boolean) => {
    showSummary.value = state;
  }

  const renewBlueprints = () => {
    if(player.value.hasAdmin('Ring')){
      activePieces.value.forEach(piece => {
        const id = piece.id;
        player.value.programs.forEach(blueprint => {
          if(blueprint.id === id){
            blueprint.maxSize += (piece.maxSize);
            blueprint.moves += (piece.moves);
            blueprint.range += (piece.range);
            blueprint.attack += (piece.attack);
            blueprint.defence += (piece.defence);
          }
        });
      });
    }
    player.value.programs.forEach(blueprint => {
      blueprint.isPlaced = false;
    });
  }

  const lastTurnPieces = ref<InstanceType<typeof Piece>[]>([]);
  const originalPieces = ref<InstanceType<typeof Piece>[]>([]);
  const originalSpawns = ref<Coordinate[]>([]);

  const selectLevel = (newLevel: Level, difficultyMod: number, lReward: number) => {//load level, start 
    pieceToPlace.value = null;
    showBoard.value = true;
    renewBlueprints()//shouldnt be needed in final;
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
    activePieces.value = processSpawnPoints(newPieces , difficultyMod);
    originalPieces.value = activePieces.value.map(p => p.clone());
    originalSpawns.value = playerSpawns.value;
    boardRef.value.clearHighlights();
    handleApplyAdmins('onRoundStart', '');
    toggleMap();
    roundHasStarted.value = true;
  }

  function handleProceed(){
    openSummary(false);
    if(bossAdmins.value.length > 0){
      increaseDifficulty();
    }
    toggleMap();
  }

  function reloadLevel(){
    renewBlueprints();
    activePieces.value = originalPieces.value.map(p => p.clone());
    graveyard.value = [];
    lastTurnPieces.value = originalPieces.value.map(p => p.clone());
    playerSpawns.value = originalSpawns.value;
    selectedPiece.value = null;
    isPlacing.value = true
    openSummary(false);
    roundHasStarted.value = true;
  }

  function retryLevel(){
    if(player.value.lives<=1) return
    player.value.lives --
    reloadLevel();
  }

  //game loop
  const toggleShop = () => {
    showShop.value = !showShop.value;
  }
  const openShop = () => {
    showShop.value = true;
  }
  const toggleCompiler = () => {
    showCompiler.value = !showCompiler.value;
  }
  const openCompiler = () => {
    showCompiler.value = true;
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

  function processSpawnPoints(pieces: Piece[], mod: number) {
    const processed: Piece[] = [];
    playerSpawns.value = []

    for (const piece of pieces) {
      if (piece instanceof Spawn) {
          const spawnSize = piece.tiles.length;
        // Enemy spawn → replace with random enemy piece
        if (piece.team === 'enemy') {
          //difficulty from constants ramp
          const { min, max } = DIFFICULTY_RARITY[player.value.difficulty + mod];

          const validEnemies = allPieces.filter(EnemyClass => {
            //p.rarity >= min && p.rarity <= max //old method for spawnsize 1 only
            if(EnemyClass.name !== "Nuke"){// remove nukes
              const temp = new EnemyClass(piece.headPosition, 'enemy', removePiece);
              return (
                temp.rarity >= min &&
                temp.rarity <= max &&
                temp.maxSize >= spawnSize
              );
            }
          });
          const pool = validEnemies.length > 0 ? validEnemies : allPieces;
          //console.log('lengths:', min, max, allPieces.length, pool.length)

          const EnemyClass = pool[Math.floor(Math.random() * pool.length)];
          //allPieces[Math.floor(Math.random() * allPieces.length)];//base this off rarity/difficulty later

          const enemyInstance = new EnemyClass(piece.headPosition, 'enemy', removePiece);
          enemyInstance.tiles = piece.tiles;
          //add tiles here? if spawn.tiles.length <= enemy.getStat(maxsize){ enemy.tiles = spawn.tiles }
          processed.push(enemyInstance);
          continue;
        }

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
    activePieces.value = processSpawnPoints(initPieces, 0); // sets placementHighlights internally
    refreshShop(true)//handle in round, or don't for crystal ball
  });

  //round state functions
  function highlightPlacements(pieceBlueprint: PieceBlueprint) {
    if(!roundHasStarted) return
    boardRef.value.clearHighlights();
    if(player.value.hasAdmin('Backdoor')){
      const unnocupiedSpaces: Coordinate[] = [] ;
      level.value.tiles.forEach(tile => {
        const isOccupied = activePieces.value.some(p =>
         p.tiles.some(t => t.x === tile.x && t.y === tile.y)
        );
        if (!isOccupied) unnocupiedSpaces.push(tile); 
      });
      playerSpawns.value = unnocupiedSpaces;
    }
    else if(!isFirstTurn){
      playerSpawns.value = newPlacementHighlights();
    }
    pieceToPlace.value = pieceBlueprint;
    isPlacing.value = true;
  }

  async function removePiece(piece: Piece) {
    if(player.value.hasAdmin('Hi-Vis')){
      piece.tiles = [piece.headPosition];
      const index = player.value.admins.findIndex(a => a.name === 'Hi-vis');
      if (index !== -1) player.value.admins.splice(index, 1);
    } else {
      await handleApplyAdmins('onPieceDestruction', piece.id);
      activePieces.value = activePieces.value.filter(p => p.id !== piece.id);
      //graveyard?
      if (piece.name == 'Dolls') {//hybrids will need a flag other than name
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


      // Step 3: hybrid-specific augmentation
      if (bp.hybridName) {
        piece.name = bp.hybridName ? bp.hybridName : 'Unknown Hybrid'
        piece.description = bp.description;
        //piece.unicode = bp.unicode //should already be the case
        piece.extraUnicode = bp.extraUnicode
      }

    return piece//modified piece with new stats
  }

  function placePieceOnBoardAt(coord: Coordinate) {
    if (!pieceToPlace.value) return
    
    const bp = pieceToPlace.value
    
    const PieceInstance = instantiatePieceFromBlueprint(bp, coord, 'player', removePiece)
    if (!PieceInstance) return

    //we're definitely making a move, so store pieces
    lastTurnPieces.value = activePieces.value.map(p => p.clone());

    //pass admin modifiers to the piece
    activePieces.value.push(PieceInstance);

    // Mark blueprint as placed so it greys in inventory
    bp.isPlaced = true

    // Reset placement state
    pieceToPlace.value = null;
    playerSpawns.value = newPlacementHighlights();
    
    //applyStatModifications()
    handleApplyAdmins('onPlacement', PieceInstance.id)

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
        endTurn();
      }
    } else {
      // Not first turn -> normal behaviour
      isPlacing.value = false;
      endTurn();
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

  function clearDrag(){//TODO reuse in board when we click normally
    pieceToPlace.value = null;
    isPlacing.value = false;
    isDraggingPlacement.value = false;
  }
  //previous board functions
  //highlight functions
  const boardRef = ref();
  
  //selectedPiece functions
  function handlePieceSelect(piece: Piece) {//handleselect
    if(isPlacing.value){
      isPlacing.value = false;
    }
    selectedPiece.value = piece
    //highlight range
    if(piece.team === 'enemy'){
      boardRef.value.highlightTargets(piece);
    } else if(player.value.canMove){
      boardRef.value.highlightMoves(piece);
    }
  }

  const deselectPiece = () => {
    selectedPiece.value = null;
    boardRef.value.clearHighlights();
  }

  const movePiece = async (coord : Coordinate) => {
    console.log('moving player')
    if(!selectedPiece.value || !player.value.canMove) return;
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
      await trap.special(selectedPiece.value);
      removePiece(trap);//shouldn't really be necessary
    }
    if(selectedPiece.value.movesRemaining > 0){
      boardRef.value.highlightMoves(selectedPiece.value);
    }else {
      boardRef.value.clearHighlights();
    }
    playerSpawns.value = newPlacementHighlights();
  }

  function checkForRoundEnd(){
    console.log('checking for round end: ', activePieces.value)
    const enemyPieces = activePieces.value.filter(p => p.team === 'enemy');
    const playerPiecesRemaining = activePieces.value.filter(p => p.team === 'player');
    if (enemyPieces.length === 0) {
      console.log('round won!')
      endRound(true);
    }
    // If no player pieces → round lost
    if (playerPiecesRemaining.length === 0) {
      console.log('round failed!')
      endRound(false);
    }
  }

  const damagePieceAt = async (coord:Coordinate) => {
    if (!selectedPiece.value) return
    if((selectedPiece.value.team === 'enemy' && !selectedPiece.value.statuses.charmed) || (selectedPiece.value.team === 'player' && selectedPiece.value.statuses.charmed)) return
    player.value.canPlace = false;
    //if (selectedPiece.value.team !== 'player') return //damaging your own pieces is actually useful sometimes
    const damageReceiver = activePieces.value.find(piece =>
      piece.tiles.some(t => t.x === coord.x && t.y === coord.y)
    );
    //console.log('receiver: ', damageReceiver?.name)
    if (!damageReceiver || (damageReceiver.team === selectedPiece.value.team && !selectedPiece.value.statuses.charmed)) return;
    //console.log("Damage call:", coord, damage)
    const baseDamage = selectedPiece.value.getStat('attack');
    await handleApplyAdmins('onDealDamage', selectedPiece.value.id)//attacker's id, (bug: blood tax will trigger even on no damage)
    const damage = Math.floor(baseDamage * selectedPiece.value.damageMult)//mult should be applyed inside takeDamage for special moves
    await damageReceiver.takeDamage(damage);
    selectedPiece.value.damageMult = 1;
    if(damageReceiver.willRetaliate){
      await selectedPiece.value.takeDamage(damageReceiver.getStat('attack'));
      if(damageReceiver.name === 'Puffer' && !selectedPiece.value.immunities.poisoned){
        selectedPiece.value.statuses.poisoned = true;
      }
    }
    selectedPiece.value.willRetaliate = false;//pieces that have enacted defensive option
    //could trigger blood tax here using 'other'
    
    selectedPiece.value.actions --//getstat?
    selectedPiece.value.damageMult = 1;
    //console.log(damageReceiver?.name, ' tiles afterdmg: ', damageReceiver.tiles)
    boardRef.value.clearHighlights();
    checkForRoundEnd();
  }

  const handleSpecialActionAt = async (target: Coordinate) => {
    //the enemy should also be able to use special moves, handle in enemy?
    if(!selectedPiece.value || selectedPiece.value.actions <= 0) return
    if((selectedPiece.value.team === 'enemy' && !selectedPiece.value.statuses.charmed) || selectedPiece.value.team === 'player' && selectedPiece.value.statuses.charmed) return
    boardRef.value.clearHighlights();
    // find piece at targeted coordinate
    const targetPiece = activePieces.value.find(piece =>
      piece.tiles.some(t => t.x === target.x && t.y === target.y)
    );
    // --- piece target ---
    if (selectedPiece.value.targetType === 'piece') {
      if (targetPiece) {
        await selectedPiece.value.special(targetPiece);
        playerSpawns.value = newPlacementHighlights();
        selectedPiece.value = null;
      }
      return;
    }
    // --- piece + player payload ---
    if (selectedPiece.value.targetType === 'pieceAndPlayer') {
      if (targetPiece) {
        await selectedPiece.value.special({
          piece: targetPiece,
          player: player.value
        });
        playerSpawns.value = newPlacementHighlights();
        selectedPiece.value = null;
      }
      return;
    }
    if (selectedPiece.value.targetType === 'pieceAndPlace') {
      if (targetPiece) {
        await selectedPiece.value.special({
          piece: targetPiece,
          target: target
        });
        playerSpawns.value = newPlacementHighlights();
        selectedPiece.value = null;
      }
      return;
    }
    // --- space target --- target must be a space
    if (selectedPiece.value.targetType === 'space') {//test
      if(!targetPiece){
        await  selectedPiece.value.special({
          target: target,
          activePieces: activePieces.value
        });
      }
      playerSpawns.value = newPlacementHighlights();
      selectedPiece.value = null;
      return;
    }
     // --- one target but effects all --- target can be a piece
    if (selectedPiece.value.targetType === 'all') {
      await selectedPiece.value.special({
        target: target,
        activePieces: activePieces.value
      });
      playerSpawns.value = newPlacementHighlights();
      selectedPiece.value = null;
      return;
    }
    // --- group target (AOE) ---
    if (selectedPiece.value.targetType === 'group') {
      // get every piece inside selectedPiece.value.range
      const thisRange = selectedPiece.value.getStat('range');
      const inRange = activePieces.value.filter(p => 
        p.tiles.some(tile => 
          Math.abs(tile.x - target.x) + Math.abs(tile.y - target.y) <= thisRange//check
        )
      );
      await selectedPiece.value.special(inRange);
      playerSpawns.value = newPlacementHighlights();
      selectedPiece.value = null;
      return;
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
        tilesInLine.push({x, y})    
        x += dx;
        y += dy;
      }
      tilesInLine.push(target);
      await actor.special({
        line: tilesInLine,
        activePieces: activePieces.value
      });
      playerSpawns.value = newPlacementHighlights();
      selectedPiece.value = null;
      return;
    }
    // --- self target ---
    if (selectedPiece.value.targetType === 'self') {
      await selectedPiece.value.special(selectedPiece.value);
      playerSpawns.value = newPlacementHighlights();
      selectedPiece.value = null;
      return;
    };
    if (selectedPiece.value.targetType === 'graveyard') {//test
      if(!targetPiece){
        await  selectedPiece.value.special({
          target: target,
          activePieces: activePieces.value,
          graveyard: graveyard.value
        });
      }
      playerSpawns.value = newPlacementHighlights();
      selectedPiece.value = null;
      return;
    }
  };

  const hasWonRound = ref<boolean>(false);
  
  const endRound = (roundWon: boolean) => {
    activePieces.value = [];
    graveyard.value = [];
    lastTurnPieces.value = [];
    selectedPiece.value = null;
    renewBlueprints();//move to end round?
    if(roundWon){
      //bring up round summary
      hasWonRound.value = true;
      handleApplyAdmins('onRoundEnd', '');
      openSummary(true);
      //move to btn inside round summary
    } else {
      hasWonRound.value = false;
      openSummary(true);
      //check admins for onion
      if(player.value.hasAdmin('Onion')){
        const index = player.value.admins.findIndex(a => a.name === 'Onion');
        if (index !== -1) player.value.admins.splice(index, 1);
      }
      else if(player.value.lives > 0){
        player.value.lives -= 1
      }else{
        alert('game over!')
      }
    }
    for (const admin of bossAdmins.value) {//only necessary if we keep boss admins
      admin.onRoundEnd?.();
    }
    for (const admin of player.value.admins) {
      admin.onRoundEnd?.();
    }
    roundHasStarted.value = false;
  }
      
  function onReceiveDamage (id: string) {
    handleApplyAdmins("onReceiveDamage", id);
  }

  //enemy moves
  async function enemyTurn() {

    const tileSet = new Set(level.value.tiles.map(t => `${t.x},${t.y}`));

    await runEnemyStateMachine(
      activePieces.value,
      //removePiece, // callback to remove dead pieces
      boardRef.value.highlightMoves,
      boardRef.value.highlightTargets,
      boardRef.value.clearHighlights,
      //handleSpecialActionAt,
      tileSet,
      onReceiveDamage,
      300
    );
    checkForRoundEnd();
    // Reset enemy actions/moves after their turn if needed
    const enemyPieces = activePieces.value.filter(p => (p.team === 'enemy' && !p.statuses.charmed));//not refs so won't update
    enemyPieces.forEach(p => {
      p.actions = 1;
      p.movesRemaining = p.moves;
    });
    playerSpawns.value = newPlacementHighlights();
    hasFinishedTurn.value = false;
  }

  const applyStatusEffects = (team: string) => {//async for animations?
    activePieces.value.forEach(piece => {
      //petri dish, spread statuses here
      if(piece.team === team){
        const mult = player.value.hasAdmin('Volatile') ? 2 : 1
        piece.applyStatusEffects(mult);
      }
    });
  }

  const endTurn = async () => {
    hasFinishedTurn.value = true;
    selectedPiece.value = null;
    pieceToPlace.value = null;
    //closeInventory();
    player.value.canPlace = false;
    player.value.canMove = false;
    player.value.canAction = false;
    activePieces.value.forEach(piece => {
      piece.resetMoves();
      piece.actions = 1;
      if(piece.team === 'enemy'){
        piece.resetTempModifiers();
      }
    });
    handleApplyAdmins('onTurnEnd', '');
    applyStatusEffects('player');
    await enemyTurn();
    applyStatusEffects('enemy');
    //player piece tempstats reset
    activePieces.value.forEach(piece => {
      if(piece.team === 'player' ){
        piece.resetTempModifiers();
      }
    })
    if(isFirstTurn){
      isFirstTurn.value = false;
    }
    player.value.canPlace = true;
    player.value.canMove = true;
    player.value.canAction = true;
    hasFinishedTurn.value = false;
  }
  
  // When editor exports a new level, shouldn't be needed in final
  const handleExport = (levelData: any) => {
    level.value.tiles = levelData.tiles;
    level.value.pieces = levelData.pieces;
    // Hydrate pieces once
    const initPieces = rehydratePieces(level.value.pieces);
    activePieces.value = processSpawnPoints(initPieces, 0);

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
  const increaseDifficulty = () => {
    player.value.difficulty += 1;
    bossAdmins.value = [];
    refreshShop(true);
    worldSeed.value++
  }
  const decreaseDifficulty = () => {
    player.value.difficulty -= 1;
    worldSeed.value--
  }

  function onKeydown(e: KeyboardEvent) {
    // ignore typing in inputs
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault(); // stop page scroll
        endTurn();
        break;

      case 'A':
        boardRef.value.highlightTargets;
        break;

      case 'S':
        boardRef.value.highlightSpecials;
        break;
    }
  }

  watch(hasFinishedTurn, () => {
    if (!hasFinishedTurn) {
      window.addEventListener('keydown', onKeydown);
    } else {
      window.removeEventListener('keydown', onKeydown);
    }
  }, { immediate: true });

  const debugMode = ref<boolean>(false);
</script>

<template>
  <div class="app-root">
  <div class="debug-controls">
    <button v-if="debugMode === true" class="swap-display" @mousedown="swapDisplay()">
      {{ displayEditor ? "Show Board" : "Show Editor" }}
    </button>
    <button v-if="debugMode === true" class="swap-display" @mousedown="renewBlueprints()">
      Renew Blueprints
    </button>
    <button
    v-if="player.hasAdmin('Convenience Store') || debugMode === true"
    class="shop-toggle"
    @mousedown="toggleShop()">
    Toggle Shop
    </button>
    <button
    v-if="player.hasAdmin('Gene Splicing') || debugMode === true"
    class="compiler-toggle"
    @mousedown="toggleCompiler()">
    Toggle Compiler
    </button>
    <button v-if="debugMode === true" class="map-toggle" @mousedown="toggleMap()">
      Toggle Map
    </button>
     <button
     v-if="debugMode === true" class="board-toggle" @mousedown="showBoard = true">
      Toggle Board
    </button>
    <button
    v-if="debugMode === true" class="difficulty" @mousedown="increaseDifficulty()">
      Increase Security
    </button>
    <button
    v-if="debugMode === true" class="difficulty" @mousedown="decreaseDifficulty()">
      Decrease Security
    </button>
    <button class="difficulty" @mousedown="toggleFastControls()">
      Fast Controls
    </button>
  </div>
  <div class="top-hud">
    <div class="enemy-info">
      <p><strong>Security level: </strong>{{ player.difficulty }}</p>
      <span>
        <BossView :admins="bossAdmins"/>
      </span>
    </div>
    <div v-if="!displayEditor && roundHasStarted" class="player-helper">
      <div v-if="!hasFinishedTurn && !isPlacing" class="turn-info">Your turn</div>
      <div v-if="isPlacing && pieceToPlace">
        <p>Placing:</p>
        <button @click="pieceToPlace=null">Cancel</button>
      </div>
      <div v-if="isPlacing && pieceToPlace"
        class="info">
        <BlueprintView :blueprint="pieceToPlace"
        :tileSize="60"
        :cssclass="'placing'"
        />
      </div>
    </div>
  </div>
  <div class="stage">
    <MainMenu v-if="showMainMenu && !displayEditor" @createNewPlayer="createNewPlayer" class="stage-panel" :class="{ active: showMainMenu }"/>
    <RoundSummary v-if="showSummary" class="stage-panel" :class="{ active: showSummary }"
      :hasWonRound="hasWonRound"
      :player="player"
      @proceedFromEndOfRound="handleProceed"
      @reloadLevel="reloadLevel"
      @mainMenu="openMainMenu"
    />
    <WorldMap v-if="!displayEditor" class="stage-panel" :class="{ active: showMap }"
      :allLevels="level1Levels"
      :player="player"
      :seed="worldSeed"
      :cssclass="mapClass"
      @select-level="selectLevel"
      @openShop="openShop"
      @openCompiler="openCompiler"
      @addBoss="addBossAdmin"
      @increaseDifficulty="increaseDifficulty"
    />
    <Shop v-if="!displayEditor" class="stage-panel" :class="{ active: showShop }"
      :cssclass="shopClass"
      :shopBlueprints="shopBlueprints"
      :shopItems="shopItems"
      :rerollCost="rerollCost"
      :target="shopTarget"
      @refresh-shop="refreshShop(false)"
      @buy-blueprint="buyBlueprint"
      @buy-item="buyItem"
      @selectTarget="selectShopTarget"
      @clearTarget="clearShopTarget"
      @toggleShop="toggleShop"
      :player="player"
    />
    <HybridCompiler v-if="!displayEditor" class="stage-panel" :class="{ active: showCompiler }"
      :player="player"
      :pieceToPlace="pieceToPlace"
      :isDraggingPlacement="isDraggingPlacement"
      @openCompiler="openCompiler"
      @toggleCompiler="toggleCompiler"
      @clear-drag="clearDrag"
      @close="toggleCompiler"
    />
    <Board ref="boardRef" v-if="!displayEditor" class="stage-panel" :class="{ active: showBoard }"
    :tiles="level.tiles"
    :pieces="activePieces"
    :selectedPiece="selectedPiece"
    :placementHighlights="playerSpawns"
    :isFirstTurn="isFirstTurn"
    :placementMode="isPlacing"
    :movementMode="isMoving"
    :hasFinishedTurn="hasFinishedTurn"
    :player="player"
    :showFastControls="showFastControls"
    :isDraggingPlacement="isDraggingPlacement"
    :pieceToPlace="pieceToPlace"
    @placeOnBoard="placePieceOnBoardAt"
    @handlePieceSelect="handlePieceSelect"
    @deselect="deselectPiece"
    @movePiece="movePiece"
    @damagePieceAt="damagePieceAt"
    @specialActionAt="handleSpecialActionAt"
    @placeAt="placeAt"
    />  
  </div>
  <Leveleditor v-if="displayEditor" @export-level="handleExport"/>
  <div class="player-area">
    <!-- PlayerView + End Turn / Retry -->
    <PlayerView v-if="!displayEditor"
    :player="player"
    :showInventory="showInventory"
    @highlightPlacements="highlightPlacements"
    @sellBlueprint="sellBlueprint"
    @sellItem="sellItem"
    @applyItem="handleApplyItem"
    @sellAdmin="sellAdmin"
    @reorderAdmins="player.admins = $event"
    @startPlacementDrag="startPlacementDrag"
    @closeInventory="toggleInventory"
    @openInventory="toggleInventory"
    />
    <PieceController
      v-if="selectedPiece && !hasFinishedTurn"
      :piece="selectedPiece"
      mode="action"
      :hasFinishedTurn="hasFinishedTurn"
      :canBuy="false"
      :canMove="player.canMove"
      :canAction="player.canAction"
      @highlightMoves="boardRef.highlightMoves"
      @highlightTargets="boardRef.highlightTargets"
      @highlightSpecials="boardRef.highlightSpecials"
      @close="deselectPiece"
      />
    <div v-if="!displayEditor" class="player-actions">
      <button v-if="(!displayEditor && roundHasStarted && !hasFinishedTurn) || debugMode" class="end-turn" v-on:click="endTurn()">End Turn</button>
      <!--<button class="mt-2 px-2 py-1 bg-blue-500 text-white rounded" @click="showInventory = !showInventory">{{showInventory ? 'Hide Inventory' : 'Inventory' }}</button>-->
      <div v-if="!displayEditor && roundHasStarted" class="graveyard">
        <button>🪦</button>
      </div>
      <button v-if="!displayEditor && roundHasStarted && player.lives > 1" class="retry-btn" v-on:click="retryLevel()">Retry</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.player-helper{
  position: absolute;
  top: 10px;
  right: 10px;
}
.turn-info{
  font-weight: bold;
  color: red;
}
.enemy-info{
  display: flex;
  gap: 2rem;
}
.info{
  position: relative;
  height: 60px;
  display: flex;
  justify-content: center;
}
.debug-controls{
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
.end-turn, .retry-btn{
  border: 1px solid white;
  z-index: 9999;
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
