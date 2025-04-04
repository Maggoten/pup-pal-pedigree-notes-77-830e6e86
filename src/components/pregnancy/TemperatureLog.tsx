
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
    <Card>
      <CardHeader>
        <CardTitle>Temperature Log</CardTitle>
        <CardDescription>Track {femaleName}'s body temperature</CardDescription>
      </CardHeader>
      <CardContent>
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
