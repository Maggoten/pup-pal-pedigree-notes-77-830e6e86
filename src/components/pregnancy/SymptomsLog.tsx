
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SymptomLogForm from './symptoms/SymptomLogForm';
import SymptomHistory from './symptoms/SymptomHistory';
import { useSymptomLog } from './symptoms/useSymptomLog';
import { useTranslation } from 'react-i18next';

interface SymptomsLogProps {
  pregnancyId: string;
  femaleName: string;
}

const SymptomsLog: React.FC<SymptomsLogProps> = ({ pregnancyId, femaleName }) => {
  const { t, ready } = useTranslation('pregnancy');
  const { symptoms, addSymptom, updateSymptom, deleteSymptom } = useSymptomLog(pregnancyId, femaleName);
  
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
          {t('symptoms.log.title')}
        </h3>
        <p className="text-muted-foreground">
          {t('symptoms.log.description', { femaleName })}
        </p>
      </div>
      
      <SymptomLogForm onAddSymptom={addSymptom} />
      <SymptomHistory 
        symptoms={symptoms}
        onDeleteSymptom={deleteSymptom}
        onUpdateSymptom={updateSymptom}
        femaleName={femaleName}
      />
    </div>
  );
};

export default SymptomsLog;
