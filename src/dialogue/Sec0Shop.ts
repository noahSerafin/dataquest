export const sec0ShopDialogue ={
  "dialogueId": "MerchantEncounterSec0",
  "startNode": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
      "speaker": "Hamuel",
      "text": "Welcome to the trainee shop! You can buy as many programs as you like. But items and admins are a one time purchase I'm afraid.",
      "choices": [
        {
          "text": "What's an admin?",
          "nextNode": "node_2"
        },
        {
          "text": "What's an item?",
          "nextNode": "node_3"
        },
        {
          "text": "Maybe later",
          "nextNode": "node_3"
        }
      ]
    },
    "node_2": {
      "id": "node_2",
      "speaker": "Hamuel",
      "text": "Al's clearly been slacking on the training! Admin progams are programs that run passively in the background, they take up admin slots instead of inventory memory, you can currently hold up to 4. Depending on what triggers them you will get different bonuses. Some might modify you programs when you load them, some might generate extra money from completed nodes, and some might drastically change the way programs behave.",
      "choices": [
        {
          "text": "What about items?",
          "nextNode": "node_3"
        },
      ]
    },
    "node_3": {
      "id": "node_3",
      "speaker": "Hamuel",
      "text": "Items are single use pieces of software that will either modify programs in your inventory, programs inside a node, or your own operating system like your current memory capacity.",
      "choices": [
        {
          "text": "What about admins?",
          "nextNode": "node_2"
        },
      ]
    }
  }
}