export const tutorialDialogue = {
  "dialogueId": "rogueTutoriClippy",
  "startNode": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
      "nodeID": "load:node0Start",
      "elementID": "messaging-system",
      "speaker": "Clippy",
      "text": "Woah there! It looks like you are trying to play ROGUE mode. ROGUE mode is a set of randomised trials with an endless challenge, and recommended only for the dedicated gamer. Would you like me to walk you through the basics?",
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
      "elementID": "node_g41ksufcp",
      "speaker": "Clippy",
      "text": "The circuit represents a map of available nodes. You always start at the bottom of a circuit with a choice of paths to move forward. ROGUE maps will always have at 2 nodes clear before the shop node, followed by a boss node. Clearing the boss node will load the next ROGUE node map.",
      "choices": [
        {
          "text": "Got it.",
          "nextNode": "node_3"
        },
      ]
    },
    "node_3": {
      "id": "node_3",
      "elementID": "node_km8bwjcq7",
      "speaker": "Clippy",
      "text": "Right now you are connected to a node with a bounty on it. You can see here the <span class='text-yellow'>reward (in $)</span>, the company logo, and the node's security level 🔒. Tougher nodes will typically have a higher reward for clearing them. Click here to bring up the node's preview.",
      "choices": [
         {
          "text":"What about the other node?",
          "nextNode": "node_4"
         }
      ]
    },
    "node_4": {
      "id": "node_4",
      "nodeID": "preview:node_km8bwjcq7",
      "elementID": "preview-modal-node_km8bwjcq7",
      "speaker": "Clippy",
      "text": "This is a skip reward node. It will reward you with the item pictured, and you will have to clear the node after it on this path. Skip nodes are normally followed by a harder security level 🔒 node, but occaisonally there will be a paths that cross the branches of nodes.",
      "choices": [
        {
          "text": "Alright, what now?",
          "nextNode": "node_12"
        },
      ]
    },
    "node_5": {
      "id": "node_5",
      "nodeID": "preview:node_km8bwjcq7",
      "elementID": "preview-modal-node_km8bwjcq7",
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
      "nodeID": "enter:node_km8bwjcq7",
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
      "text": "This guard program has a pretty even spread of stats. <span class='text-green'>Max size</span> determines how many tiles a program will take up when it moves, think of it like it's max health. <span class='text-blue'>Moves</span> is how many spaces it can move each turn. <span class='text-orange'>Range</span> is how far a program can target others for attacks or special moves. <span class='text-red'>Attack</span> is how many tiles a program can remove from another, and <span class='text-cyan'>Defence</span> is how much damage a program can absorb before losing tiles.",
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
      "elementID": "inventory-btn",
      "text": "We load one of our own progams into the green spawn point. Let's open your inventory.",
      "choices": [
      ]
    },
    "node_16": {
      "id": "node_16",
      "speaker": "Clippy",
      "nodeID": "click:inventory-btn",
      "elementID": "inventory",
      "text": "This is where you keep your programs and items, each one will consume memory (displayed at the top). We've provided you with some basic starting software. You can view their details by clicking on them.",
      "choices": [
        {
          "text": "Which program should I use?",
          "nextNode": "node_17"
        },
      ]
    },
    "node_17": {
      "id": "node_17",
      "speaker": "Clippy",
      "elementID": "274ec329-8c17-4265-8c12-e9a28bcf0110",
      "text": "Your Shield has 0 <span class='text-red'>attack</span>, so won't be very effective against that guard. And your sling does 1 damage, which also won't be able to break the guard's <span class='text-cyan'>defence</span>. I'd reccomend using the Knife.",
    },
    "node_1705": {
      "id": "node_17",
      "speaker": "Clippy",
      "nodeID": "click:274ec329-8c17-4265-8c12-e9a28bcf0110",
      "elementID": "place-4-6",
      "text": "You'll notice at the top we are now loading your Knife program. Load it into the node here by clicking the green spawn point. You can also drag programs over later.",
    },
    "node_18": {
      "id": "node_18",
      "speaker": "Clippy",
      "nodeID": "place-4-6",
      "text": "The moment you use all the spawn points in a node, the enemy will start moving toward your programs. Fortunately, this guard is pretty slow, and has limited range. So your knife was not attacked. But always check if any enemy can attack you before you choose to load in a program.",
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
      "text": "Select your knife, move towards the guard and attack it. Every program gets all of its moves each turn, as well as one action (attack or special function). You might find this guard hard to finish off with your knife's current stats. But try and force it into a corner to stop it getting it's tiles back. If you're struggling, you can load in your shield anywhere next to your knife to help corner the guard.",
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
      "text": "If your programs get deleted from the node, don't worry, they won't leave your inventory. You can return to the map anytime using the forefeit button and try again. <br></br> I'll leave this one to you now, be in touch once you've cleared this node. Don't forget to end your turn once your programs are out of moves and actions.",
      "choices": [
        {
          "text": "Thanks",
        }
      ]
    },
    "node_6": {
      "id": "node_6",
      "speaker": "Clippy",
      "nodeID": "click:accept-blueprint-button",
      "elementID": "node_5i9h9b6ti",
      "text": "One more node type you should know about, this is a boss node. Boss nodes will have special effect inside that will add an extra challenge to clearing them. Once you clear this node, you've passed your training and can move out into the rest of cyberspace.",
      "choices": [
        {
          "text": "What about the 🛒 ahead?",
          "nextNode": "node_6"
        },
        {
          "text": "Thanks, That's all for now",
          "nextNode": "node_99"
        },
      ]
    },
    "node_99": {
      "id": "node_99",
      "speaker": "Clippy",
      "text": "Great! I'll let you roam freely for now. Good luck out there!",
    },
    "s0node_1": {
      "id": "s0node_1",
      "nodeID": "enter:node_9wnsfvrt4",
      "speaker": "Hamuel",
      "text": "Welcome to the trainee shop! You can buy as many programs as you like. But consumables and admins are a one time purchase I'm afraid.",
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
      "id": "s0node_2",
      "speaker": "Hamuel",
      "text": "Admins are programs that run passively in the background, they take up admin slots instead of inventory memory. You can currently hold up to 4. Depending on what triggers them, you will get different bonuses. Some might modify you programs when you load them, some might generate extra money from completed nodes, and some might drastically change the way programs behave.",
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
      "id": "s0node_3",
      "speaker": "Hamuel",
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
    }
  }
}