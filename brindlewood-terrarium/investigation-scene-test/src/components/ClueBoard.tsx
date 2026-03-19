import type { DiscoveredClue } from '../engine/types';

interface ClueBoardProps {
  discoveredClues: DiscoveredClue[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function ClueBoard({ discoveredClues, isExpanded, onToggle }: ClueBoardProps) {
  if (discoveredClues.length === 0) {
    return (
      <div className="clue-board empty">
        <h4>Clue Board</h4>
        <p className="empty-state">No clues discovered yet.</p>
      </div>
    );
  }

  return (
    <div className={`clue-board ${isExpanded ? 'expanded' : ''}`}>
      <h4 onClick={onToggle} className="collapsible-header">
        Clue Board ({discoveredClues.length})
        {onToggle && <span className="toggle">{isExpanded ? '▼' : '▶'}</span>}
      </h4>
      
      {(isExpanded || !onToggle) && (
        <div className="clue-list">
          {discoveredClues.map((clue) => (
            <div key={clue.id} className="clue-card">
              <p className="clue-text">{clue.text}</p>
              <p className="clue-placement">
                <em>{clue.placementContext}</em>
              </p>
              <span className="clue-meta">
                Found by {clue.discoveredBy} (Cycle {clue.turnNumber})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
