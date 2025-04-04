
import React from 'react';
import { MessageSquare } from 'lucide-react';
import SymptomItem from './SymptomItem';
import { SymptomRecord } from './types';

interface SymptomHistoryProps {
  symptoms: SymptomRecord[];
  onDeleteSymptom: (id: string) => void;
  femaleName: string;
}

const SymptomHistory: React.FC<SymptomHistoryProps> = ({ symptoms, onDeleteSymptom, femaleName }) => {
  if (symptoms.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Observations</h3>
        <p className="text-muted-foreground mb-4">
          Start recording observations to track {femaleName}'s pregnancy
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Observation History</h3>
      <div className="space-y-3">
        {symptoms.map((record) => (
          <SymptomItem 
            key={record.id} 
            record={record} 
            onDelete={onDeleteSymptom} 
          />
        ))}
      </div>
    </div>
  );
};

export default SymptomHistory;
