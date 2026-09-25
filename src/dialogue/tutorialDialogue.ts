export const tutorialDialogue ={
  "dialogueId": "MerchantEncounter",
  "startNode": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
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
      "speaker": "Al",
      "text": "Here's your current position in this circuit. The blue wires indicate other nodes that can travel to",
      "choices": [
        {
          "text": "Got it.",
          "nextNode": "node_3"
        },
      ]
    },
    "node_3": {
      "id": "node_3",
      "speaker": "Al",
      "text": "This is a node with a bounty on it. Companies will issue bounties on nodes that they want their security tested on. You can see here the reward (in $), the company logo, and the node's security level 🔒. Tougher nodes will typically have a higher reward for cracking them.",
      "choices": [
      ]
    },
    "node_11": {
      "id": "node_11",
      "speaker": "Al",
      "text":  "Here you can see some more details about the node, including a minimap of it's layout. Red squares indicate tiles occupied by the defending (enemy) programs. And green represent your entry points into the node.",
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
      "text": "Let's enter it and claim that bounty!",
      "choices": [
      ]
    },
    "node_13": {
      "id": "node_13",
      "speaker": "Al",
      "text": "Now we can see what we're up against. Click on that enemy piece to view it's stats.",
      "choices": [
      ]
    },
    "node_14": {
      "id": "node_14",
      "speaker": "Al",
      "text": "This guard program has a pretty even spread of stats. Max size determines how many tiles a program can take up, think of it like it's max health. Moves is how many spaces it can move each turn, moving will add tiles to the program until it reaches it's max size. Range is how far a program can target others for attacks or special moves. Attack is how many tiles a program can remove from another, and Defence is how much attack a program can absorb before losing tiles.",
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
      "text": "We load one of our own progams into the green spawn point. Let's open your inventory.",
      "choices": [
      ]
    },
    "node_16": {
      "id": "node_16",
      "speaker": "Al",
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
      "text": "Your shield has 0 attack, so won't be very effective against that guard. I'd reccomend using the knife, select it and then load it into the spawn point, or drag it over.",
      "choices": [
      ]
    },
    "node_18": {
      "id": "node_18",
      "speaker": "Al",
      "text": "The moment you use all the spawn points in a node, the enemy will start moving toward your programs. Fortunately, this guard is pretty slow, and has limited range. So your knife was not attacked. Always check if any enemy can attack you before you choose to load in a program.",
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
      "text": "If your programs get deleted from the node, don't worry, they won't leave your inventory. You can return to the map anytime using the forefeit button and try again. I'll leave this one to you now, be in touch once you've cleared this node.",
      "choices": [
        {
          "text": "Thanks",
          "nextNode": "node_4"
        }
      ]
    },
    "node_21": {
      "id": "node_21",
      "speaker": "Al",
      "text": "Congrats on your first bounty! I've placed a bonus node here for you.",
      "choices": [
        {
          "text": "What is it?",
        }
      ]
    },
    "node_4": {
      "id": "node_4",
      "speaker": "Al",
      "text": "This is a reward node. They will normally be located toward the edges of a circuit as an extra incentive, but we've put this one here as a demonstration, try entering it.",
      "choices": [
      ]
    },
    "node_10": {
      "id": "node_10",
      "speaker": "",
      "text": "The banana is a 'trap' program. This means it will load hidden into a node and is undetectable by enemy progams. But it will also be able to be moved over by other by other progams, which will instantly trigger it's special action, and remove it from the node. Click 'Accept' to claim it.",
      "choices": [
        {
          "text": "Thanks, any more nodes I should know about?",
          "nextNode": "node_5"
        }
      ]
    },
    "node_5": {
      "id": "node_5",
      "speaker": "Al",
      "text": "Most importantly, the big one. This is the boss node. Boss nodes will have special effect inside that will add an extra challenge to clearing them. Once you clear this node, you've passed your training and can move out into the wild.",
      "choices": [
        {
          "text": "What about the 🛒 right ahead?",
          "nextNode": "node_6"
        },
        {
          "text": "What about 🪦 smaller one in the top corner?",
          "nextNode": "node_7"
        },
        {
          "text": "Thanks, That's all for now",
        },
      ]
    },
    "node_6": {
      "id": "node_6",
      "speaker": "Al",
      "text": "That's a shop. It's run by Hamuel, good guy. They'll let you know more when you visit.",
      "choices": [
        {
          "text": "What about the 🪦 in the top corner?",
          "nextNode": "node_7"
        },
      ]
    },
    "node_7": {
      "id": "node_7",
      "speaker": "Al",
      "text": "That is an an altar node. It will let you sacrifice programs (remove them from your inventory) to gain money. You can always sell a program on the spot, but altars will give you a bit extra. Look out for more nodes of this shape in the future, they always have something interesting inside. But beware once you enter them, unlike shops you will not be able to again.",
      "choices": [
        {
          "text": "What about the 🛒 ahead?",
          "nextNode": "node_6"
        },
      ]
    },
  }
}