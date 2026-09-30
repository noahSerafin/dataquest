export const tutorialDialogue = {
  "dialogueId": "Tutorial",
  "startNode": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
      "nodeID": "load:node_g41ksufcp",
      "speaker": "Al",
      "text": "Hi there! Always exciting to have a new recruit. What you're seeing infront of you is our training enviroment. Use this space to learn the ropes of hacking before we send you out into cyberspace to collect some real bounties.",
      "choices": [
        {
          "text": "Sure",
          "nextNode": "node_2"
        },
        {
          "text": "Where do I start?",
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
      "speaker": "Al",
      "text": "The ciruit represent a map of available nodes. Here's your current position in this circuit. The blue wires indicate other nodes that can travel to",
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
      "speaker": "Al",
      "text": "Right now you are connected to a node with a bounty on it. Companies will issue bounties on nodes that they want their security tested on. You can see here the reward (in $), the company logo, and the node's security level 🔒. Tougher nodes will typically have a higher reward for cracking them.",
      "choices": [
      ]
    },
    "node_11": {
      "id": "node_11",
      "nodeID": "preview:node_km8bwjcq7",
      "elementID": "preview-modal-node_km8bwjcq7",
      "speaker": "Al",
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
      "speaker": "Al",
      "elementID": "enterNodeButton",
      "text": "Let's enter it and claim that bounty!",
      "choices": [
      ]
    },
    "node_13": {
      "id": "node_13",
      "speaker": "Al",
      "nodeID": "enter:node_km8bwjcq7",
      "elementID": "piece-141ea35c-5b06-4f6c-9cbe-a93fd691db8f",
      "text": "Now we can see what we're up against. Click on that enemy piece to view it's stats.",
      "choices": [
      ]
    },
    "node_14": {
      "id": "node_14",
      "speaker": "Al",
      "nodeID": "click:piece-141ea35c-5b06-4f6c-9cbe-a93fd691db8f",
      "elementID": "141ea35c-5b06-4f6c-9cbe-a93fd691db8f-controller",
      "text": "This guard program has a pretty even spread of stats. Max size determines how many tiles a program will take up when it moves, think of it like it's max health. Moves is how many spaces it can move each turn. Range is how far a program can target others for attacks or special moves. Attack is how many tiles a program can remove from another, and Defence is how much attack a program can absorb before losing tiles.",
      "choices": [
        {
          "text": "Now what?",
          "nextNode": "node_15"
        },
      ]
    },
    "node_15": {
      "id": "node_15",
      "speaker": "Al",
      "elementID": "inventory-btn",
      "text": "We load one of our own progams into the green spawn point. Let's open your inventory.",
      "choices": [
      ]
    },
    "node_16": {
      "id": "node_16",
      "speaker": "Al",
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
      "speaker": "Al",
      "elementID": "274ec329-8c17-4265-8c12-e9a28bcf0110",
      "text": "Your shield has 0 attack, so won't be very effective against that guard. I'd reccomend using the knife.",
    },
    "node_1705": {
      "id": "node_17",
      "speaker": "Al",
      "nodeID": "click:274ec329-8c17-4265-8c12-e9a28bcf0110",
      "elementID": "place-4-6",
      "text": "Now load it here by clicking the green spawn point. You can also drag programs over later.",
    },
    "node_18": {
      "id": "node_18",
      "speaker": "Al",
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
      "speaker": "Al",
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
      "speaker": "Al",
      "elementID": "player-actions",
      "text": "If your programs get deleted from the node, don't worry, they won't leave your inventory. You can return to the map anytime using the forefeit button and try again. I'll leave this one to you now, be in touch once you've cleared this node. Don't forget to end your turn once your programs are out of moves and actions.",
      "choices": [
        {
          "text": "Thanks",
        }
      ]
    },
    "node_21": {
      "id": "node_21",
      "speaker": "Al",
      "nodeID": "clear:node_km8bwjcq7",
      "elementID": "node_svw51xvjh",
      "text": "Congrats on your first bounty! There's a reward node here for you. Try entering it.",
    },
    "node_10": {
      "id": "node_10",
      "speaker": "Al",
      "nodeID": "click:node_svw51xvjh",
      "elementID": "accept-blueprint-button",
      "text": "The Banana Peel is a 'trap' program. This means it will load hidden into a node and is undetectable by enemy progams. But it will also be able to be moved over by other by other progams, which will instantly trigger it's special action, and remove it from the node. Hidden programs are useful for loading into nodes where you can be imediately attacked. Click 'Accept Reward' to claim it.",
    },
    "node_5": {
      "id": "node_5",
      "speaker": "Al",
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
        },
      ]
    },
    "node_6": {
      "id": "node_6",
      "speaker": "Al",
      "elementID": "node_9wnsfvrt4",
      "text": "That's a shop. It's run by another recruit, Hamuel. They'll let you know more when you visit.",
      "choices": [
        {
          "text": "What about the 🪦 in the top corner?",
          "nextNode": "node_7"
        },
        {
          "text": "Thanks, That's all for now",
        },
      ]
    },
    "node_7": {
      "id": "node_7",
      "speaker": "Al",
      "elementID": "node_mez50lbxk",
      "text": "That is an an altar node. It will let you sacrifice programs (remove them from your inventory) to gain money. You can always sell a program on the spot, but altars will give you a bit extra. Look out for more nodes of this shape in the future, they always have something interesting inside. But beware once you enter them, unlike shops you will not be able to again.",
      "choices": [
        {
          "text": "Thanks, That's all for now",
          "nextNode": "node_99"
        },
      ]
    },
    "node_99": {
      "id": "node_99",
      "speaker": "Al",
      "text": "Great! I'll let you roam freely for now. Good luck out there!",
    },
    "s0node_1": {
      "id": "s0node_1",
      "nodeID": "click:node_9wnsfvrt4",
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
      "text": "Al's clearly been slacking on the training! Admins are programs that run passively in the background, they take up admin slots instead of inventory memory. You can currently hold up to 4. Depending on what triggers them, you will get different bonuses. Some might modify you programs when you load them, some might generate extra money from completed nodes, and some might drastically change the way programs behave.",
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