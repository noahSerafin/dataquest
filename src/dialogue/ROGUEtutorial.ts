export const tutorialDialogue = {
  "dialogueId": "rogueTutoriClippy",
  "startNode": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
      "nodeID": "load:node0Start",
      "elementID": "messaging-system",
      "speaker": "Clippy",
      "text": "Woah there! It looks like you are trying to play ROGUE mode. ROGUE mode is a set of randomised trials with an endless challenge, recommended only for the dedicated gamer. Would you like me to walk you through the basics?",
      "choices": [
        {
          "text": "Yes please",
          "nextNode": "node_2"
        },
        {
          "text": "Actually, I've done this before",
          "nextNode": "node_99"
        },
      ]
    },
    "node_2": {
      "id": "node_2",
      "elementID": "start",
      "speaker": "Clippy",
      "text": "The circuit represents a map of available nodes. You always start at the bottom of a circuit with a choice of paths to move forward. ROGUE maps will always have at least 2 nodes to clear before the shop node, followed by a boss node. Clearing the boss node will load the next ROGUE node map at a higher security level.",
      "choices": [
        {
          "text": "Got it.",
          "nextNode": "node_3"
        },
      ]
    },
    "node_3": {
      "id": "node_3",
      "elementID": "path_0_1",
      "speaker": "Clippy",
      "text": "Right now you are connected to a node with a bounty on it. You can see here the <span class='text-yellow'>reward (in $)</span>, the company logo, and the node's security level 🔒. Tougher nodes will typically have a higher reward for clearing them. Click here to bring up the node's preview.",
      "choices": []
    },
    "node_5": {
      "id": "node_5",
      "nodeID": "preview:path_0_1",
      "elementID": "preview-modal-path_0_1",
      "speaker": "Clippy",
      "text": "Here you can see some more details about the node, including a minimap of it's layout. Red squares indicate tiles occupied by the defending (enemy) programs. And green represent your entry points into the node.",
      "choices": [
        {
          "text": "Alright, what now?",
          "nextNode": "node_12"
        },
      ]
    },
    "node_12": {
      "id": "node_12",
      "speaker": "Clippy",
      "elementID": "enterNodeButton",
      "text": "Let's enter it and claim that bounty!",
      "choices": [
      ]
    },
    "node_13": {
      "id": "node_13",
      "speaker": "Clippy",
      "nodeID": "enter:path_0_1",
      "elementID": "piece-141ea35c-5b06-4f6c-9cbe-a93fd691db8f",
      "text": "Now we can see what we're up against. Click on that enemy piece to view it's stats.",
      "choices": [
      ]
    },
    "node_14": {
      "id": "node_14",
      "speaker": "Clippy",
      "nodeID": "click:piece-141ea35c-5b06-4f6c-9cbe-a93fd691db8f",
      "elementID": "141ea35c-5b06-4f6c-9cbe-a93fd691db8f-controller",
      "text": `This "Potato" program has a pretty even spread of stats. <span class='text-green'>Max size</span> determines how many tiles a program will take up when it moves, think of it like it's max health. <span class='text-blue'>Moves</span> is how many spaces it can move each turn. <span class='text-orange'>Range</span> is how far a program can target others for attacks or special moves. <span class='text-red'>Attack</span> is how many tiles a program can remove from another, and <span class='text-cyan'>Defence</span> is how much damage a program can absorb before losing tiles.`,
      "choices": [
        {
          "text": "Now what?",
          "nextNode": "node_15"
        },
      ]
    },
    "node_15": {
      "id": "node_15",
      "speaker": "Clippy",
      "elementID": "inventory",
      "text": "We load one of our own progams into the green spawn point. Here's your inventory, where you keep your programs and items, each will consume 1 memory (displayed at the top). You've been provided with some basic starting software. You can view their details by clicking on them.",
      "choices": [
        {
          "text": "How do I load them in?",
          "nextNode": "node_17"
        },
      ]
    },
    "node_17": {
      "id": "node_17",
      "speaker": "Clippy",
      "elementID": "piece-274ec329-8c17-4265-8c12-e9a28bcf0110",
      "text": "Click on or drag these Scissors to into one of the green load points ◻. Before clicking the load point ◻, you may cancel your placement at the top of the screen. Your turn will finish when you have used both load points. On future turns, you may move and action with your already loaded programs, or place another progam next to them.",
    },
    "node_1705": {
      "id": "node_17",
      "speaker": "Clippy",
      "nodeID": "click:piece-274ec329-8c17-4265-8c12-e9a28bcf0110",//or the other 2
      "elementID": "place-4-7",
      "text": "You'll notice at the top we are now loading your program, you may cancel if you want to load something else. Load it into the node here by clicking the green spawn point.",
    },
    "node_18": {
      "id": "node_18",
      "speaker": "Clippy",
      "nodeID": "place-4-7",
      "text": "Now we've placed your Scissors the enemy will start moving toward your programs. Fortunately, this Potato is pretty slow, and has limited range, so you weren't attacked. But always check if any enemy can attack you before you choose to load in a program.",
      "choices": [
        {
          "text": "Anything else?",
          "nextNode": "node_19"
        },
      ]
    },
    "node_1805": {
      "id": "node_1805",
      "speaker": "Clippy",
      "nodeID": "click:place-4-6",//or the other 2
      "text": "Now we've loaded one program in, but we still have another load point to use. The moment you use all the load points in a node, your turn will end and the enemy will start moving toward your programs.",
      "choices": [
        {
          "text": "Anything else?",
          "nextNode": "node_19"
        },
      ]
    },
    "node_19": {
      "id": "node_19",
      "speaker": "Clippy",
      "text": "Select your Scissors or Sling, move in range of the Potato using the arrow buttons. You'll notice programs grow up to their max size when moving. Attack the Potato using the attack button in the controller, or 'A' on the program itself. You can also use the 'A' key as a hotkey. Every program gets all of its moves each turn, as well as one action (an <span class='text-red'>attack</span> or <span class='text-yellow'>special function</span>).",
      "choices": [
        {
          "text": "What if I get stuck?",
          "nextNode": "node_20"
        }
      ]
    },
    "node_20": {
      "id": "node_20",
      "speaker": "Clippy",
      "elementID": "player-actions",
      "text": " If you're struggling, you can load in another program anywhere next to your to help corner the Potato and prevent it from moving, the shield's special move will be useful for this. You can also return to the map anytime using the forefeit button and try again, but this will cost you a life. Don't forget to end your turn once your programs are out of moves and actions.",
      "choices": [
        {
          "text": "Thanks",
        }
      ]
    },
    "node_21": {
      "id": "node_21",
      "nodeID": "path_0_1-summary",//change to id of round summary //have a different id for node failure
      "elementID": "path_0_1-summary",
      "speaker": "Clippy",
      "text": "Congrats on clearing your first node! Here you can see a breakdown of your rewards, indcluding earned interest. For every $5 you hold at the end of a round, you will earn $1 of interest, up to a maximum of $5 (if at least $25 is held). Click the proceed button to collect your interest and reward.",
      "choices": [
      ]
    },
    "node_22": {
      "id": "node_22",
      "nodeID": "clear:path_0_1",//"path_0_2",
      "elementID": "path_0_2",
      "speaker": "Clippy",
      "text": "Now you've cleared a node, your position has moved up, and you are now connected to a skip reward node. It will reward you with the item pictured. Skip nodes are normally followed by a harder security level 🔒 node, but here in the training ground it is placed in front of the shop. Click on it to see details about the reward.",
      "choices": [
      ]
    },
    "node_23": {
      "id": "node_23",
      "nodeID": "preview:path_0_2",
      "elementID": "preview-modal-path_0_2",
      "speaker": "Clippy",
      "text": "This Voucher will allow you to make an item in the upcoming shop completely free. I would suggest you use it on the most expensive thing",
      "choices": [
      ]
    },
    "node_99": {
      "id": "node_99",
      "speaker": "Clippy",
      "text": "Great! I'll let you roam freely. Good luck out there!",
    },
    "s0node_1": {
      "id": "s0node_1",
      "nodeID": "enter:shop",
      "speaker": "Clippy",
      "text": "At the shop, you can buy more programs. As well as single use consumable items, and admin programs.",
      "choices": [
        {
          "text": "What's an admin?",
          "nextNode": "s0node_2"
        },
        {
          "text": "What are consumables?",
          "nextNode": "s0node_3"
        },
        {
          "text": "Maybe later",
        }
      ]
    },
    "s0node_2": {
      "id": "shop_node_2",
      "speaker": "Clippy",
      "text": "Admins are programs that run passively in the background, they take up admin slots instead of inventory memory. You already have 2, and can currently hold up to 5. Depending on what triggers them, you will get different bonuses. Some might modify you programs when you load them, some might generate extra money from completed nodes, and some might drastically change the way programs behave.",
      "choices": [
        {
          "text": "What about consumables?",
          "nextNode": "s0node_3"
        },
        {
          "text": "Thanks",
        }
      ]
    },
    "s0node_3": {
      "id": "shop_node_3",
      "speaker": "Clippy",
      "text": "Consumables are single use pieces of software. They can either modify programs in your inventory, programs inside a node, or your own operating system, like increasing your current memory.",
      "choices": [
        {
          "text": "What about admins?",
          "nextNode": "s0node_2"
        },
        {
          "text": "Thanks",
        }
      ]
    },
    "node_6": {
      "id": "node_6",
      "speaker": "Clippy",
      "nodeID": "clear:shop",
      "elementID": "boss",//target the security level in top left
      "text": "This last node is a boss node. Boss nodes will have special effect inside that will add an extra challenge to clearing them. The effect will always be described on the map. Once you clear this node, a new map will load with a higher security level.",
      "choices": [
        {
          "text": "Tell me more about security levels",
          "nextNode": "node_76"
        },
        {
          "text": "Thanks, That's all for now"
        },
      ]
    },
    "node_76": {
      "id": "node_76",
      "speaker": "Clippy",
      "text": "Higher security levels will load larger nodes with rarer programs in them. Once you have cleared level 6, you have beaten the game, but can still continue in endless mode.",
      "choices": [
        {
          "text": "Endless mode?",
          "nextNode": "node_77"
        },
        {
          "text": "Thanks, That's all for now"
        },
      ]
    },
    "node_77": {
      "id": "node_77",
      "speaker": "Clippy",
      "text": "In endless mode, bosses will continue to stack every level. And programs of any rarity can appear, but lower ranked programs will be buffed to match the current security level.",
      "choices": [
        {
          "text": "Thanks, That's all for now"
        },
      ]
    },
  }
}