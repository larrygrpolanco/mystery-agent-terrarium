import type { Suspect } from '../engine/types';

interface SceneHeaderProps {
  locationName: string;
  suspects: Suspect[];
  cycleNumber: number;
  dayNight: 'day' | 'night';
}

export function SceneHeader({ locationName, suspects, cycleNumber, dayNight }: SceneHeaderProps) {
  return (
    <div className="scene-header">
      <div className="location-badge">
        <h2>{locationName}</h2>
        <span className="day-night">{dayNight === 'day' ? '☀️ Day' : '🌙 Night'}</span>
      </div>
      <div className="suspects-present">
        <strong>Present:</strong> {suspects.map((s) => s.name).join(', ')}
      </div>
      <div className="cycle-count">
        Cycle {cycleNumber}
      </div>
    </div>
  );
}
