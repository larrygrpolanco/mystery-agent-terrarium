import { useState, useEffect, useCallback } from 'react';
import type { GameState, Maven, Suspect, Clue, ActionProposal, DiscoveredClue } from './engine/types';
import { createInitialState, setSceneSetup, setCluePools, setCurrentMaven, setActionProposals, addDiscoveredClue, addToSceneLog, updateBelief, nextCycle, setPendingResolution, setPendingDayMoveChoice, removeVoidClue, clearCondition } from './engine/game-state';
import { roll2d6, resolveMove } from './engine/dice';
import { buildActionProposalPrompt, buildBasicResolutionPrompt, buildMeddlingResolutionPrompt, buildDayMoveResolutionPrompt, buildCozyResolutionPrompt, buildBeliefUpdatePrompt } from './engine/prompt-builder';
import { parseActionProposals, parseBeliefUpdate, parseNarration, parseComplication } from './engine/response-parser';
import { callClaude } from './api/anthropic';
import { SetupScreen } from './components/SetupScreen';
import { SceneHeader } from './components/SceneHeader';
import { MavenPicker } from './components/MavenPicker';
import { ActionProposals } from './components/ActionProposals';
import { ResolutionView } from './components/ResolutionView';
import { ClueCuration } from './components/ClueCuration';
import { ClueBoard } from './components/ClueBoard';
import { MavenThoughts } from './components/MavenThoughts';
import { DayMoveChoice } from './components/DayMoveChoice';
import { DevLog } from './components/DevLog';
import mavensData from './data/mavens.json';
import suspectsData from './data/suspects.json';
import locationData from './data/location.json';
import cluePoolData from './data/clue-pool.json';
import voidPoolData from './data/void-pool.json';
import './App.css';

type Phase = 'setup' | 'pickMaven' | 'loadingProposals' | 'selectAction' | 'resolving' | 'clueSelection' | 'dayChoice' | 'done';

const mavens = mavensData as Maven[];
const suspects = suspectsData as Suspect[];
const location = locationData;
const cluePool = cluePoolData as Clue[];
const voidPool = voidPoolData as Clue[];

function App() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [lastPrompt, setLastPrompt] = useState<string>('');
  const [lastResponse, setLastResponse] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<ActionProposal | null>(null);
  const [devLogExpanded, setDevLogExpanded] = useState(false);
  const [clueBoardExpanded, setClueBoardExpanded] = useState(false);

  const currentMaven = gameState.currentMaven ? mavens.find(m => m.id === gameState.currentMaven) : null;

  const handleSetupComplete = useCallback((paintTheScene: string, establishingAnswer: string, establishingMaven: string) => {
    let newState = setSceneSetup(createInitialState(), paintTheScene, establishingAnswer, establishingMaven);
    newState = setCluePools(newState, cluePool, voidPool);
    setGameState(newState);
    setPhase('pickMaven');
  }, []);

  const handleMavenSelect = useCallback((mavenId: string) => {
    setGameState(prev => setCurrentMaven(prev, mavenId));
    setPhase('loadingProposals');
  }, []);

  useEffect(() => {
    if (phase !== 'loadingProposals' || !gameState.currentMaven) return;

    const loadingMaven = mavens.find(m => m.id === gameState.currentMaven);
    if (!loadingMaven) return;

    const ctx = {
      maven: loadingMaven,
      mavens,
      suspects,
      gameState,
      locationName: location.name,
      paintTheSceneQuestion: location.paintTheSceneQuestion,
    };

    const prompt = buildActionProposalPrompt(ctx);
    setLastPrompt(prompt);

    callClaude(prompt).then(response => {
      setLastResponse(response);
      const proposals = parseActionProposals(response);
      setGameState(prev => setActionProposals(prev, proposals));
      setPhase('selectAction');
    }).catch(err => {
      console.error('LLM error:', err);
      setLastResponse(`Error: ${err.message}`);
      setPhase('pickMaven');
    });
  }, [phase, gameState.currentMaven, gameState, location]);

  const handleActionSelect = useCallback((action: ActionProposal) => {
    setSelectedAction(action);
    setPhase('resolving');

    if (!currentMaven || !gameState.currentMaven) return;

    const roll = roll2d6();
    const ability = action.ability || 'presence';
    const modifier = currentMaven.stats[ability] || 0;
    const resolved = resolveMove(action.moveType, roll, modifier);

    const ctx = {
      maven: currentMaven,
      mavens,
      suspects,
      gameState,
      locationName: location.name,
      paintTheSceneQuestion: location.paintTheSceneQuestion,
    };

    if (action.moveType === 'basic') {
      const prompt = buildBasicResolutionPrompt(ctx, action);
      setLastPrompt(prompt);
      callClaude(prompt).then(response => {
        setLastResponse(response);
        const narration = parseNarration(response);
        
        const logEntry = {
          turn: gameState.cycleNumber,
          maven: currentMaven.name,
          action: action.mavenSays,
          narration,
        };
        setGameState(prev => {
          let newState = addToSceneLog(prev, logEntry);
          newState = setPendingResolution(newState, { narration, result: 'hit' });
          return newState;
        });
        setPhase('done');
      }).catch(err => {
        console.error('LLM error:', err);
      });
    } else if (action.moveType === 'meddling') {
      if (resolved.result === 'miss') {
        const narration = `${currentMaven.name}'s search comes up empty. Nothing of use here.`;
        const logEntry = {
          turn: gameState.cycleNumber,
          maven: currentMaven.name,
          action: action.mavenSays,
          narration,
          roll,
          ability,
          result: 'miss' as const,
        };
        setGameState(prev => {
          let newState = addToSceneLog(prev, logEntry);
          newState = setPendingResolution(newState, { narration, roll, ability, result: 'miss' });
          return newState;
        });
        setPhase('done');
      } else {
        setGameState(prev => {
          let newState = setPendingResolution(prev, {
            narration: '',
            roll,
            ability,
            result: resolved.result as 'hit' | 'partial' | 'critical',
          });
          return newState;
        });
        setPhase('clueSelection');
      }
    } else if (action.moveType === 'day') {
      if (resolved.result === 'hit' || resolved.result === 'critical') {
        const prompt = buildDayMoveResolutionPrompt(ctx, action, roll, resolved.total, resolved.result);
        setLastPrompt(prompt);
        callClaude(prompt).then(response => {
          setLastResponse(response);
          const narration = parseNarration(response);
          const logEntry = {
            turn: gameState.cycleNumber,
            maven: currentMaven.name,
            action: action.mavenSays,
            narration,
            roll,
            ability,
            result: 'hit' as const,
          };
          setGameState(prev => {
            let newState = addToSceneLog(prev, logEntry);
            newState = setPendingResolution(newState, { narration, roll, ability, result: resolved.result as 'hit' | 'critical' });
            return newState;
          });
          setPhase('done');
        }).catch(err => {
          console.error('LLM error:', err);
        });
      } else {
        const prompt = buildDayMoveResolutionPrompt(ctx, action, roll, resolved.total, resolved.result);
        setLastPrompt(prompt);
        callClaude(prompt).then(response => {
          setLastResponse(response);
          const vulnerability = parseComplication(response);
          setGameState(prev => setPendingDayMoveChoice(prev, {
            vulnerability,
            canPushThrough: true,
          }));
          setPhase('dayChoice');
        }).catch(err => {
          console.error('LLM error:', err);
        });
      }
    } else if (action.moveType === 'cozy') {
      const targetMaven = mavens.find(m => m.id !== gameState.currentMaven) || mavens[0];
      const prompt = buildCozyResolutionPrompt(ctx, targetMaven, currentMaven.cozyActivity);
      setLastPrompt(prompt);
      callClaude(prompt).then(response => {
        setLastResponse(response);
        const narration = parseNarration(response);
        const logEntry = {
          turn: gameState.cycleNumber,
          maven: currentMaven.name,
          action: action.mavenSays,
          narration,
        };
        setGameState(prev => {
          let newState = addToSceneLog(prev, logEntry);
          const conditions = newState.mavenConditions[gameState.currentMaven!] || [];
          if (conditions.length > 0) {
            newState = clearCondition(newState, gameState.currentMaven!, conditions[0]);
          }
          newState = setPendingResolution(newState, { narration, result: 'hit' });
          return newState;
        });
        setPhase('done');
      }).catch(err => {
        console.error('LLM error:', err);
      });
    }
  }, [currentMaven, gameState]);

  const handleClueSelect = useCallback((clue: Clue, placement: string) => {
    if (!currentMaven || !selectedAction) return;

    const isVoid = gameState.pendingResolution?.result === 'critical' && voidPool.some(v => v.id === clue.id);
    const prompt = buildMeddlingResolutionPrompt(
      { maven: currentMaven, mavens, suspects, gameState, locationName: location.name, paintTheSceneQuestion: location.paintTheSceneQuestion },
      selectedAction,
      gameState.pendingResolution?.roll || 0,
      (gameState.pendingResolution?.roll || 0) + (currentMaven.stats[selectedAction.ability || 'presence'] || 0),
      gameState.pendingResolution?.result || 'hit',
      clue.text,
      placement,
      isVoid
    );
    setLastPrompt(prompt);

    callClaude(prompt).then(response => {
      setLastResponse(response);
      const narration = parseNarration(response);
      const complication = parseComplication(response);

      const discoveredClue: DiscoveredClue = {
        id: clue.id,
        text: clue.text,
        discoveredBy: currentMaven.name,
        placementContext: placement,
        turnNumber: gameState.cycleNumber,
      };

      const logEntry = {
        turn: gameState.cycleNumber,
        maven: currentMaven.name,
        action: selectedAction.mavenSays,
        narration,
        roll: gameState.pendingResolution?.roll,
        ability: selectedAction.ability,
        result: gameState.pendingResolution?.result,
        complication: complication !== narration ? complication : undefined,
        clue: discoveredClue,
      };

      setGameState(prev => {
        let newState = addDiscoveredClue(prev, discoveredClue);
        if (isVoid) {
          newState = removeVoidClue(newState, clue.id);
        }
        newState = addToSceneLog(newState, logEntry);
        newState = setPendingResolution(newState, { 
          narration, 
          roll: gameState.pendingResolution?.roll,
          ability: selectedAction.ability,
          result: gameState.pendingResolution?.result,
          complication: complication !== narration ? complication : undefined,
        });
        return newState;
      });

      updateBeliefs(discoveredClue);
    }).catch(err => {
      console.error('LLM error:', err);
    });
  }, [currentMaven, selectedAction, gameState, location]);

  const updateBeliefs = useCallback((discoveredClue: DiscoveredClue) => {
    if (!currentMaven) return;

    const lastEntry = gameState.sceneLog[gameState.sceneLog.length - 1];
    const prompt = buildBeliefUpdatePrompt(
      { maven: currentMaven, mavens, suspects, gameState, locationName: location.name, paintTheSceneQuestion: location.paintTheSceneQuestion },
      { mavenSays: lastEntry?.action || '', narration: lastEntry?.narration || '', clueFound: discoveredClue.text }
    );
    setLastPrompt(prompt);

    callClaude(prompt).then(response => {
      setLastResponse(response);
      const belief = parseBeliefUpdate(response);
      setGameState(prev => updateBelief(prev, gameState.currentMaven!, belief));
      setPhase('done');
    }).catch(err => {
      console.error('LLM error:', err);
      setPhase('done');
    });
  }, [currentMaven, gameState, location]);

  const handleDayChoice = useCallback((pushThrough: boolean) => {
    if (!currentMaven) return;

    const logEntry = {
      turn: gameState.cycleNumber,
      maven: currentMaven.name,
      action: selectedAction?.mavenSays || '',
      narration: pushThrough 
        ? `${currentMaven.name} pushes through despite the risk.`
        : `${currentMaven.name} decides to back down.`,
      roll: gameState.pendingResolution?.roll,
      ability: selectedAction?.ability,
      result: (pushThrough ? 'hit' : 'miss') as 'hit' | 'miss',
    };

    setGameState(prev => {
      let newState = addToSceneLog(prev, logEntry);
      newState = setPendingResolution(newState, {
        narration: logEntry.narration,
        roll: gameState.pendingResolution?.roll,
        ability: selectedAction?.ability,
        result: (pushThrough ? 'hit' : 'miss') as 'hit' | 'miss',
      });
      return newState;
    });
    setPhase('done');
  }, [currentMaven, selectedAction, gameState]);

  const handleContinue = useCallback(() => {
    setSelectedAction(null);
    setGameState(prev => nextCycle(prev));
    setPhase('pickMaven');
  }, []);

  const handleEndGame = useCallback(() => {
    setGameState(createInitialState());
    setPhase('setup');
    setSelectedAction(null);
  }, []);

  if (phase === 'setup') {
    return <SetupScreen mavens={mavens} onComplete={handleSetupComplete} />;
  }

  return (
    <div className="app">
      <div className="main-panel">
        <SceneHeader
          locationName={location.name}
          suspects={suspects}
          cycleNumber={gameState.cycleNumber}
          dayNight={gameState.dayNight}
        />

        {phase === 'pickMaven' && (
          <MavenPicker
            mavens={mavens}
            currentMaven={gameState.currentMaven}
            conditions={gameState.mavenConditions}
            onSelect={handleMavenSelect}
          />
        )}

        {(phase === 'loadingProposals' || phase === 'selectAction') && currentMaven && (
          <ActionProposals
            mavenName={currentMaven.name}
            proposals={gameState.pendingProposals || []}
            onSelect={handleActionSelect}
            isLoading={phase === 'loadingProposals'}
          />
        )}

        {(phase === 'resolving' || phase === 'done') && gameState.pendingResolution && (
          <ResolutionView
            mavenName={currentMaven?.name || ''}
            narration={gameState.pendingResolution.narration}
            roll={gameState.pendingResolution.roll}
            ability={gameState.pendingResolution.ability}
            total={gameState.pendingResolution.roll !== undefined && gameState.pendingResolution.ability
              ? gameState.pendingResolution.roll + (currentMaven?.stats[gameState.pendingResolution.ability] || 0)
              : undefined}
            result={gameState.pendingResolution.result}
            complication={gameState.pendingResolution.complication}
            onContinue={phase === 'done' ? handleContinue : undefined}
          />
        )}

        {phase === 'clueSelection' && (
          <ClueCuration
            remainingClues={gameState.remainingCluePool}
            onSelect={handleClueSelect}
          />
        )}

        {phase === 'dayChoice' && gameState.pendingDayMoveChoice && currentMaven && (
          <DayMoveChoice
            mavenName={currentMaven.name}
            vulnerability={gameState.pendingDayMoveChoice.vulnerability}
            onChoice={handleDayChoice}
          />
        )}

        <ClueBoard
          discoveredClues={gameState.discoveredClues}
          isExpanded={clueBoardExpanded}
          onToggle={() => setClueBoardExpanded(!clueBoardExpanded)}
        />

        <div className="game-controls">
          <button onClick={handleEndGame} className="secondary">Start Over</button>
        </div>
      </div>

      <div className="side-panel">
        <div className="maven-thoughts-panel">
          {mavens.map(maven => (
            <MavenThoughts
              key={maven.id}
              maven={maven}
              belief={gameState.mavenBeliefs[maven.id]}
              conditions={gameState.mavenConditions[maven.id] || []}
            />
          ))}
        </div>

        <DevLog
          gameState={gameState}
          lastPrompt={lastPrompt}
          lastResponse={lastResponse}
          isExpanded={devLogExpanded}
          onToggle={() => setDevLogExpanded(!devLogExpanded)}
        />
      </div>
    </div>
  );
}

export default App;
