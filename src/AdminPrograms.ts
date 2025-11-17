import { Item } from "./Items";
import { Piece } from "./Pieces";

export class Admin extends Item {
  isConsumedOnUse = false;
  //actions: number
}

export class Meteor extends Admin {
  static name = "Meteor Shower";
  static description = "Deals 3 damage to every enemy piece";
  static unicode = "☄️";
  static color = "#000000ff";

  constructor() {
    super(Meteor.name, Meteor.description, Meteor.unicode, Meteor.color, 10, 4)
  }

  activate({ activePieces }: { activePieces: Piece[] }) {
    for (const p of activePieces) p.takeDamage(3);
  }
}

export class Angel extends Admin {
  static name = "Angel";
  static description = "Ressurect a deleted piece";
  static unicode = "U+1FABD";
  static color = "#a8a8a8ff";

  constructor() {
    super(Angel.name, Angel.description, Angel.unicode, Angel.color, 10, 5)
  }
  //acces graveyard
}

export class Stopwatch extends Admin {
  static name = "Stopwatch";
  static description = "Replenish all pieces moves and actions";
  static unicode = "U+23F1";
  static color = "#ff5555";

  constructor() {
    super(Stopwatch.name, Stopwatch.description, Stopwatch.unicode, Stopwatch.color, 10, 5)
  }
  //
}

export class Miner extends Admin {
  static name = "Miner";
  static description = "Collect $5 every round";
  static unicode = "U+26CF";
  static color = "#ffa600d3";

  constructor() {
    super(Miner.name, Miner.description, Miner.unicode, Miner.color, 10, 3)
  }
  //
}

export class Bubble extends Admin {
  static name = "Bubble";
  static description = "Increases interest by 1 every round, 10% chance to pop and reduce money to 0";
  static unicode = "U+1FAE7";
  static color = "#0400daff";

  constructor() {
    super(Bubble.name, Bubble.description, Bubble.unicode, Bubble.color, 10, 2)
  }
  //
}

export class Crystal extends Admin {
  static name = "Crystal Ball";
  static description = "See the next shop or level in advance";
  static unicode = "U+1F52E";
  static color = "#4b003bff";

  constructor() {
    super(Crystal.name, Crystal.description, Crystal.unicode, Crystal.color, 10, 5)
  }
  //
}

export class Clover extends Admin {
  static name = "Lucky Clover";
  static description = "Raises chance of rarer items appearing";
  static unicode = "U+1F340";
  static color = "#00ff0dff";

  constructor() {
    super(Clover.name, Clover.description, Clover.unicode, Clover.color, 10, 5)
  }
  //interact with shop
}

export class Onion extends Admin {
  static name = "Onion";
  static description = "An extra layer of defence, saves you from one lost round but is destroyed in the process.";
  static unicode = "U+1F9C5";
  static color = "#00af17ad";

  constructor() {
    super(Onion.name, Onion.description, Onion.unicode, Onion.color, 10, 5)
  }
  //
}
//name desc utf || maxsize moves range atk def
export class Blood extends Admin {
  static name = "Blood Tax";
  static description = "Each time damage is dealt earns $1";
  static unicode = "U+1FA78";
  static color = "#790000ff";

  constructor() {
    super(Blood.name, Blood.description, Blood.unicode, Blood.color, 10, 5)
  }
  //
}

export class BionicArm extends Admin {
  static name = "Bionic Arms";
  static description = "Raises all program's attack by 1";
  static unicode = "U+1F9BE";
  static color = "#ff4040ff";

  constructor() {
    super(BionicArm.name, BionicArm.description, BionicArm.unicode, BionicArm.color, 10, 5)
  }
  //
}

export class BionicLeg extends Admin {
  static name = "Bionic Legs";
  static description = "Raises all program's moves by 1";
  static unicode = "U+1F9BF";
  static color = "#d240ffff";

  constructor() {
    super(BionicLeg.name, BionicLeg.description, BionicLeg.unicode, BionicLeg.color, 10, 5)
  }
  //
}

export class Convenience extends Admin {
  static name = "Convenience Store";
  static description = "Open the shop any time";
  static unicode = "U+1F3EA";
  static color = "#55ff71ff";

  constructor() {
    super(Convenience.name, Convenience.description, Convenience.unicode, Convenience.color, 10, 2)
  }
  //
}

export class Department extends Admin {
  static name = "Department Store";
  static description = "1 free reroll every shop";
  static unicode = "U+1F3EC";
  static color = "#bebebeff";

  constructor() {
    super(Department.name, Department.description, Department.unicode, Department.color, 10, 2)
  }
  //
}

export class Eye extends Admin {
  static name = "Evil Eye";
  static description = "Mark any program to lower it's defence";
  static unicode = "U+1F9FF";
  static color = "#020072ff";

  constructor() {
    super(Eye.name, Eye.description, Eye.unicode, Eye.color, 10, 3)
  }
  //// NAZAR AMULET, U+1F9FF 
}

export class Sol extends Admin {
  static name = "Sol";
  static description = "Deal 9 damage to any target";
  static unicode = "U+1F6F0";
  static color = "#000000ff";

  constructor() {
    super(Sol.name, Sol.description, Sol.unicode, Sol.color, 10, 5)
  }
  //
}

//Daemon
//IMP, U+1F47F

//passive programs


//EUROPEAN CASTLE, U+1F3F0

//JAPANESE CASTLE, U+1F3EF

//clippy - provides hints
//PAPERCLIP, U+1F4CE

//FISHING POLE AND FISH, U+1F3A3

//8ball  BILLIARDS, U+1F3B1

//BOUQUET, U+1F490 reappering pieces

//LEFT-POINTING MAGNIFYING GLASS, U+1F50D
// //reveal secrets

// HEART WITH ARROW, U+1F498

//GREEK SMALL LETTER PI, U+3C0

//HAMSA, U+1FAAC hand with eye

//SATELLITE, U+1F6F0 //orbital laser
//SATELLITE ANTENNA, U+1F4E1

//copier - copy a program
//EMPTY NOTE PAD, U+1F5C7 increase memory

//SAFETY VEST, U+1F9BA

//PAPERCLIP, U+1F4CE
// PUSHPIN, U+1F4CC

// CREDIT CARD, U+1F4B3

// WORLD MAP, U+1F5FA
// golden TICKET, U+1F3AB

// PERFORMING ARTS, U+1F3AD

// SEWING NEEDLE, U+1FAA1

// LOCK, U+1F512

// PETRI DISH, U+1F9EB
// TEST TUBE, U+1F9EA

//JIGSAW PUZZLE PIECE, U+1F9E9

//hex SOFTWARE-FUNCTION SYMBOL, U+2394

//BENZENE RING, U+232C

//MAGE, U+1F9D9
//NINJA, U+1F977
//FAIRY, U+1F9DA
// BABY ANGEL, U+1F47C
// GENIE, U+1F9DE //create three pieces
//JAPANESE GOBLIN, U+1F47A
// JAPANESE OGRE, U+1F479
//EXTRATERRESTRIAL ALIEN, U+1F47D
//space invaders ALIEN MONSTER, U+1F47E
//MONEY-MOUTH FACE, U+1F911

// AUTOMATED TELLER MACHINE, U+1F3E7
// SNOWFLAKE, U+2744
//AI TRACKBALL, U+1F5B2
// WHALE, U+1F40B
//CANDLE, U+1F56F
 // ELECTRIC TORCH, U+1F526
 //CLOUD, U+2601
 // WIND BLOWING FACE, U+1F32C

 // MONEY BAG, U+1F4B0
 //BANKNOTE WITH DOLLAR SIGN, U+1F4B5

// /MIRROR, U+1FA9E

//HELICOPTER, U+1F681

//SEWING NEEDLE, U+1FAA1

// BRAIN, U+1F9E0
// ANATOMICAL HEART, U+1FAC0
//LUNGS, U+1FAC1

// ICE CUBE, U+1F9CA


//BLACK CHESS KNIGHT, U+265E
//TURNED BLACK SHOGI PIECE, U+26CA //black shield 

// / DOOR, U+1F6AA

//FACTORY, U+1F3ED

//BANK, U+1F3E6

//CLASSICAL BUILDING, U+

//BUILDING CONSTRUCTION, U+1F3D7 crane

//8ball BILLIARDS, U+1F3B1

//SLOT MACHINE, U+1F3B0

//LINK SYMBOL, U+1F517

//BLACK SPADE SUIT, U+2660

//JIGSAW PUZZLE PIECE, U+1F9E9

// PLAYING CARD BLACK JOKER, U+1F0CF

// MILKY WAY, U+1F30C

// GARLIC, U+1F9C4

// MUSHROOM, U+1F344

// VAMPIRE, U+1F9DB

//TEST TUBE, U+1F9EA

//stag
// LINEAR B IDEOGRAM B104 DEER, U+10082

//RUNIC LETTER RAIDO RAD REID R, U+16B1

// MOYAI, U+1F5FF MAOI

//horse
//LINEAR B IDEOGRAM B105 EQUID, U+10083

//BLACK CROSS ON SHIELD, U+26E8

//IDENTIFICATION CARD, U+1FAAA

// RINGED PLANET, U+1FA90

// RING BUOY, U+1F6DF lifeline

// X-RAY, U+1FA7B

//DNA DOUBLE HELIX, U+1F9EC

// ALEMBIC, U+2697 chemistry

// ALEMBIC, U+2697

// ANCHOR, U+2693

// FEATHER, U+1FAB6

// GEM STONE, U+1F48E

//DRUM WITH DRUMSTICKS, U+1F941

//DOVE OF PEACE, U+1F54A

//STAFF OF AESCULAPIUS, U+2695

//SKULL, U+1F480

//HAMMER AND SICKLE, U+262D

//CHEQUERED FLAG, U+1F3C1

//interest
// CHART WITH UPWARDS TREND, U+1F4C8
//CHART WITH UPWARDS TREND AND YEN SIGN, U+1F4B9

//SHOPPING TROLLEY, U+1F6D2 //expand invetory size



// COMPASS, U+1F9ED

// MAGIC WAND, U+1FA84

//FIRE EXTINGUISHER, U+1F9EF

//NESTING DOLLS, U+1FA86

//ARTIST PALETTE, U+1F3A8

// TEDDY BEAR, U+1F9F8

//WHITE-FEATHERED RIGHTWARDS ARROW, U+27B3

//ROCK, U+1FAA8

//BRIEFCASE, U+1F4BC

//NAME BADGE, U+1F4DB red shield

// COFFIN, U+26B0

//ROCK, U+1FAA8

// HEADSTONE, U+1FAA6

//FUNERAL URN, U+26B1

//  CLOUD WITH TORNADO, U+1F32A

// RADIOACTIVE SIGN, U+2622

// HIGH VOLTAGE SIGN, U+26A1

// SKULL AND CROSSBONES, U+2620

// PASSPORT CONTROL, U+1F6C2

//CUSTOMS, U+1F6C3

// LEFT LUGGAGE, U+1F6C5 Key and suitcase

//CASTLE, U+26EB

// MAP SYMBOL FOR LIGHTHOUSE, U+26EF

//FLYING SAUCER, U+1F6F8

// ROLLED-UP NEWSPAPER, U+1F5DE

// WOOD log, U+1FAB5

// BLACK SCISSORS, U+2702

//HORSE RACING, U+1F3C7

// FENCER, U+1F93A

//BOXING GLOVE, U+1F94A

//ankh
//EGYPTIAN HIEROGLYPH S034, U+132F9

//alien
//EGYPTIAN HIEROGLYPH R028, U+132CF

//crosshair
//POSITION INDICATOR, U+2316

//LOCK, U+
//OLD KEY, U+1F5DD

//EGYPTIAN HIEROGLYPH AA024, U+13426 //gate??
//gate
// EGYPTIAN HIEROGLYPH N024, U+13208

// CROWN, U+1F451

//DARK SUNGLASSES, U+1F576

// FLOPPY DISK, U+1F4BE //backup

//EGYPTIAN HIEROGLYPH D004, U+13079 //eye

//EGYPTIAN HIEROGLYPH D009, U+1307F //eye on stilts

// SATELLITE ANTENNA, U+1F4E1

//PURSE, U+1F45B

//DARK SUNGLASSES, U+1F576

//NO MOBILE PHONES, U+1F4F5

//SEEDLING, U+1F331

//CACTUS, U+1F335

// //bull
//EGYPTIAN HIEROGLYPH E001, U+130D2
//EGYPTIAN HIEROGLYPH F002, U+13100
// EGYPTIAN HIEROGLYPH F001, U+130FE

//osiris bird with circle
// EGYPTIAN HIEROGLYPH G009, U+1314A

//turtle
// EGYPTIAN HIEROGLYPH I002, U+13189

//frog
//EGYPTIAN HIEROGLYPH I007, U+1318F

//beetle
//EGYPTIAN HIEROGLYPH L001, U+131A3

//fly
// EGYPTIAN HIEROGLYPH L003, U+131A6

//cricket
//EGYPTIAN HIEROGLYPH L004, U+131A7

//centipede
// EGYPTIAN HIEROGLYPH L005, U+131A8

//SCORPION, U+1F982

//MONEY BAG, U+1F4B0

//MONEY WITH WINGS, U+1F4B8

// LUGGAGE, U+1F9F3

// TICKET, U+1F3AB

//ADMISSION TICKETS, U+1F39F

//big knife
// HOCHO, U+1F52A

//DROP OF BLOOD, U+1FA78

// HIGH VOLTAGE SIGN, U+26A1



//OS-vouchers???
// PENGUIN, U+1F427
//+1 to all player stats - memory admin interest

//WINDOW, U+1FA9F
//+1 admin -1 memory

// GREEN APPLE, U+1F34F
//+1 memory -1 interest

// SCALES, U+2696 --- CLASSICAL BUILDING, U+1F3DB --- CROSSED SWORDS, U+2694
//temple - +1 admin +1 memory -1 interest
//---------