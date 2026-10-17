export type SchoolLevel = 'CP' | 'CE1' | 'CE2' | 'CM1' | 'CM2' | '6E';

export type GlazeFlavor = 'strawberry' | 'cyan_frost' | 'lemon' | 'grape' | 'chocolate' | 'caramel';

export interface ComparisonInfo {
  n1: number;
  d1: number;
  n2: number;
  d2: number;
  m1: number;
  m2: number;
  k1: number;
  k2: number;
  commonDen: number;
  largerIndex: number; // 0 for cake1, 1 for cake2, -1 for equal
  operationText: string;
  resultText: string;
}

export interface EquivalenceInfo {
  baseNum: number;
  baseDen: number;
  eqNum: number;
  eqDen: number;
  multiplier: number;
  operationText: string;
  resultText: string;
}

export interface CakeSpec {
  shape: 'round' | 'bar' | 'quantity';
  totalParts: number; // e.g. 4
  activeParts: number; // e.g. 3
  groups?: number; // for quantity e.g. 3 groups
  activeGroups?: number; // for quantity e.g. 2 active groups
  isEqual?: boolean; // For CP equal vs unequal parts
  cutAngles?: number[]; // custom angles for unequal cuts
  glaze?: GlazeFlavor;
  label?: string;
  subText?: string;
  secondarySpec?: CakeSpec; // for mixed fractions or comparisons
  multiCakes?: CakeSpec[]; // for composite visuals (e.g. 1 whole cake + fraction)
  operator?: string; // e.g. '+', '−', '=', 'vs' between multiCakes
  isComparison?: boolean;
  comparisonInfo?: ComparisonInfo;
  isEquivalence?: boolean;
  equivalenceInfo?: EquivalenceInfo;
}

export interface LaneOption {
  id: string;
  laneIndex: number; // 0, 1, 2, 3
  text?: string;
  cake?: CakeSpec;
  isCorrect: boolean;
}

export type ExerciseType =
  | 'partage_egal'
  | 'identifier_fraction'
  | 'nommer_fraction'
  | 'comparer'
  | 'egalite'
  | 'addition'
  | 'bande_unite'
  | 'fraction_superieure'
  | 'fraction_quantite'
  | 'decimal_conversion';

export interface Question {
  id: string;
  level: SchoolLevel;
  type: ExerciseType;
  prompt: string; // Strictly max 10 words
  visual?: CakeSpec;
  visualQuantity?: {
    totalItems: number;
    itemFraction: string;
    fractionText: string;
    num?: number;
    den?: number;
    itemsPerLine?: number;
    numLines?: number;
  };
  options: [LaneOption, LaneOption, LaneOption, LaneOption];
  explanation?: string;
}

export interface PlayerProfile {
  id: string;
  name: string;
  avatarId: number; // 0 to 11
  coins: number;
  unlockedCharacters: number[]; // 1 to 40
  highScores: Record<SchoolLevel, number>;
  starsPerLevel: Record<SchoolLevel, number>;
  colorblindMode: boolean;
  soundEnabled: boolean;
  selectedLevel: SchoolLevel;
  adaptiveStats: Record<string, { correct: number; attempts: number }>;
}

export type CharacterRarity = 'commune' | 'rare' | 'epique' | 'legendaire';

export interface PastryCharacter {
  id: number;
  name: string;
  title: string;
  rarity: CharacterRarity;
  instrument: string;
  flavor: string;
  tagline: string;
  color: string;
  emoji: string;
}

export interface AvatarInfo {
  id: number;
  name: string;
  animal: string;
  badgeBg: string;
  avatarColor: string;
  instrument: string;
  imageSrc: string;
}

export interface FallingNote {
  id: string;
  question: Question;
  y: number; // 0 (spawn) to 100 (strike line)
  isFrozen: boolean;
  laneHit?: number;
}
