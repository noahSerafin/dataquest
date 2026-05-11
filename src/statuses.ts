export const STATUS_ICONS: Record<string, string> = {
  diseased: "🤮",    // U+1F92E
  slowed: "😰",      // U+1F630
  blinded: "😵",     // U+1F635
  burning: "🥵",     // U+1F975
  poisoned: "🤢",    // U+1F922
  frozen: "🥶",      // U+1F976
  charmed: "😍",     // U+1F60D
  confused: "🤕",    // U+1F915 // SHAKING FACE, U+1FAE8 //DIZZY SYMBOL, U+1F4AB
  exposed: "🫣",
  hidden: "🤫",      // U+1F92B
  negative: "🫥",    // U+1FAE5
  enraged: "💢",     // ANGER SYMBOL, U+1F4A2
  zen: "😌", //U+1F60C
  disarmed: "🤐", //U+1F910
};

export const STATUS_INFO: Record<string, string> = {
  diseased: "Lose -1 max size every turn",
  slowed: "Moves reduced -1 every turn",
  blinded: 'Lose -1 range every turn',
  burning: 'Lose 1 tile every turn',
  poisoned: 'Lose -1 defence every tun',
  frozen: 'Moves remaining are set to 0',
  charmed: 'Is controlled by the opposition',
  confused: 'Moves are randomised',
  exposed: 'Can no longer hide.',
  hidden: 'Invisible to enemies until next move or action.',
  negative: "Can move through other programs",
  enraged: "Gains +1 attack on the start of it's turn",
  zen: "Temporary +1 to all stats",
  disarmed: "Has no actions for one turn",
};

// 🫨 SHAKING FACE, U+1FAE8

export const STATUS_COLORS: Record<string, string> = {
  diseased: "#aaff00",
  slowed: "#00aaff",
  blinded: "#888888",
  burning: "#ff4400",
  poisoned: "#00ff00",
  frozen: "#00ffff",
  charmed: "#ff00ff",
  confused: "#ffff00",
  exposed: "#ffffff",
  hidden: "#aaaaaa",
  negative: "#444444",
  enraged: "#ff0000",
  zen: "#ffcc00",
  disarmed: "#ff9900",
};