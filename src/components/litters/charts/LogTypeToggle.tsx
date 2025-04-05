
import React from 'react';
import { LogTypeToggleProps } from './types';

const LogTypeToggle: React.FC<LogTypeToggleProps> = ({ 
  logType, 
  setLogType 
}) => {
  return (
    <div className="flex gap-2 justify-end">
      <button 
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'weight' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
        onClick={() => setLogType('weight')}
      >
        Weight
      </button>
      <button 
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'height' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
        onClick={() => setLogType('height')}
      >
        Height
      </button>
    </div>
  );
};

export default LogTypeToggle;
