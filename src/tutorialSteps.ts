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
    tooltip: 'This is the Node map. Choose your path forward, there will always be an easier path to the left with two nodes at your currently security level(difficulty). Alternatively, there may also be a harder path with greater rewards, an option receive a free program or item followed by a harder level, or other hidden rewards along it.'
}
const currentNodeTip: TutorialStep = {
    id: 'current',
    tooltip: 'Your current position in cyberspace.'
}
const levelNodeTip: TutorialStep = {
    id: 'levelNode',
    tooltip: 'This is a privately controlled node, the title and picture show us what company it is owned by. The dollar amount below is the reward for clearing this node. The lock number indicates security level of a Node. Rarer, higher level enemy programs appear at higher difficulties. Click to see the preview.'
}
const previewTip: TutorialStep = {
    id: 'preview-modal',
    tooltip: 'The preview shows you the layout of the level and the starting spawn points, red for enemies, blue for the player.'
}
const skipNodeTip: TutorialStep = {
    id: 'skipNode',
    tooltip: 'Choosing this node will reward you with the pictured program/item. Click to see the details.'
}
const shopNodeTip: TutorialStep = {
    id: 'shopNode',
    tooltip: 'This node is a shop where you can purchase new programs, admins, and consumable items.'
}
const bossTip: TutorialStep = {
    id: 'item-boss',
    tooltip: "This is an active boss, click on it to read it's effect. Defeating it will load a new node map, and raise the security level of all future nodes by one."
}
const bossNodeTip: TutorialStep = {
    id: 'bossNode',
    tooltip: "This is the boss for this security level, it's effects are described on the right. Bosses act like admins for the enemy, they may boost enemy stats, nerf yours, or add some other challenging effect to a node. Beating it will load a new node map, and raise the security level of all future nodes by one."
}
const boardTip: TutorialStep = {
    id: "board",
    tooltip: "Now we're inside a Node. Your job is to clear all the enemy programs from it using your own programs. You may load your programs into the green tiles initially. Once you have a program down, you may load in next to any tile it occupies. Be careful, once you load a program in, the enemy programs will take their move, so don't place anything vunerable too close to an enemy. Each turn, you may either load a new program or move your programs already inside the node. If all your loaded programs are cleared from a node, you will lose a life."
}
const programTip: TutorialStep = {
    id: 'piece',
    tooltip: "This a loaded program, click on it to see it's stats"
}
const bpTip: TutorialStep = {
    id: 'blueprint',
    tooltip: "You own this program, click on it to see it's stats. After entering a node, select or drag it into the node to load it."
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
    tooltip: "Higher infamy will add extra challenges on top of your security, you raise this before starting a run."
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
const shopbpTip: TutorialStep = {
    id: 'shop-piece',
    tooltip: 'Purchase this program to add it to your inventory if you have 1 free space of memory.',
}
const shopItemTip: TutorialStep = {
    id: 'item-consumable',
    tooltip: "This is a consumable item, it takes up 1 memory in your inventory and can only be used once.",
}
const itemTip: TutorialStep = {
    id: 'item-inventory',
    tooltip: 'This is a consumable item, select a piece to use it on.',
}
const adminTip: TutorialStep = {
    id: 'item-admin',
    tooltip: 'This is an admin, it takes up an admin slot and will provide passive benefits when it is triggered.',
}
const adminsTip: TutorialStep = {
    id: 'admins',
    tooltip: 'This is where your admins are kept. Admins with the same trigger will execute their effects left to right, you can drag the order around here.',
}
const playerInfoTip: TutorialStep = {
    id: 'player-info',
    tooltip: "This section shows your current money and remaining lives.",
}
const invBtnTip: TutorialStep = {
    id: 'inv-btn',
    tooltip: "Click here to toggle your inventory.",
}
const inventoryTip: TutorialStep = {
    id: 'inventory',
    tooltip: "This is your inventory. You have a limited amount of memory, which programs and items will each take up 1 space of.",
}
const nodePreviewTip: TutorialStep = {
    id: 'map-wrapper',
    tooltip: "This preview shows your starting load point in green, and the enemies in red.",
}
const interestTip: TutorialStep = {
    id: 'interest-summary',
    tooltip: "You will earn an extra $1 for every $5 you have at the end of each round, up to the maximum interest, which is $5 by default.",
}
export const allTips: TutorialStep[] = [welcomeTip, mapTip, bossTip, currentNodeTip, levelNodeTip, previewTip, skipNodeTip, shopNodeTip, bossNodeTip, boardTip, programTip, bpTip, controllerTip, maxsizeTip, movesTip, rangeTip, attackTip, defenceTip, actionsTip, moveBtnTip, atkBtnTip, specialBtnTip, securityTip, infamyTip, bossesTip, summaryTip, lossTip, shopTip, shopbpTip, shopItemTip, adminTip, adminsTip, itemTip, playerInfoTip, nodePreviewTip, interestTip, inventoryTip, invBtnTip];
/*
const Tip: TutorialStep = {
    id: '',
    tooltip: '',
}
Always have a defensive program handy for nodes where you can be attacked immediately.
Special moves will not trigger a retaliation from other pieces, even damaging ones.
Your damage mult will only apply to attacks, not to special moves that cause damage.
Admin programs trigger left to right, so make sure you drag them into the optimum position.
Special moves that target in a line can effect the same program more than once if the multiple tiles occupy the line.
*/