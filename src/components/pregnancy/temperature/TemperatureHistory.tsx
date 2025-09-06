
import React from 'react';
import { Thermometer, TrendingUp } from 'lucide-react';
import TemperatureItem from './TemperatureItem';
import { TemperatureRecord } from './types';

interface TemperatureHistoryProps {
  temperatures: TemperatureRecord[];
  onDeleteTemperature: (id: string) => void;
  onUpdateTemperature: (id: string, updates: Partial<Omit<TemperatureRecord, 'id'>>) => void;
}

const TemperatureHistory: React.FC<TemperatureHistoryProps> = ({ temperatures, onDeleteTemperature, onUpdateTemperature }) => {
  if (temperatures.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-sage-50/50 border border-dashed border-sage-200 rounded-lg">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-sage-100 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Thermometer className="h-8 w-8 text-sage-500" />
          </div>
          <div className="absolute -top-1 -right-1">
            <TrendingUp className="h-5 w-5 text-sage-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2">No Temperature Records</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start recording temperature to track changes and monitor your dog's pregnancy progress
        </p>
        
        {/* Decorative temperature gauge */}
        <div className="mx-auto w-32 h-2 bg-sage-100 rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-sage-300 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Temperature History</h3>
      <div className="space-y-3">
        {temperatures.map((record) => (
          <TemperatureItem 
            key={record.id} 
            record={record} 
            onDelete={onDeleteTemperature}
            onUpdate={onUpdateTemperature}
          />
        ))}
      </div>
    </div>
  );
};

export default TemperatureHistory;
