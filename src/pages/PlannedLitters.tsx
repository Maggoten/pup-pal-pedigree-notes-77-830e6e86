
import React from 'react';
import PageLayout from '@/components/PageLayout';
import PlannedLittersContent from '@/components/planned-litters/components/PlannedLittersContent';
import { useTranslation } from 'react-i18next';

const PlannedLitters: React.FC = () => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <PageLayout 
      title={t('pages.plannedLitters.title')} 
      description={t('pages.plannedLitters.description')}
      className="bg-warmbeige-50 overflow-y-auto"
    >
      <PlannedLittersContent />
    </PageLayout>
  );
};

export default PlannedLitters;
