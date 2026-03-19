import { useState } from 'react';
import type { Clue } from '../engine/types';

interface ClueCurationProps {
  remainingClues: Clue[];
  isVoid?: boolean;
  onSelect: (clue: Clue, placementContext: string) => void;
  onSkip?: () => void;
}

export function ClueCuration({ remainingClues, isVoid, onSelect, onSkip }: ClueCurationProps) {
  const [selectedClue, setSelectedClue] = useState<Clue | null>(null);
  const [placement, setPlacement] = useState('');

  const handleSubmit = () => {
    if (selectedClue && placement.trim()) {
      onSelect(selectedClue, placement);
    }
  };

  return (
    <div className="clue-curation">
      <h3>Curate the {isVoid ? 'Void ' : ''}Clue</h3>
      <p className="instruction">
        Choose a clue from the pool and describe where/how {isVoid ? 'the unsettling detail' : 'it'} appears in the scene.
      </p>

      <div className="clue-pool">
        <h4>Available Clues</h4>
        <div className="clue-list">
          {remainingClues.map((clue) => (
            <button
              key={clue.id}
              onClick={() => setSelectedClue(clue)}
              className={selectedClue?.id === clue.id ? 'selected' : ''}
            >
              {clue.text}
            </button>
          ))}
        </div>
      </div>

      {selectedClue && (
        <div className="placement-input">
          <h4>Placement Context</h4>
          <textarea
            value={placement}
            onChange={(e) => setPlacement(e.target.value)}
            placeholder="Describe where and how this clue appears..."
            rows={3}
          />
        </div>
      )}

      <div className="curation-actions">
        <button
          onClick={handleSubmit}
          disabled={!selectedClue || !placement.trim()}
        >
          Confirm Clue
        </button>
        {onSkip && (
          <button onClick={onSkip} className="secondary">
            Skip Clue
          </button>
        )}
      </div>
    </div>
  );
}
