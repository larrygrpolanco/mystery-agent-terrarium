interface ResolutionViewProps {
  mavenName: string;
  narration: string;
  roll?: number;
  ability?: string;
  total?: number;
  result?: 'hit' | 'partial' | 'miss' | 'critical';
  complication?: string;
  clueText?: string;
  isVoidClue?: boolean;
  onContinue?: () => void;
}

export function ResolutionView({
  mavenName,
  narration,
  roll,
  ability,
  total,
  result,
  complication,
  clueText,
  isVoidClue,
  onContinue,
}: ResolutionViewProps) {
  return (
    <div className="resolution-view">
      <h3>{mavenName}</h3>
      
      {roll !== undefined && ability && (
        <div className="dice-result">
          <span className="roll">{roll}</span>
          <span className="modifier">+ {ability}</span>
          <span className="equals">=</span>
          <span className="total">{total}</span>
          <span className={`result-badge ${result}`}>{result?.toUpperCase()}</span>
        </div>
      )}

      <div className="narration">
        <p>{narration}</p>
      </div>

      {complication && (
        <div className="complication">
          <strong>Complication:</strong> {complication}
        </div>
      )}

      {clueText && (
        <div className={`clue-found ${isVoidClue ? 'void' : ''}`}>
          <strong>{isVoidClue ? 'Void Clue' : 'Clue'} Found:</strong>
          <p>{clueText}</p>
        </div>
      )}

      {onContinue && (
        <button onClick={onContinue}>Continue</button>
      )}
    </div>
  );
}
