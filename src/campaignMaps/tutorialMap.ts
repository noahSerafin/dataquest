export const sector0 = {
  //base security
  //levels array
  //dialogue tree
  //background colours
  "nodes": {
    "node_g41ksufcp": {
      "id": "node_g41ksufcp",
      "type": "start",
      "position": {
        "x": 440,
        "y": 660
      },
      "next": [
        "node_km8bwjcq7"
      ],
      "difficultyMod": 0,
      "reward": 0,
      "pathOffsets": {
        "node_km8bwjcq7": {
          "x": 0,
          "y1": 0,
          "y2": 17
        }
      }
    },
    "node_km8bwjcq7": {
      "id": "node_km8bwjcq7",
      "type": "level",
      "position": {
        "x": 540,
        "y": 560
      },
      "next": [
        "node_svw51xvjh",
        "node_9wnsfvrt4"
      ],
      "difficultyMod": 1,
      "reward": 1,
      "company": "Saturn Solutions",
      "pathOffsets": {
        "node_svw51xvjh": {
          "x": 0,
          "ds1": 8,
          "ds2": 12
        }
      },
      "levelName": "TheArena"
    },
    "node_ltmmq2vo6": {
      "id": "node_ltmmq2vo6",
      "type": "level",
      "position": {
        "x": 400,
        "y": 120
      },
      "next": [
        "node_hb7dz8ll7"
      ],
      "difficultyMod": 1,
      "reward": 1,
      "company": "Saturn Solutions"
    },
    "node_c8d8kquy9": {
      "id": "node_c8d8kquy9",
      "type": "level",
      "position": {
        "x": 400,
        "y": 380
      },
      "next": [
        "node_ltmmq2vo6",
        "node_vx34hfayc"
      ],
      "difficultyMod": 2,
      "reward": 3,
      "company": "Nightbridge Corp",
      "pathOffsets": {
        "node_vx34hfayc": {
          "x": 0,
          "y1": -22,
          "y2": 0
        },
        "node_ltmmq2vo6": {
          "x": -56,
          "y1": 0,
          "y2": 0,
          "ds1": 17,
          "ds2": 16
        }
      },
      "levelName": "Castled"
    },
    "node_hb7dz8ll7": {
      "id": "node_hb7dz8ll7",
      "type": "level",
      "position": {
        "x": 580,
        "y": 120
      },
      "next": [
        "node_ysd75k5m7"
      ],
      "difficultyMod": 1,
      "reward": 1,
      "company": "Saturn Solutions"
    },
    "node_rxj93azy4": {
      "id": "node_rxj93azy4",
      "type": "level",
      "position": {
        "x": 840,
        "y": 380
      },
      "next": [
        "node_fsmb6r7an"
      ],
      "difficultyMod": 1,
      "reward": 1,
      "company": "Saturn Solutions",
      "pathOffsets": {
        "node_fsmb6r7an": {
          "x": 71,
          "y1": -5,
          "y2": 0,
          "ds1": 23,
          "ds2": 23
        }
      },
      "levelName": "The Alley"
    },
    "node_dl1mtdtzw": {
      "id": "node_dl1mtdtzw",
      "type": "level",
      "position": {
        "x": 580,
        "y": 220
      },
      "next": [
        "node_hb7dz8ll7",
        "node_5i9h9b6ti",
        "node_ysd75k5m7"
      ],
      "difficultyMod": 2,
      "reward": 1,
      "company": "Saturn Solutions",
      "pathOffsets": {
        "node_5i9h9b6ti": {
          "x": 0,
          "type": "VDHDV",
          "y": -24,
          "ds2": 11
        },
        "node_ysd75k5m7": {
          "x": 57,
          "y1": -21,
          "y2": 0
        }
      },
      "levelName": "The Gauntlet"
    },
    "node_ysd75k5m7": {
      "id": "node_ysd75k5m7",
      "type": "level",
      "position": {
        "x": 700,
        "y": 120
      },
      "next": [
        "node_5i9h9b6ti"
      ],
      "difficultyMod": 1,
      "reward": 1,
      "company": "Saturn Solutions",
      "pathOffsets": {
        "node_5i9h9b6ti": {
          "x": 73,
          "y1": 20,
          "y2": 0,
          "ds1": 25
        }
      },
      "levelName": "The Cave"
    },
    "node_fsmb6r7an": {
      "id": "node_fsmb6r7an",
      "type": "level",
      "position": {
        "x": 840,
        "y": 120
      },
      "next": [
        "node_ysd75k5m7"
      ],
      "difficultyMod": 1,
      "reward": 1,
      "company": "Saturn Solutions",
      "levelName": "The Penopticon"
    },
    "node_5i9h9b6ti": {
      "id": "node_5i9h9b6ti",
      "type": "boss",
      "position": {
        "x": 780,
        "y": 280
      },
      "next": [],
      "difficultyMod": 0,
      "reward": 0,
      "company": "Saturn Solutions",
      "bossName": "North Wind",
      "levelName": "The Arena"
    },
    "node_svw51xvjh": {
      "id": "node_svw51xvjh",
      "type": "skip",
      "position": {
        "x": 720,
        "y": 500
      },
      "next": [],
      "difficultyMod": 0,
      "reward": 0,
      "company": "Saturn Solutions",
      "skipContents": "Banana Peel"
    },
    "node_vx34hfayc": {
      "id": "node_vx34hfayc",
      "type": "skip",
      "position": {
        "x": 520,
        "y": 260
      },
      "next": [],
      "difficultyMod": 0,
      "reward": 0,
      "company": "Saturn Solutions",
      "skipContents": "Bucket"
    },
    "node_9wnsfvrt4": {
      "id": "node_9wnsfvrt4",
      "type": "shop",
      "position": {
        "x": 540,
        "y": 460
      },
      "next": [
        "node_dl1mtdtzw",
        "node_rxj93azy4",
        "node_c8d8kquy9"
      ],
      "difficultyMod": 0,
      "reward": 0,
      "company": "Saturn Solutions",
      "pathOffsets": {
        "node_rxj93azy4": {
          "x": 0,
          "type": "HDVDH",
          "y": -45,
          "x1": 15,
          "ds2": 14,
          "ds1": 11
        },
        "node_dl1mtdtzw": {
          "x": -19,
          "y1": 0,
          "y2": 0,
          "ds2": 9,
          "type": "VDHDV"
        },
        "node_c8d8kquy9": {
          "x": 0,
          "ds1": 10,
          "ds2": 7,
          "y2": 4,
          "y1": -3
        }
      },
      "shopContents": "Bee, Rat, Sling, Snail, TP, Blueberry, Iron, Juiced, Mushroom, Update, Candle, Chedda, Harvest, Notepad, Parachute"
    }
  },
  "startNode": "node_g41ksufcp"
}