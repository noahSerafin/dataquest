//OSes
/* Your starting setup, determines starting money, memory(inventory space), lives, programs, items, and admins.

MAP
Choose your path forward, there will always be an easy path to the left with two nodes(levels) at your currently security level(difficulty).
Alternatively, there may also be a harder path with greater rewards, an option receive a free program/item followed by a harder level, or other hidden rewards on a harder path.
Locks indicates difficulty of level. Rarer, higher level enemy programs spawn at higher difficulties.
The preview will show you the layout of the level and the starting spawn points, red for enemies, blue for the player.

NODES
The aim of the game is to get rid of all enemy programs (outlined in red) on a node. You lose if the enemy ends a turn when you have no programs in the node.
Once entering a node, you will be able to see what enemy programs you are up against, click on them to see their stats.
Start by placing a program in the node, either by dragging into the green spawn point or using the place button then clicking on the spawn.
Be aware, you won't be able to move your program until after the enemy's turn, so make sure you're not going to be destroyed straight away.
On each turn, you may either place a new program next to one of your own, or move your already placed programs.
If you clear the node but the round doesn't finish, there's probably still a 'hidden' enemy program in play, either a trap, or one that can hide itself such as a ghost or ninja. I might add something that reveals these if they're all that's left as it does get annoying on larger maps.

SHOP
At the shop, you can buy new programs (P), new Admin prgrams (A), or consumable items (I)
There are 6 tiers of rarity, each becoming rarer in the shop the higher the tier.
You can reroll the shop for a price, the cost will exponentially increase with each reroll, but resets at each shop.

ADMINS
Admins' effects are passive, and have different triggers. Admins with the same trigger will activate left to right in the order you place them in your admin panel, you can drag to move these around.

ITEMS
All items are consumable, and each take up 1 memory in your inventory, a resource shared with programs.
Some items can be used on programs in your inventory to permanently boost their stats, others give temporary boosts to programs already placed in a node, some will effect every program in a node at once.

Programs
Programs also take up 1 memory in your inventory.
Some programs have special moves, click on them to see what they are. You can drag a program's descriptive window around.
Programs have different stats: 
    Max size: Maximum size  a program can reach, essentially it's max HP.
    Moves: How many spaces a program can move each turn.
    Range: The orthagonal distance a program can target attacks or it's special move.
    Attack: How much damage a program will do to another on attacking.
    Defence: How much damage a program can take before losing tiles. Like moves, this resets each turn.

BOSSES
Bosses act like admins for the enemy, they may boost enemy stats, nerf yours, or add some other challenging effect to a node.
On defeating a boss, the security level of all future nodes will increase by one.
After defeating a level 6 Boss, you win the game. You can still proceed into endless mode if you wish, where bosses are no longer removed after each securuity level.

SECURITY (difficulty)
At higher security levels, rarer pieces will start spawning as enemies, and variants are more likely to appear, as well as more powerful variants.
Harder boss admins may also appear at higher security levels.
In endless mode, new bosses persist into following rounds, and enemy variants become commonplace.

//TIPS
Always have a defensive program handy for nodes where you can be attacked immediately.
Special moves will not trigger a retaliation from other pieces, even damaging ones.
Your damage mult will only apply to attacks, not to special moves that cause damage.
Admin programs trigger left to right, so make sure you drag them into the optimum position.
Special moves that target in a line can effect the same program more than once if the multiple tiles occupy the line.

OTHER NOTES
There are still some bugs and balancing issues to be fixed. Please let me know what you find, preferably with a screenshot.
If you have any thoughts about potential changes or additions I would love to hear them.
To save making artwork everything has been done with unicodes, which is where most of the ideas have sprouted from.
If you want to browse for inspiration to contribute any ideas: http://xahlee.info/comp/unicode_index.html?q=

PLANNED CHANGES (motes for me really, you can ignore these)
The nodes are decorated with fake 'companies', that at the moment have no effect on the game. But I plan to have them use specific pools of enemy programs/variants in future.
The balance of attack/defence is still something I'm figuring out, in some rare situations its possible to get stuck if one enemy's defence is higher than your combined programs' attack.
Maybe defence should not restore each turn, and add a 'fortify' action that restores a programs' defence...
*/