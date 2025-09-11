
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TemperatureLogForm from './temperature/TemperatureLogForm';
import TemperatureHistory from './temperature/TemperatureHistory';
import { useTemperatureLog } from './temperature/useTemperatureLog';
import { useTranslation } from 'react-i18next';

interface TemperatureLogProps {
  pregnancyId: string;
  femaleName: string;
}

const TemperatureLog: React.FC<TemperatureLogProps> = ({ pregnancyId, femaleName }) => {
  const { t, ready } = useTranslation('pregnancy');
  const { temperatures, addTemperature, updateTemperature, deleteTemperature } = useTemperatureLog(pregnancyId);
  
  if (!ready) {
    return (
      <Card className="bg-white border-sage-200">
        <CardHeader className="border-b border-sage-100">
          <CardTitle className="font-le-jour">Loading...</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-32">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold font-le-jour text-foreground">
          {t('temperature.log.title')}
        </h3>
        <p className="text-muted-foreground">
          {t('temperature.log.description', { femaleName })}
        </p>
      </div>
      
      <TemperatureLogForm onAddTemperature={addTemperature} />
      <TemperatureHistory 
        temperatures={temperatures} 
        onDeleteTemperature={deleteTemperature}
        onUpdateTemperature={updateTemperature}
      />
    </div>
  );
};

export default TemperatureLog;
