
import React from 'react';
import { Thermometer } from 'lucide-react';
import TemperatureItem from './TemperatureItem';
import { TemperatureRecord } from './types';

interface TemperatureHistoryProps {
  temperatures: TemperatureRecord[];
  onDeleteTemperature: (id: string) => void;
}

const TemperatureHistory: React.FC<TemperatureHistoryProps> = ({ temperatures, onDeleteTemperature }) => {
  if (temperatures.length === 0) {
    return (
      <div className="text-center py-8">
        <Thermometer className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Temperature Records</h3>
        <p className="text-muted-foreground mb-4">
          Start recording temperature to track changes
        </p>
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
          />
        ))}
      </div>
    </div>
  );
};

export default TemperatureHistory;
