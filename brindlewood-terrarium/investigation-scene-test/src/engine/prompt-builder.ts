import type { GameState, Maven, Suspect, ActionProposal, BeliefState, DiscoveredClue } from './types';

interface PromptContext {
  maven: Maven;
  mavens: Maven[];
  suspects: Suspect[];
  gameState: GameState;
  locationName: string;
  paintTheSceneQuestion: string;
}

function buildMavenProfile(maven: Maven): string {
  return `
# ${maven.name}
**Style:** ${maven.style}
**Cozy Activity:** ${maven.cozyActivity}
**Traits:** ${maven.traits}
**Voice:** ${maven.voice}
**Investigative Tendency:** ${maven.investigativeTendency}
**Stats:** Vitality ${maven.stats.vitality}, Composure ${maven.stats.composure}, Reason ${maven.stats.reason}, Presence ${maven.stats.presence}, Sensitivity ${maven.stats.sensitivity}
`;
}

function buildSuspectList(suspects: Suspect[]): string {
  return suspects
    .map(
      (s) => `
## ${s.name} (${s.role})
${s.description}
*"${s.quote}"*
`
    )
    .join('\n');
}

function buildClueHistory(discoveredClues: DiscoveredClue[]): string {
  if (discoveredClues.length === 0) {
    return 'No clues discovered yet.';
  }
  return discoveredClues
    .map(
      (c) => `
**Clue #${c.turnNumber}** (found by ${c.discoveredBy}): ${c.text}
*Placement: ${c.placementContext}*
`
    )
    .join('\n');
}

function buildSceneLog(gameState: GameState): string {
  if (gameState.sceneLog.length === 0) {
    return 'No actions taken yet.';
  }
  return gameState.sceneLog
    .map(
      (entry) => `
**Cycle ${entry.turn}, ${entry.maven}:** ${entry.action}
Outcome: ${entry.narration}
${entry.roll ? `Roll: ${entry.roll} + ${entry.ability} = ${entry.roll}` : ''}
${entry.complication ? `Complication: ${entry.complication}` : ''}
`
    )
    .join('\n');
}

function buildBeliefState(beliefs: Record<string, BeliefState>): string {
  return Object.entries(beliefs)
    .map(([mavenId, belief]) => {
      if (!belief.suspect && !belief.reasoning) {
        return `**${mavenId}:** No strong suspicions yet.`;
      }
      return `**${mavenId}:** Suspects ${belief.suspect}. ${belief.reasoning} Questions: ${belief.questions.join(', ') || 'None yet.'}`;
    })
    .join('\n');
}

function buildConditions(conditions: Record<string, string[]>): string {
  return Object.entries(conditions)
    .map(([mavenId, conds]) => {
      if (conds.length === 0) return `**${mavenId}:** No conditions`;
      return `**${mavenId}:** ${conds.join(', ')}`;
    })
    .join('\n');
}

export function buildActionProposalPrompt(ctx: PromptContext): string {
  const { maven, mavens, suspects, gameState, locationName } = ctx;
  const otherMavens = mavens.filter((m) => m.id !== maven.id);

  return `You are ${maven.name}, a Murder Maven investigating a case at ${locationName}.

# Player Context
**Paint the Scene Response:** "${gameState.paintTheScene}"
**Establishing Question Response (from ${gameState.establishingMaven}):** "${gameState.establishingAnswer}"

# Your Character
${buildMavenProfile(maven)}

# Suspects Present
${buildSuspectList(suspects)}

# Mavens Present
${otherMavens.map((m) => `${m.name}: ${m.cozyActivity}`).join(', ')}

# Investigation Progress
**Cycle:** ${gameState.cycleNumber}

**Discovered Clues:**
${buildClueHistory(gameState.discoveredClues)}

**Scene Log:**
${buildSceneLog(gameState)}

**Belief States:**
${buildBeliefState(gameState.mavenBeliefs)}

**Conditions:**
${buildConditions(gameState.mavenConditions)}

# Your Task
Propose 2-3 actions you would take right now. Each action should:
- Be in your voice (${maven.name} speaks: "${maven.voice.split('.')[0]}.")
- Match your personality and investigative tendency
- Reference what you know from the scene and clues so far
- Consider whether you want to talk to suspects, search for clues, or do something else

For each action, specify:
1. What you say (1-2 sentences in character)
2. The move type: basic (auto-succeed), meddling (risk/reward clue search), day (risky action), or cozy (social bonding)
3. Who/what you're targeting
4. Which ability would be used (Vitality, Composure, Reason, Presence, or Sensitivity)

Output as JSON array:
[{"mavenSays": "...", "moveType": "basic|meddling|day|cozy", "target": "...", "ability": "vitality|composure|reason|presence|sensitivity"}]`;
}

export function buildBasicResolutionPrompt(
  ctx: PromptContext,
  chosenAction: ActionProposal
): string {
  const { maven, suspects, gameState, locationName } = ctx;

  return `You are ${maven.name}, continuing the scene at ${locationName}.

# Your Action
${chosenAction.mavenSays}
Target: ${chosenAction.target}
Ability: ${chosenAction.ability}

# Player Context
**Paint the Scene Response:** "${gameState.paintTheScene}"
**Establishing Question Response:** "${gameState.establishingAnswer}"

# Your Character
${maven.voice}

# Suspects Present
${buildSuspectList(suspects)}

# Investigation Progress
**Discovered Clues:**
${buildClueHistory(gameState.discoveredClues)}

**Scene Log:**
${buildSceneLog(gameState)}

# Your Task
Narrate what happens as a result of your action. This is a basic move, so it auto-succeeds. 
Focus on character interaction, environmental details, or pushing the scene forward.
Keep it to 2-4 sentences. Be vivid and in character.`;
}

export function buildMeddlingResolutionPrompt(
  ctx: PromptContext,
  chosenAction: ActionProposal,
  roll: number,
  total: number,
  result: 'hit' | 'partial' | 'miss' | 'critical',
  clueText?: string,
  placementContext?: string,
  isVoidClue?: boolean
): string {
  const { maven, suspects, gameState, locationName } = ctx;

  let prompt = `You are ${maven.name}, continuing the scene at ${locationName}.

# Your Action
${chosenAction.mavenSays}
Target: ${chosenAction.target}

# Roll Result
${chosenAction.ability} modifier applied. Roll: ${roll} + ${total - roll} = ${total}
Result: ${result.toUpperCase()}
${isVoidClue ? 'CRITICAL! A Void Clue was also discovered.' : ''}

# Player Context
**Paint the Scene Response:** "${gameState.paintTheScene}"

# Your Character
${maven.voice}

# Suspects Present
${buildSuspectList(suspects)}

# Investigation Progress
**Discovered Clues:**
${buildClueHistory(gameState.discoveredClues)}`;

  if (clueText && result !== 'miss') {
    prompt += `

# The Clue Found
${clueText}
*Player's placement: ${placementContext || 'Somewhere in the scene'}*`;
  }

  prompt += `

  # Your Task
  ${result === 'partial' ? `Narrate the discovery. Then add a complication — something goes wrong, or the clue has a problem, or you draw unwanted attention. Keep it to 4-6 sentences total.` : `Narrate the clean discovery of the clue. Make it feel like a satisfying "aha!" moment. Keep it to 3-4 sentences.`}

Be vivid and in character as ${maven.name}.`;

  return prompt;
}

export function buildDayMoveResolutionPrompt(
  ctx: PromptContext,
  chosenAction: ActionProposal,
  roll: number,
  total: number,
  result: 'hit' | 'partial' | 'miss' | 'critical'
): string {
  const { maven, suspects, gameState, locationName } = ctx;

  return `You are ${maven.name}, attempting something risky at ${locationName}.

# Your Action
${chosenAction.mavenSays}
Target: ${chosenAction.target}

# Roll Result
${chosenAction.ability} modifier applied. Roll: ${roll} + ${total - roll} = ${total}
Result: ${result.toUpperCase()}

# Player Context
**Paint the Scene Response:** "${gameState.paintTheScene}"

# Your Character
${maven.voice}

# Suspects Present
${buildSuspectList(suspects)}

# Investigation Progress
**Discovered Clues:**
${buildClueHistory(gameState.discoveredClues)}

  # Your Task
  ${result === 'miss' ? `Narrate how the risky action fails badly. Something unfortunate happens. Keep it to 3-4 sentences.` : result === 'partial' ? `Describe what you're trying to do, then describe the vulnerability or cost you're facing. State clearly: "You could back down now, or push through despite the risk." This is a choice for the player.` : `Narrate how you succeed at the risky action. You hold steady or accomplish what you intended. Keep it to 3-4 sentences.`}

Be vivid and in character as ${maven.name}.`;
}

export function buildCozyResolutionPrompt(
  ctx: PromptContext,
  targetMaven: Maven,
  cozyActivity: string
): string {
  const { maven, gameState, locationName } = ctx;

  return `You are ${maven.name}, having a cozy moment with ${targetMaven.name} at ${locationName}.

# The Moment
${maven.name} is engaged in their cozy activity: ${cozyActivity}
${targetMaven.name} joins in or observes.

# Your Character
${maven.name}: ${maven.voice}
${targetMaven.name}: ${targetMaven.voice}

# Investigation Progress
**Discovered Clues:**
${buildClueHistory(gameState.discoveredClues)}

**Belief States:**
${buildBeliefState(gameState.mavenBeliefs)}

# Your Task
Narrate an intimate character moment between the two Mavens. This should:
- Show their friendship and relationship
- Feel warm and cozy
- Not directly advance the mystery, but may reference their feelings about it
- Clear a condition from ${maven.name}

Keep it to 4-6 sentences. Be vivid and in character.`;
}

export function buildBeliefUpdatePrompt(
  ctx: PromptContext,
  lastAction: { mavenSays: string; narration: string; clueFound?: string }
): string {
  const { maven, suspects, gameState } = ctx;

  return `You are ${maven.name}, processing what just happened during the investigation.

# What Just Happened
${lastAction.mavenSays}
Outcome: ${lastAction.narration}
${lastAction.clueFound ? `You found: ${lastAction.clueFound}` : ''}

# Your Character
**Traits:** ${maven.traits}
**Current Voice:** ${maven.voice}

# Current Beliefs
${buildBeliefState(gameState.mavenBeliefs)}

# Known Clues
${buildClueHistory(gameState.discoveredClues)}

# Suspects
${buildSuspectList(suspects)}

# Your Task
Update ${maven.name}'s belief state. Based on what just happened:
1. Do they have a stronger suspicion about who might be involved?
2. What questions are they asking themselves?
3. How has their thinking evolved?

Output as JSON:
{"suspect": "name or 'none'", "reasoning": "why they suspect this person", "questions": ["question1", "question2"]}`;
}
