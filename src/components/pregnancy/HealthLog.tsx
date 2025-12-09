import React, { useState } from 'react';
import { Thermometer, Scale } from 'lucide-react';
import TemperatureLogForm from './temperature/TemperatureLogForm';
import TemperatureHistory from './temperature/TemperatureHistory';
import { useTemperatureLog } from './temperature/useTemperatureLog';
import WeightLogForm from './weight/WeightLogForm';
import WeightHistory from './weight/WeightHistory';
import { useWeightLog } from './weight/useWeightLog';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface HealthLogProps {
  pregnancyId: string;
  femaleName: string;
}

type HealthTab = 'temperature' | 'weight';

const HealthLog: React.FC<HealthLogProps> = ({ pregnancyId, femaleName }) => {
  const { t, ready } = useTranslation('pregnancy');
  const [activeTab, setActiveTab] = useState<HealthTab>('temperature');
  
  const { 
    temperatures, 
    addTemperature, 
    updateTemperature, 
    deleteTemperature 
  } = useTemperatureLog(pregnancyId);
  
  const { 
    weights, 
    addWeight, 
    deleteWeight 
  } = useWeightLog(pregnancyId);
  
  if (!ready) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold font-le-jour text-foreground">
          {t('health.title')}
        </h3>
        <p className="text-muted-foreground">
          {t('health.description', { femaleName })}
        </p>
      </div>
      
      {/* Segmented Control */}
      <div className="flex bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('temperature')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
            activeTab === 'temperature'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Thermometer className="h-4 w-4" />
          <span>{t('health.segments.temperature')}</span>
          {temperatures.length > 0 && (
            <span className={cn(
              "ml-1 px-1.5 py-0.5 text-xs rounded-full",
              activeTab === 'temperature'
                ? "bg-primary/10 text-primary"
                : "bg-muted-foreground/20 text-muted-foreground"
            )}>
              {temperatures.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('weight')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all",
            activeTab === 'weight'
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Scale className="h-4 w-4" />
          <span>{t('health.segments.weight')}</span>
          {weights.length > 0 && (
            <span className={cn(
              "ml-1 px-1.5 py-0.5 text-xs rounded-full",
              activeTab === 'weight'
                ? "bg-primary/10 text-primary"
                : "bg-muted-foreground/20 text-muted-foreground"
            )}>
              {weights.length}
            </span>
          )}
        </button>
      </div>
      
      {/* Content */}
      {activeTab === 'temperature' ? (
        <div className="space-y-6">
          <TemperatureLogForm onAddTemperature={addTemperature} />
          <TemperatureHistory 
            temperatures={temperatures} 
            onDeleteTemperature={deleteTemperature}
            onUpdateTemperature={updateTemperature}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <WeightLogForm onAddWeight={addWeight} />
          <WeightHistory 
            weights={weights} 
            onDeleteWeight={deleteWeight}
          />
        </div>
      )}
    </div>
  );
};

export default HealthLog;
