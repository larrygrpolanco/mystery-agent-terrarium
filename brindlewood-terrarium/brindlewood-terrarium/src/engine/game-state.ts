import type { GameState, BeliefState, Clue, DiscoveredClue, ActionProposal, SceneLogEntry } from './types';

export function createInitialState(): GameState {
  return {
    paintTheScene: '',
    establishingAnswer: '',
    establishingMaven: '',
    currentMaven: null,
    cycleNumber: 1,
    dayNight: 'day',
    discoveredClues: [],
    remainingCluePool: [],
    remainingVoidPool: [],
    mavenBeliefs: {
      birdie: { suspect: '', reasoning: '', questions: [] },
      pearl: { suspect: '', reasoning: '', questions: [] },
      doris: { suspect: '', reasoning: '', questions: [] },
    },
    mavenConditions: {
      birdie: [],
      pearl: [],
      doris: [],
    },
    sceneLog: [],
    pendingProposals: null,
    pendingClueSelection: false,
    pendingDayMoveChoice: null,
    pendingResolution: null,
  };
}

export function setSceneSetup(
  state: GameState,
  paintTheScene: string,
  establishingAnswer: string,
  establishingMaven: string
): GameState {
  return {
    ...state,
    paintTheScene,
    establishingAnswer,
    establishingMaven,
  };
}

export function setCluePools(state: GameState, clues: Clue[], voidClues: Clue[]): GameState {
  return {
    ...state,
    remainingCluePool: [...clues],
    remainingVoidPool: [...voidClues],
  };
}

export function setCurrentMaven(state: GameState, mavenId: string | null): GameState {
  return {
    ...state,
    currentMaven: mavenId,
    pendingProposals: null,
    pendingClueSelection: false,
    pendingDayMoveChoice: null,
    pendingResolution: null,
  };
}

export function setActionProposals(state: GameState, proposals: ActionProposal[]): GameState {
  return {
    ...state,
    pendingProposals: proposals,
  };
}

export function addDiscoveredClue(state: GameState, clue: DiscoveredClue): GameState {
  return {
    ...state,
    discoveredClues: [...state.discoveredClues, clue],
    remainingCluePool: state.remainingCluePool.filter((c) => c.id !== clue.id),
  };
}

export function removeVoidClue(state: GameState, clueId: string): GameState {
  return {
    ...state,
    remainingVoidPool: state.remainingVoidPool.filter((c) => c.id !== clueId),
  };
}

export function addToSceneLog(state: GameState, entry: SceneLogEntry): GameState {
  return {
    ...state,
    sceneLog: [...state.sceneLog, entry],
  };
}

export function updateBelief(state: GameState, mavenId: string, belief: BeliefState): GameState {
  return {
    ...state,
    mavenBeliefs: {
      ...state.mavenBeliefs,
      [mavenId]: belief,
    },
  };
}

export function addCondition(state: GameState, mavenId: string, condition: string): GameState {
  const current = state.mavenConditions[mavenId] || [];
  return {
    ...state,
    mavenConditions: {
      ...state.mavenConditions,
      [mavenId]: [...current, condition],
    },
  };
}

export function clearCondition(state: GameState, mavenId: string, condition: string): GameState {
  return {
    ...state,
      mavenConditions: {
        ...state.mavenConditions,
        [mavenId]: (state.mavenConditions[mavenId] || []).filter((c) => c !== condition),
      },
  };
}

export function nextCycle(state: GameState): GameState {
  return {
    ...state,
    cycleNumber: state.cycleNumber + 1,
    currentMaven: null,
    pendingProposals: null,
    pendingClueSelection: false,
    pendingDayMoveChoice: null,
    pendingResolution: null,
  };
}

export function setPendingResolution(
  state: GameState,
  resolution: GameState['pendingResolution']
): GameState {
  return {
    ...state,
    pendingResolution: resolution,
  };
}

export function setPendingDayMoveChoice(
  state: GameState,
  choice: GameState['pendingDayMoveChoice']
): GameState {
  return {
    ...state,
    pendingDayMoveChoice: choice,
  };
}

export function enableClueSelection(state: GameState): GameState {
  return {
    ...state,
    pendingClueSelection: true,
  };
}
