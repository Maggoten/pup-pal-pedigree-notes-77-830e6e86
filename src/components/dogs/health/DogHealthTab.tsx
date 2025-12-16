import React from 'react';
import { Dog } from '@/types/dogs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import VaccinationSection from './VaccinationSection';
import HealthTestsSection from './HealthTestsSection';
import DogMeasurementsSection from './DogMeasurementsSection';
import HealthNotesSection from './HealthNotesSection';

interface DogHealthTabProps {
  dog: Dog;
  onDogUpdate?: () => void;
}

const DogHealthTab: React.FC<DogHealthTabProps> = ({ dog, onDogUpdate }) => {
  const { t } = useTranslation('dogs');
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Stethoscope className="h-5 w-5" />
            {t('health.title', 'Health')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Vaccinations & Deworming */}
          <VaccinationSection dog={dog} userId={user?.id} onUpdate={onDogUpdate} />
          
          {/* Health Tests */}
          <HealthTestsSection dog={dog} onUpdate={onDogUpdate} />
          
          {/* Weight & Height */}
          <DogMeasurementsSection dog={dog} />
          
          {/* Health Notes */}
          <HealthNotesSection dog={dog} onUpdate={onDogUpdate} />
        </CardContent>
      </Card>
    </div>
  );
};

export default DogHealthTab;
