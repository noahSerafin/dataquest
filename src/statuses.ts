export const statusData = {
  diseased: { icon: '🤮', description:"Loses -1 max size every turn"},
  slowed:   { icon: '😰', description: "Moves reduced -1 every turn"},
  blinded:  { icon: '😵', description: 'Loses -1 range every turn'},
  burning:  { icon: '🥵', description: 'Loses 1 tile every turn'},
  poisoned: { icon: '🤢', description: 'Loses 1 defence every tun'},
  frozen:   { icon: '🥶', description: 'Moves set to 0'},
  charmed:  { icon: '😍', description: 'Is controlled by the opposition'},
  confused: { icon: '🤕', description: 'Moves randomly.'},
  hidden:   { icon: '🤫', description: 'Invisible to enemies until next move or action.'},
  negative: { icon: '🫥', description: "Can move through other programs"},
} as const;