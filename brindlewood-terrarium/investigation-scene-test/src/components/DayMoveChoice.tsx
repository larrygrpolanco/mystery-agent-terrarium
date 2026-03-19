interface DayMoveChoiceProps {
  mavenName: string;
  vulnerability: string;
  onChoice: (pushThrough: boolean) => void;
}

export function DayMoveChoice({ mavenName, vulnerability, onChoice }: DayMoveChoiceProps) {
  return (
    <div className="day-move-choice">
      <h3>{mavenName} Faces a Choice</h3>
      <div className="vulnerability">
        <p>{vulnerability}</p>
      </div>
      <p className="instruction">What do you do?</p>
      <div className="choice-buttons">
        <button onClick={() => onChoice(true)} className="push-through">
          Push Through
        </button>
        <button onClick={() => onChoice(false)} className="back-down">
          Back Down
        </button>
      </div>
    </div>
  );
}
