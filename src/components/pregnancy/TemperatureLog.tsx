
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TemperatureLogForm from './temperature/TemperatureLogForm';
import TemperatureHistory from './temperature/TemperatureHistory';
import { useTemperatureLog } from './temperature/useTemperatureLog';

interface TemperatureLogProps {
  pregnancyId: string;
  femaleName: string;
}

const TemperatureLog: React.FC<TemperatureLogProps> = ({ pregnancyId, femaleName }) => {
  const { temperatures, addTemperature, deleteTemperature } = useTemperatureLog(pregnancyId);
  
  return (
    <Card className="bg-white border-sage-200">
      <CardHeader className="border-b border-sage-100">
        <CardTitle className="font-le-jour">Temperature Log</CardTitle>
        <CardDescription>Track {femaleName}'s body temperature</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <TemperatureLogForm onAddTemperature={addTemperature} />
          <TemperatureHistory 
            temperatures={temperatures} 
            onDeleteTemperature={deleteTemperature} 
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TemperatureLog;
