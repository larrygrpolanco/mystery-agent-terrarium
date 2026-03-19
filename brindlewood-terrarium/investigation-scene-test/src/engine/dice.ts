import type { DiceResult, MoveType } from './types';

export function roll2d6(): number {
  return Math.floor(Math.random() * 6) + 1 + Math.floor(Math.random() * 6) + 1;
}

export function resolveMove(moveType: MoveType, roll: number, modifier: number): DiceResult {
  const total = roll + modifier;
  const result: DiceResult = { roll, modifier, total, result: 'miss' };

  switch (moveType) {
    case 'basic':
      result.result = 'hit';
      break;
    case 'meddling':
      if (total >= 12) {
        result.result = 'critical';
      } else if (total >= 10) {
        result.result = 'hit';
      } else if (total >= 7) {
        result.result = 'partial';
      } else {
        result.result = 'miss';
      }
      break;
    case 'day':
      if (total >= 12) {
        result.result = 'critical';
      } else if (total >= 10) {
        result.result = 'hit';
      } else if (total >= 7) {
        result.result = 'partial';
      } else {
        result.result = 'miss';
      }
      break;
    case 'cozy':
      result.result = 'hit';
      break;
  }

  return result;
}

export function getAbilityModifier(abilityValue: number): number {
  return Math.max(-2, Math.min(2, abilityValue));
}
