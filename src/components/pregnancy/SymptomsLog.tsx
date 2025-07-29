
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
  const { t } = useTranslation('pregnancy');
  const { symptoms, addSymptom, deleteSymptom } = useSymptomLog(pregnancyId, femaleName);
  
  return (
    <Card className="bg-white border-sage-200">
      <CardHeader className="border-b border-sage-100">
        <CardTitle className="font-le-jour">{t('symptoms.log.title')}</CardTitle>
        <CardDescription>{t('symptoms.log.description', { femaleName })}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid gap-6">
          <SymptomLogForm onAddSymptom={addSymptom} />
          <SymptomHistory 
            symptoms={symptoms}
            onDeleteSymptom={deleteSymptom}
            femaleName={femaleName}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomsLog;
