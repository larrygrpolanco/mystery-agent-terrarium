import type { ActionProposal } from '../engine/types';

interface ActionProposalsProps {
  mavenName: string;
  proposals: ActionProposal[];
  onSelect: (proposal: ActionProposal) => void;
  isLoading?: boolean;
}

const moveTypeLabels: Record<ActionProposal['moveType'], string> = {
  basic: 'Basic (Auto-succeed)',
  meddling: 'Meddling (Risk/Reward)',
  day: 'Day Move (Risky)',
  cozy: 'Cozy (Social Bonding)',
};

export function ActionProposals({ mavenName, proposals, onSelect, isLoading }: ActionProposalsProps) {
  if (isLoading) {
    return (
      <div className="action-proposals loading">
        <p>{mavenName} is considering options...</p>
      </div>
    );
  }

  return (
    <div className="action-proposals">
      <h3>{mavenName} proposes:</h3>
      <div className="proposal-list">
        {proposals.map((proposal, index) => (
          <button
            key={proposal.id || index}
            onClick={() => onSelect(proposal)}
            className="proposal-card"
          >
            <p className="proposal-dialogue">"{proposal.mavenSays}"</p>
            <div className="proposal-meta">
              <span className="move-type">{moveTypeLabels[proposal.moveType]}</span>
              <span className="target">→ {proposal.target}</span>
              {proposal.ability && (
                <span className="ability">{proposal.ability}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
