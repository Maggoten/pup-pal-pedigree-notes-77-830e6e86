
import React from 'react';
import { MessageSquare, PawPrint } from 'lucide-react';
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
      <div className="text-center py-10 px-6 bg-blush-50/50 border border-dashed border-blush-200 rounded-lg">
        <div className="relative mx-auto w-16 h-16 mb-4">
          <div className="absolute inset-0 bg-blush-100 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <MessageSquare className="h-8 w-8 text-blush-500" />
          </div>
          <div className="absolute -bottom-1 -right-1">
            <PawPrint className="h-5 w-5 text-blush-400" />
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2">No Observations</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Start recording observations to track {femaleName}'s pregnancy journey and keep a detailed health log
        </p>
        
        {/* Decorative pawprints */}
        <div className="flex justify-center space-x-6 opacity-30">
          <PawPrint className="h-5 w-5 transform rotate-[-15deg]" />
          <PawPrint className="h-5 w-5" />
          <PawPrint className="h-5 w-5 transform rotate-[15deg]" />
        </div>
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
