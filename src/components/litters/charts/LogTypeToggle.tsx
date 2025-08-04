
import React from 'react';
import { LogTypeToggleProps } from './types';
import { useTranslation } from 'react-i18next';

const LogTypeToggle: React.FC<LogTypeToggleProps> = ({ 
  logType, 
  setLogType 
}) => {
  const { t } = useTranslation('litters');
  
  return (
    <div className="flex gap-2 justify-end">
      <button 
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'weight' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
        onClick={() => setLogType('weight')}
      >
        {t('charts.toggle.weight')}
      </button>
      <button 
        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${logType === 'height' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
        onClick={() => setLogType('height')}
      >
        {t('charts.toggle.height')}
      </button>
    </div>
  );
};

export default LogTypeToggle;
