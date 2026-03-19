# Brindlewood Bay Fish Market Investigation Prototype

## Goal
Learn and test the AI-driven Maven agent architecture. Find what works, what doesn't, then scrap and iterate with lessons learned.

---

## Phase 1: Foundation & Data Layer

### Create types, data files, and core engine logic

- [ ] `src/engine/types.ts` — all interfaces (GameState, Clue, Maven, ActionProposal, BeliefState, etc.)
- [ ] `src/engine/dice.ts` — roll2d6(), resolveMove()
- [ ] `src/engine/game-state.ts` — createInitialState(), state update helpers
- [ ] `src/data/mavens.json` — Birdie, Pearl, Doris profiles with stats and voice
- [ ] `src/data/suspects.json` — Etienne, Sara profiles
- [ ] `src/data/location.json` — Fish Market description
- [ ] `src/data/clue-pool.json` — 21 regular clues (fix duplicate clue-11/21)
- [ ] `src/data/void-pool.json` — 6 void clues
- [ ] `src/api/anthropic.ts` — thin fetch wrapper for Claude API

**Review:** Manual check of JSON data against README spec + type definitions

---

## Phase 2: Prompt Engine

### Build prompt-builder and response-parser — the core of Maven behavior

- [ ] `src/engine/prompt-builder.ts` — assemble prompts for all 6 types:
  - Action proposal
  - Basic resolution
  - Meddling resolution
  - Day move resolution
  - Cozy resolution
  - Belief update
- [ ] `src/engine/response-parser.ts` — parse LLM JSON responses into typed data
- [ ] Manual inspection of prompt output for each type

**Review:** Manual inspection of prompt output for each type (action proposal, resolution, belief update)

---

## Phase 3: UI Components

### Build all React components

- [ ] `SetupScreen.tsx` — Paint the Scene + establishing question
- [ ] `SceneHeader.tsx` — location, suspects, cycle count
- [ ] `MavenPicker.tsx` — pick who acts
- [ ] `ActionProposals.tsx` — show 2-3 options
- [ ] `ResolutionView.tsx` — narration + dice result
- [ ] `ClueCuration.tsx` — clue pool + placement input
- [ ] `ClueBoard.tsx` — discovered clues display
- [ ] `MavenThoughts.tsx` — belief states
- [ ] `DayMoveChoice.tsx` — push through/back down
- [ ] `DevLog.tsx` — debug panel with prompts/responses

**Review:** Verify UI matches README layout (left main panel, right side panel with thoughts + dev log)

---

## Phase 4: Integration & Wiring

### Connect everything in App.tsx + test the full game loop

- [ ] Wire up all components in `App.tsx`
- [ ] Connect LLM calls to game actions
- [ ] Test full turn cycle: pick Maven → get proposals → pick action → see resolution → belief update

**Review:** Manual playtest of 2-3 full turns to verify game loop works

---

## Phase 5: Tuning & Validation

### Verify Maven distinctiveness and authored context ripples

- [ ] Test with different Paint the Scene inputs
- [ ] Test with different establishing answers
- [ ] Verify Birdie/Pearl/Doris behave differently
- [ ] Check that discovered clues reference earlier events

**Review:** This is the "did it work?" check per README success criteria

---

## What's Deferred (Keep It Simple)

- Backend server / Hono API
- Persistence / database
- Multiple locations
- Theorize phase
- Language learning layer
- Pretty UI / styling
- Maven signature moves
- Deployment

---

## Success Criteria

1. Start a session by writing a Paint the Scene description and answering the establishing question
2. Pick a Maven, see 2-3 in-character action proposals
3. Pick an action, see a dice roll and narrated outcome
4. On a successful Meddling roll, pick a clue from the pool and write placement context
5. See the Maven's belief state update after the action
6. Repeat for several turns and see the Mavens reference earlier events and authored details
7. Observe that Birdie, Pearl, and Doris genuinely behave differently

**Primary success criteria:** Do the Mavens feel like distinct characters telling a coherent story together?
