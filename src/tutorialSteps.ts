export type TutorialStep = {
    id: string,
    tooltip: string
}
const welcomeTip: TutorialStep = {
    id: "welcome",
    tooltip: "Welcome to cyberspace! I'll be here to guide you through the basics of hacking. Click anywhere you see me and I will keep you informed as we go.",
}
const mapTip: TutorialStep = {
    id: 'node-map',
    tooltip: 'This is the Node map. Choose your path forward, there will always be an easier path to the left with two nodes at your current security level(difficulty). Alternatively, there may also be a harder path with greater rewards, an option receive a free program or item followed by a harder level, or other hidden rewards.'
}
const visitedNodeTip: TutorialStep = {
    id: 'visited',
    tooltip: 'A previously visited node. You cannot enter it again.'
}
const levelNodeTip: TutorialStep = {
    id: 'levelNode',
    tooltip: 'This is a privately controlled node, the icon shows us what company it is owned by. The $ amount below is the reward for clearing this node. The 🔒 number indicates security level of a Node. Rarer, higher level enemy programs appear at higher difficulties. Click on it to see the preview.'
}
const hiddenNodeTip: TutorialStep = {
    id: 'unrevealed',
    tooltip: 'This is a hidden node, reach a connecting node to reveal it.'
}
const previewTip: TutorialStep = {
    id: 'preview-modal',
    tooltip: 'The preview panel shows more detailed information about a node.'
}
const skipNodeTip: TutorialStep = {
    id: 'skipNode',
    tooltip: 'Choosing this node will reward you with the pictured program/item. Click on it to see the details.'
}
const shopNodeTip: TutorialStep = {
    id: 'shopNode',
    tooltip: 'This node is a shop where you can purchase new programs, admins, and consumable items.'
}
const bossTip: TutorialStep = {
    id: 'item-boss',
    tooltip: "This is an active boss, click on it to read it's effect."
}
const bossNodeTip: TutorialStep = {
    id: 'bossNode',
    tooltip: "This is the boss for this security level, it's effects are described on the right. Bosses act like admins for the enemy, they may boost enemy stats, nerf yours, or add some other challenging effect to a node. Beating it will load a new node map, and raise the security level of all future nodes by one."
}
const currentNodeTip: TutorialStep = {
    id: 'current',
    tooltip: 'Your current position in cyberspace, the only way is up from here.'
}
const boardTip: TutorialStep = {
    id: "board",
    tooltip: "Now we're inside a Node. Your job is to clear all the enemy programs from it using your own programs. First, you may either load a new program in each green 🔲. After the first turn, you may move and take actions with your loaded programs, or load in one new program next to any tile you occupy. Be careful, once you finish loading your programs in, the enemy programs will take their move, so don't place anything vunerable too close to an enemy. If all your loaded programs are cleared from a node, you will lose a life and be kicked from the node."
}
const placementTip: TutorialStep = {
    id: "placement-tile-tip",
    tooltip: "Drag one of your programs here to load it. This will also end your turn, so be wary what you can be attacked by in this space."
}
const spawnTip: TutorialStep = {
    id: 'spawnTip',
    tooltip: "This is a load point into this node, drag one of your programs here to load it. All 🔲 will dissapear after this turn, but you can still load next to your other programs later instead of moving."
}
const programTip: TutorialStep = {
    id: 'playerPieceTip',
    tooltip: "This is one of your loaded programs, click on it to see it's stats"
}
const enemyProgramTip: TutorialStep = {
    id: 'enemyPieceTip',
    tooltip: "This is a loaded enemy program, click on it to see it's stats"
}
const shopbpTip: TutorialStep = {
    id: 'shop-piece',
    tooltip: "This is a program blueprint, click on it to see it's stats and special function. Purchase it to add it to your inventory."
}
const bpTip: TutorialStep = {
    id: 'inventory-piece',
    tooltip: "You own this program, click on it to see it's stats. After entering a node, select or drag it into the node to load it. You can reload programs later in other nodes."
}
const controllerTip: TutorialStep = {
    id: 'piece-controller',
    tooltip: "This panel shows you details about a program."
}
const maxsizeTip: TutorialStep = {
    id: 'stat-maxsize',
    tooltip: "Max size: Maximum size  a program can reach, essentially it's max HP."
}
const movesTip: TutorialStep = {
    id: 'stat-moves',
    tooltip: "Moves: How many spaces a program can move each turn."
}
const rangeTip: TutorialStep = {
    id: 'stat-range',
    tooltip: "Range: The orthagonal distance a program can target attacks or it's special move."
}
const attackTip: TutorialStep = {
    id: 'stat-attack',
    tooltip: "Attack: How much damage a program will do to another on attacking."
}
const defenceTip: TutorialStep = {
    id: 'stat-defence',
    tooltip: "Defence: How much damage a program can take before losing tiles. Like moves, this resets each turn."
}
const actionsTip: TutorialStep = {
    id: 'stat-actions',
    tooltip: "Actions: How many attacks or special moves this program can do this turn, usually 1 unless boosted."
}
const moveBtnTip: TutorialStep = {
    id: 'mv-btn',
    tooltip: 'Click here to move this program, use the arrows to choose a direction'
}
const atkBtnTip: TutorialStep = {
    id: 'atk-btn',
    tooltip: 'Click here to attack with this program, you can damage any other program in range'
}
const specialBtnTip: TutorialStep = {
    id: 'special-btn',
    tooltip: "Click here to use this program's special, read the program description to find out what you can target."
}
/*const enemyTip: TutorialStep = {
    id: 'enemy-info',
    tooltip: "View information about your challengers here."
}*/
const securityTip: TutorialStep = {
    id: 'security',
    tooltip: "Your current difficulty. At higher security levels, rarer pieces will start spawning as enemies, and variants are more likely to appear, as well as more powerful variants, and harder bosses."
}
const infamyTip: TutorialStep = {
    id: 'infamy',
    tooltip: "Higher infamy will add extra challenges on top of your security, you raise this before starting a run. <strong>lvl 1:</strong> Start each node with only 2 load points. <strong>lvl 2:</strong> Bosses accumulate from beginning, <strong>lvl 3:</strong> Start with only 1 load point. "//<strong>lvl 4:</strong>  Enemies get +1 maxSize per security level Enemies get +1 range per security level, <strong>lvl 5:</strong> Enemies get +1 attack per security level, <strong>lvl 6:</strong> Enemies get +1 defence per security level"
}
const bossesTip: TutorialStep = {
    id: 'enemy-bosses',
    tooltip: "Enemy bosses are displayed here. Below security 6 and infamy 2 they will reset when defeated."
}
const summaryTip: TutorialStep = {
    id: 'if-won',
    tooltip: 'At the end of each round, you earn interest on currently held $. You may also collect any extra money generated by your admins.',
}
const lossTip: TutorialStep = {
    id: 'if-lost',
    tooltip: "You have been kicked out of this node, and have been deducted 1 life. You may retry if you have any lives remaining.",
}
const shopTip: TutorialStep = {
    id: 'shop-container',
    tooltip: "At the shop, you can buy new programs (P), admin programs (A), or consumable items (I). There are 6 tiers of rarity. You can reroll the shop for a price, the cost exponentially increases with each reroll, but resets at each shop.",
}
const rerollTip: TutorialStep = {
    id: 'shop-reroll-btn',
    tooltip: "The current reroll price. Each reroll will add $1 + any previous additions to the cost. This will reset to $5 at each new shop.",
}
const shopItemTip: TutorialStep = {
    id: 'item-consumable',
    tooltip: "This is a consumable item, it takes up 1 memory in your inventory and can only be used once. Click on it to see what it does.",
}
const adminTip: TutorialStep = {
    id: 'item-admin',
    tooltip: 'This is an admin, it takes up an admin slot and will provide passive benefits when it is triggered. Click on it to see what it does.',
}
const adminsTip: TutorialStep = {
    id: 'admin-header',
    tooltip: 'This is where your admins are kept. Admins with the same trigger will execute their effects left to right, you can drag the order around here.',
}
const playerInfoTip: TutorialStep = {
    id: 'player-info',
    tooltip: "This section shows your current money and remaining lives.",
}
/*const invBtnTip: TutorialStep = {
    id: 'inv-btn',
    tooltip: "Click here to toggle your inventory.",
}*/
const inventoryTip: TutorialStep = {
    id: 'inventory',
    tooltip: "This is your inventory. You have a limited amount of memory, which programs and items will each take up 1 space of.",
}
const nodePreviewTip: TutorialStep = {
    id: 'map-wrapper',
    tooltip: "The node preview shows your starting load point in green outlined in white, and the enemies in red.",
}
const interestTip: TutorialStep = {
    id: 'interest-summary',
    tooltip: "You will earn an extra $1 for every $5 you have at the end of each round, up to the maximum interest, which is $5 by default.",
}
const rewardTip: TutorialStep = {
    id: 'reward-summary',
    tooltip: "You have earned a reward for completing this node. Plus any bonus rewards granted from your admin programs",
}
const infoBtnTip: TutorialStep = {
    id: 'info-btn',
    tooltip: "Click here to see your past stats, current seed, and previously used programs and items",
}
const quickStatsTip: TutorialStep = {
    id: 'piece-stats-left',
    tooltip: "👋 will appear for every action this program has left. ⚔ number is It's attack. 🦶 is it's remaining moves. 🛡 is it's remaining defence.",
}
export const allTips: TutorialStep[] = [infoBtnTip, welcomeTip, mapTip, bossTip, visitedNodeTip, currentNodeTip, levelNodeTip, hiddenNodeTip, previewTip, skipNodeTip, shopNodeTip, bossNodeTip, boardTip, placementTip, spawnTip, programTip, enemyProgramTip, bpTip, controllerTip, maxsizeTip, movesTip, rangeTip, attackTip, defenceTip, actionsTip, moveBtnTip, atkBtnTip, specialBtnTip, securityTip, infamyTip, bossesTip, summaryTip, lossTip, shopTip, rerollTip, shopbpTip, shopItemTip, adminTip, adminsTip, playerInfoTip, nodePreviewTip, interestTip, rewardTip, inventoryTip, quickStatsTip];

export const proTipSuggestion: TutorialStep = {
    id: 'proTip',
    tooltip: 'Want some general gameplay hints?'
}
const defenderTip: TutorialStep = {
    id: 'defenderTip',
    tooltip: 'Always have a defensive or hidden program handy for nodes where you can be attacked immediately.'
}
const specialTip: TutorialStep = {
    id: 'specialTip',
    tooltip: 'Special moves will not trigger a retaliation from other pieces, even damaging ones.'
}
const damageMultTip: TutorialStep = {
    id: 'dmgmultTip',
    tooltip: 'Your damage mult will only apply to attacks, not to special moves that cause damage.'
}
const adminOrderTip: TutorialStep = {
    id: 'adminordertip',
    tooltip: 'Admin programs trigger left to right, so make sure you drag them into the optimum position.'
}
const lineSpecialsTipTip: TutorialStep = {
    id: 'lineSpecialsTip',
    tooltip: 'Special moves that target in a line can effect the same program more than once if the multiple tiles occupy the line.'
}
const hotkeysTip: TutorialStep = {
    id: 'hotkeysTip',
    tooltip: 'Hotkeys: A to attack, S for special move, D to deselect, Spacebar to end turn.'
}
const statusesTip: TutorialStep = {
    id: 'statusesTip',
    tooltip: 'Negative statuses take effect at the end of your turn, remove them before if you can.'
}
const slowedTip: TutorialStep = {
    id: 'slowedTip',
    tooltip: 'Out of moves? Frozen? If your program has a special move like "charge", you can use this to move for free.'
}
const hiddenNodesTip: TutorialStep = {
    id: 'hiddenNodeTip',
    tooltip: 'Hidden nodes can either be shops or altars when Security < 2. After this you might also find duplicators, workbenches, and hybrid compilers. Altars and shops are more common on the left path.'
}
const chargeTip: TutorialStep = {
    id: 'chargeTip',
    tooltip: "Be careful with your positioning against programs that can charge, cannon or laser. They may be able to damage twice if you are in a straight line in their range."
}

export const proTips: TutorialStep[] = [proTipSuggestion, defenderTip, specialTip, damageMultTip, adminOrderTip, lineSpecialsTipTip, hotkeysTip, statusesTip, slowedTip, hiddenNodesTip, chargeTip];