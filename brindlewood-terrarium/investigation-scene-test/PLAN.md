# Brindlewood Bay Fish Market Investigation Prototype

## Goal
Learn and test the AI-driven Maven agent architecture. Find what works, what doesn't, then scrap and iterate with lessons learned.

---

## Phase 1: Foundation & Data Layer ✅

### Create types, data files, and core engine logic

- [x] `src/engine/types.ts` — all interfaces (GameState, Clue, Maven, ActionProposal, BeliefState, etc.)
- [x] `src/engine/dice.ts` — roll2d6(), resolveMove()
- [x] `src/engine/game-state.ts` — createInitialState(), state update helpers
- [x] `src/data/mavens.json` — Birdie, Pearl, Doris profiles with stats and voice
- [x] `src/data/suspects.json` — Etienne, Sara profiles
- [x] `src/data/location.json` — Fish Market description
- [x] `src/data/clue-pool.json` — 21 regular clues (fixed duplicate clue-11/21 → clue-21 is now "Signs of a struggle on the deck of The Regal Lady")
- [x] `src/data/void-pool.json` — 6 void clues
- [x] `src/api/anthropic.ts` — thin fetch wrapper for Claude API (later updated to OpenRouter for multi-LLM support)
- [x] `.env.example` — API key template

**Review:** Manual check of JSON data against README spec + type definitions ✅

---

## Phase 2: Prompt Engine ✅

### Build prompt-builder and response-parser — the core of Maven behavior

- [x] `src/engine/prompt-builder.ts` — assemble prompts for all 6 types:
  - Action proposal
  - Basic resolution
  - Meddling resolution
  - Day move resolution
  - Cozy resolution
  - Belief update
- [x] `src/engine/response-parser.ts` — parse LLM JSON responses into typed data
- [ ] Manual inspection of prompt output for each type

**Review:** Manual inspection of prompt output for each type (action proposal, resolution, belief update)

---

## Phase 3: UI Components ✅

### Build all React components

- [x] `SetupScreen.tsx` — Paint the Scene + establishing question
- [x] `SceneHeader.tsx` — location, suspects, cycle count
- [x] `MavenPicker.tsx` — pick who acts
- [x] `ActionProposals.tsx` — show 2-3 options
- [x] `ResolutionView.tsx` — narration + dice result
- [x] `ClueCuration.tsx` — clue pool + placement input
- [x] `ClueBoard.tsx` — discovered clues display
- [x] `MavenThoughts.tsx` — belief states
- [x] `DayMoveChoice.tsx` — push through/back down
- [x] `DevLog.tsx` — debug panel with prompts/responses

**Review:** Verify UI matches README layout (left main panel, right side panel with thoughts + dev log)

---

## Phase 4: Integration & Wiring ✅

### Connect everything in App.tsx + test the full game loop

- [x] Wire up all components in `App.tsx`
- [x] Connect LLM calls to game actions
- [x] Two-column layout (main panel + side panel with thoughts/devlog)
- [x] Basic CSS styling in `App.css`
- [ ] Test full turn cycle: pick Maven → get proposals → pick action → see resolution → belief update

**Review:** Manual playtest of 2-3 full turns to verify game loop works

---

## Phase 5: Tuning & Validation ⏳

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

---

## Configuration

### LLM Provider

Currently using **OpenRouter** for multi-LLM support. Edit `src/api/anthropic.ts` to switch models:

```typescript
const CONFIG = {
  provider: 'openrouter', // 'openrouter' or 'anthropic'
  openrouter: {
    apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
    model: 'nvidia/nemotron-3-super-120b-a12b:free', // or 'minimax/minimax-m2.5:free'
  },
  anthropic: {
    apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
    model: 'claude-3-haiku-20240307',
  },
};
```

### Environment Variables

Create `.env` from `.env.example`:
```
VITE_OPENROUTER_API_KEY=sk-or-your-key-here
VITE_ANTHROPIC_API_KEY=sk-ant-your-key-here
```
