import type { Maven, BeliefState } from '../engine/types';

interface MavenThoughtsProps {
  maven: Maven;
  belief: BeliefState;
  conditions: string[];
}

export function MavenThoughts({ maven, belief, conditions }: MavenThoughtsProps) {
  const getThoughtPreview = () => {
    if (belief.suspect) {
      return `Suspects: ${belief.suspect}`;
    }
    return 'No strong suspicions yet...';
  };

  return (
    <div className="maven-thoughts">
      <div className="thought-header">
        <span className="maven-name">{maven.name}</span>
        {conditions.length > 0 && (
          <span className="conditions">{conditions.join(', ')}</span>
        )}
      </div>
      <div className="thought-content">
        <p className="thought-preview">{getThoughtPreview()}</p>
        {belief.reasoning && (
          <p className="thought-reasoning">{belief.reasoning}</p>
        )}
        {belief.questions.length > 0 && (
          <p className="thought-questions">
            <em>Questions: {belief.questions.join(', ')}</em>
          </p>
        )}
      </div>
    </div>
  );
}
