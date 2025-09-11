
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
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white/80 backdrop-blur-sm border-sage-200 shadow-lg rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-sage-50 to-greige-50 border-b border-sage-100 pb-6">
          <CardTitle className="font-le-jour text-2xl sm:text-3xl text-sage-800">
            {t('temperature.log.title')}
          </CardTitle>
          <CardDescription className="text-sage-600 text-base sm:text-lg mt-2">
            {t('temperature.log.description', { femaleName })}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-8">
            <TemperatureLogForm onAddTemperature={addTemperature} />
            <div className="border-t border-sage-100 pt-8">
              <TemperatureHistory 
                temperatures={temperatures} 
                onDeleteTemperature={deleteTemperature}
                onUpdateTemperature={updateTemperature}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemperatureLog;
