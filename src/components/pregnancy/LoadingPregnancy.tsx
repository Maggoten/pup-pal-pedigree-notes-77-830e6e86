
import React from 'react';
import { PawPrint } from 'lucide-react';
import PageLayout from '@/components/PageLayout';
import { useTranslation } from 'react-i18next';

const LoadingPregnancy: React.FC = () => {
  const { t, ready } = useTranslation('pregnancy');

  return (
    <PageLayout
      title={ready ? t('loading.title') : 'Loading...'}
      description={ready ? t('loading.message') : 'Loading...'}
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </PageLayout>
  );
};

export default LoadingPregnancy;
