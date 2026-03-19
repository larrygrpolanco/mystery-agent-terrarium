import { useState } from 'react';
import type { Maven } from '../engine/types';

interface SetupScreenProps {
  mavens: Maven[];
  onComplete: (paintTheScene: string, establishingAnswer: string, establishingMaven: string) => void;
}

export function SetupScreen({ mavens, onComplete }: SetupScreenProps) {
  const [paintTheScene, setPaintTheScene] = useState('');
  const [establishingAnswer, setEstablishingAnswer] = useState('');
  const [establishingMaven, setEstablishingMaven] = useState('');

  const handleSubmit = () => {
    if (paintTheScene.trim() && establishingAnswer.trim() && establishingMaven) {
      onComplete(paintTheScene, establishingAnswer, establishingMaven);
    }
  };

  const isValid = paintTheScene.trim() && establishingAnswer.trim() && establishingMaven;

  return (
    <div className="setup-screen">
      <h1>The Fish Market Investigation</h1>
      <p className="intro">
        The Murder Mavens have arrived at the Fish Market to investigate Albert Krause's death.
      </p>

      <div className="setup-section">
        <h2>Paint the Scene</h2>
        <p className="question">
          <em>What do you see that reminds you why you love the fish market? Or, what about this place makes you hate coming down here?</em>
        </p>
        <textarea
          value={paintTheScene}
          onChange={(e) => setPaintTheScene(e.target.value)}
          placeholder="Describe the fish market through your Maven's eyes..."
          rows={4}
        />
      </div>

      <div className="setup-section">
        <h2>Establishing Question</h2>
        <p className="question">
          <em>Which Maven remembers meeting a Krause child, and under what circumstances?</em>
        </p>
        
        <select
          value={establishingMaven}
          onChange={(e) => setEstablishingMaven(e.target.value)}
        >
          <option value="">Select a Maven...</option>
          {mavens.map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {establishingMaven && (
          <textarea
            value={establishingAnswer}
            onChange={(e) => setEstablishingAnswer(e.target.value)}
            placeholder={`${mavens.find((m) => m.id === establishingMaven)?.name} recalls...`}
            rows={3}
          />
        )}
      </div>

      <button onClick={handleSubmit} disabled={!isValid}>
        Begin Investigation
      </button>
    </div>
  );
}
