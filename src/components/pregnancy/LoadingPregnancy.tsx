
import React from 'react';
import { PawPrint } from 'lucide-react';
import PageLayout from '@/components/PageLayout';

const LoadingPregnancy: React.FC = () => {
  return (
    <PageLayout
      title="Loading Pregnancy Details"
      description="Please wait..."
      icon={<PawPrint className="h-6 w-6" />}
    >
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </PageLayout>
  );
};

export default LoadingPregnancy;
