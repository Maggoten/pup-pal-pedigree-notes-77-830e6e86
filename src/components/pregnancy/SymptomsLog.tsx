
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SymptomLogForm from './symptoms/SymptomLogForm';
import SymptomHistory from './symptoms/SymptomHistory';
import { useSymptomLog } from './symptoms/useSymptomLog';

interface SymptomsLogProps {
  pregnancyId: string;
  femaleName: string;
}

const SymptomsLog: React.FC<SymptomsLogProps> = ({ pregnancyId, femaleName }) => {
  const { symptoms, addSymptom, deleteSymptom } = useSymptomLog(pregnancyId, femaleName);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes & Symptoms</CardTitle>
        <CardDescription>Record observations during {femaleName}'s pregnancy</CardDescription>
      </CardHeader>
      <CardContent>
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
