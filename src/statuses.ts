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
  diseased: "Loses -1 max size every turn",
  slowed: "Moves reduced -1 every turn",
  blinded: 'Loses -1 range every turn',
  burning: 'Loses 1 tile every turn',
  poisoned: 'Loses 1 defence every tun',
  frozen: 'Moves set to 0',
  charmed: 'Is controlled by the opposition',
  confused: 'Moves randomly.',
  exposed: 'Can no longer hide.',
  hidden: 'Invisible to enemies until next move or action.',
  negative: "Can move through other programs",
  enraged: "Gains +1 attack on the start of it's turn",
  zen: "Temporary +1 to all stats",
  disarmed: "Has no actions for one turn",
};

// 🫨 SHAKING FACE, U+1FAE8