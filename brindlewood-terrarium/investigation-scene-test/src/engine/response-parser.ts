import type { ActionProposal, BeliefState } from './types';

export function parseActionProposals(response: string): ActionProposal[] {
  try {
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed.map((p, i) => ({
        id: `proposal-${Date.now()}-${i}`,
        mavenSays: p.mavenSays || p.says || p.dialogue || '',
        moveType: normalizeMoveType(p.moveType || p.type || 'basic'),
        target: p.target || p.who || p.what || '',
        ability: normalizeAbility(p.ability || p.stat || p.modifier),
      }));
    }
    return [];
  } catch {
    return parseFallbackActionProposals(response);
  }
}

export function parseBeliefUpdate(response: string): BeliefState {
  try {
    const cleaned = cleanJSONResponse(response);
    const parsed = JSON.parse(cleaned);
    return {
      suspect: parsed.suspect || '',
      reasoning: parsed.reasoning || '',
      questions: Array.isArray(parsed.questions) ? parsed.questions : [],
    };
  } catch {
    return {
      suspect: '',
      reasoning: '',
      questions: [],
    };
  }
}

export function parseNarration(response: string): string {
  const cleaned = response.trim();
  if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (typeof parsed === 'string') return parsed;
      if (parsed.narration) return parsed.narration;
      if (parsed.text) return parsed.text;
      if (parsed.result) return parsed.result;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parseNarration(JSON.stringify(parsed[0]));
      }
    } catch {
      // fall through
    }
  }
  return cleaned;
}

export function parseComplication(response: string): string {
  const cleaned = response.trim();
  if (cleaned.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleaned);
      return parsed.complication || parsed.problem || parsed.issue || cleaned;
    } catch {
      return cleaned;
    }
  }
  return cleaned;
}

export function parseDayMoveVulnerability(response: string): string {
  const cleaned = response.trim();
  if (cleaned.startsWith('{')) {
    try {
      const parsed = JSON.parse(cleaned);
      return parsed.vulnerability || parsed.cost || parsed.problem || cleaned;
    } catch {
      return cleaned;
    }
  }
  return cleaned;
}

function cleanJSONResponse(response: string): string {
  let cleaned = response.trim();
  const jsonMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) {
    cleaned = jsonMatch[1];
  }
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  return cleaned;
}

function normalizeMoveType(type: string): ActionProposal['moveType'] {
  const lower = type.toLowerCase();
  if (lower.includes('meddle') || lower.includes('search') || lower.includes('clue')) {
    return 'meddling';
  }
  if (lower.includes('day') || lower.includes('risk')) {
    return 'day';
  }
  if (lower.includes('cozy') || lower.includes('social') || lower.includes('bond')) {
    return 'cozy';
  }
  return 'basic';
}

function normalizeAbility(
  ability?: string
): ActionProposal['ability'] {
  if (!ability) return undefined;
  const lower = ability.toLowerCase();
  if (lower.includes('vital') || lower.includes('strength') || lower.includes('athletic')) {
    return 'vitality';
  }
  if (lower.includes('comp') || lower.includes('calm') || lower.includes('concentration')) {
    return 'composure';
  }
  if (lower.includes('reason') || lower.includes('mental') || lower.includes('study') || lower.includes('logic')) {
    return 'reason';
  }
  if (lower.includes('pres') || lower.includes('charm') || lower.includes('social')) {
    return 'presence';
  }
  if (lower.includes('sens') || lower.includes('super') || lower.includes('occult') || lower.includes('spiritual')) {
    return 'sensitivity';
  }
  return undefined;
}

function parseFallbackActionProposals(response: string): ActionProposal[] {
  const proposals: ActionProposal[] = [];
  const lines = response.split('\n').filter((l) => l.trim());
  let current: Partial<ActionProposal> = {};
  for (const line of lines) {
    const saysMatch = line.match(/[-"*]?\s*(?:say|says|utter|speaks):?\s*["']?(.+)/i);
    const typeMatch = line.match(/type[:\s]+(\w+)/i);
    const targetMatch = line.match(/(?:target|focus|on)[:\s]+(.+)/i);
    const abilityMatch = line.match(/(?:ability|stat|modifier)[:\s]+(\w+)/i);
    if (saysMatch) {
      current.mavenSays = saysMatch[1].trim();
    }
    if (typeMatch) {
      current.moveType = normalizeMoveType(typeMatch[1]);
    }
    if (targetMatch) {
      current.target = targetMatch[1].trim();
    }
    if (abilityMatch) {
      current.ability = normalizeAbility(abilityMatch[1]);
    }
    if (Object.keys(current).length >= 3) {
      proposals.push({
        id: `proposal-${Date.now()}-${proposals.length}`,
        mavenSays: current.mavenSays || '...',
        moveType: current.moveType || 'basic',
        target: current.target || '',
        ability: current.ability,
      });
      current = {};
    }
  }
  return proposals;
}
