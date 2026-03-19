export interface Maven {
  id: string;
  name: string;
  style: string;
  cozyActivity: string;
  traits: string;
  voice: string;
  investigativeTendency: string;
  stats: {
    vitality: number;
    composure: number;
    reason: number;
    presence: number;
    sensitivity: number;
  };
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  description: string;
  quote: string;
}

export interface Clue {
  id: string;
  text: string;
}

export interface Location {
  name: string;
  paintTheSceneQuestion: string;
  mysteryContext: string;
}

export interface BeliefState {
  suspect: string;
  reasoning: string;
  questions: string[];
}

export interface DiscoveredClue extends Clue {
  discoveredBy: string;
  placementContext: string;
  turnNumber: number;
}

export interface ActionProposal {
  id: string;
  mavenSays: string;
  moveType: 'basic' | 'meddling' | 'day' | 'cozy';
  target: string;
  ability?: keyof Maven['stats'];
}

export interface SceneLogEntry {
  turn: number;
  maven: string;
  action: string;
  narration: string;
  roll?: number;
  ability?: keyof Maven['stats'];
  result?: 'hit' | 'miss' | 'partial' | 'critical';
  complication?: string;
  clue?: DiscoveredClue;
}

export interface DayMoveChoice {
  vulnerability: string;
  canPushThrough: boolean;
  pushThroughResult?: string;
  backDownResult?: string;
}

export interface GameState {
  paintTheScene: string;
  establishingAnswer: string;
  establishingMaven: string;
  currentMaven: string | null;
  cycleNumber: number;
  dayNight: 'day' | 'night';
  discoveredClues: DiscoveredClue[];
  remainingCluePool: Clue[];
  remainingVoidPool: Clue[];
  mavenBeliefs: Record<string, BeliefState>;
  mavenConditions: Record<string, string[]>;
  sceneLog: SceneLogEntry[];
  pendingProposals: ActionProposal[] | null;
  pendingClueSelection: boolean;
  pendingDayMoveChoice: DayMoveChoice | null;
  pendingResolution: {
    narration: string;
    roll?: number;
    ability?: keyof Maven['stats'];
    result?: 'hit' | 'miss' | 'partial' | 'critical';
    complication?: string;
    isVoidClue?: boolean;
  } | null;
}

export type MoveType = 'basic' | 'meddling' | 'day' | 'cozy';

export interface DiceResult {
  roll: number;
  modifier: number;
  total: number;
  result: 'miss' | 'partial' | 'hit' | 'critical';
}
