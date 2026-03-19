import { useState } from 'react';
import type { GameState } from '../engine/types';

interface DevLogProps {
  gameState: GameState;
  lastPrompt?: string;
  lastResponse?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function DevLog({ gameState, lastPrompt, lastResponse, isExpanded, onToggle }: DevLogProps) {
  const [showRawPrompt, setShowRawPrompt] = useState(false);

  return (
    <div className={`dev-log ${isExpanded ? 'expanded' : ''}`}>
      <h4 onClick={onToggle} className="collapsible-header">
        Dev Log
        {onToggle && <span className="toggle">{isExpanded ? '▼' : '▶'}</span>}
      </h4>

      {isExpanded && (
        <div className="dev-log-content">
          <section>
            <h5>Game State</h5>
            <pre>{JSON.stringify(gameState, null, 2)}</pre>
          </section>

          {lastPrompt && (
            <section>
              <h5 onClick={() => setShowRawPrompt(!showRawPrompt)} className="collapsible-header">
                Last Prompt {showRawPrompt ? '▼' : '▶'}
              </h5>
              {showRawPrompt && <pre>{lastPrompt}</pre>}
            </section>
          )}

          {lastResponse && (
            <section>
              <h5>Last Response</h5>
              <pre>{lastResponse}</pre>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
