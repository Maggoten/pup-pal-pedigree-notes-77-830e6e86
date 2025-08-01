
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
  const { temperatures, addTemperature, deleteTemperature } = useTemperatureLog(pregnancyId);
  
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
    <Card className="bg-white border-sage-200">
      <CardHeader className="border-b border-sage-100">
        <CardTitle className="font-le-jour">{t('temperature.log.title')}</CardTitle>
        <CardDescription>{t('temperature.log.description', { femaleName })}</CardDescription>
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
