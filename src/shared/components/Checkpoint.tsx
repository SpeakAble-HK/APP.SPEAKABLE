import React from 'react';

type CheckpointProps = {
  active: boolean;
  completed: boolean;
  onClick: () => void;
  label: string;
  compact?: boolean;
};

const Checkpoint: React.FC<CheckpointProps> = ({ active, completed, onClick, label, compact = false }) => {
  return (
    <button
      style={{
        background: completed ? '#4caf50' : active ? '#2196f3' : '#eee',
        color: completed || active ? '#fff' : '#333',
        border: '2px solid #2196f3',
        borderRadius: 8,
        padding: compact ? '7px 10px' : '8px 16px',
        cursor: 'pointer',
        fontWeight: active ? 'bold' : 600,
        opacity: completed ? 0.7 : 1,
        fontSize: compact ? 12 : 14,
        whiteSpace: 'nowrap',
        boxShadow: active ? '0 8px 18px rgba(2, 132, 199, 0.28)' : 'none',
      }}
      onClick={onClick}
      disabled={completed}
    >
      {label}
    </button>
  );
};

export default Checkpoint;
