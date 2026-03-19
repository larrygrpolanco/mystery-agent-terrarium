import type { Maven } from '../engine/types';

interface MavenPickerProps {
  mavens: Maven[];
  currentMaven: string | null;
  conditions: Record<string, string[]>;
  onSelect: (mavenId: string) => void;
  disabled?: boolean;
}

export function MavenPicker({ mavens, currentMaven, conditions, onSelect, disabled }: MavenPickerProps) {
  return (
    <div className="maven-picker">
      <h3>Who takes action?</h3>
      <div className="maven-buttons">
        {mavens.map((maven) => {
          const mavenConditions = conditions[maven.id] || [];
          const isSelected = currentMaven === maven.id;
          return (
            <button
              key={maven.id}
              onClick={() => onSelect(maven.id)}
              disabled={disabled || isSelected}
              className={isSelected ? 'selected' : ''}
            >
              <span className="maven-name">{maven.name}</span>
              <span className="maven-style">{maven.style.split(',')[0]}</span>
              {mavenConditions.length > 0 && (
                <span className="maven-conditions">
                  {mavenConditions.join(', ')}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
