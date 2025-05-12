
import React from 'react';
import PageLayout from '@/components/PageLayout';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import MyLittersContent from '@/components/litters/MyLittersContent';
import { Archive } from 'lucide-react';

const MyLitters: React.FC = () => {
  return (
    <PageLayout 
      title="My Litters" 
      description="Manage and track litters and puppies"
      icon={<Archive className="h-6 w-6" />}
    >
      <LitterFilterProvider>
        <MyLittersContent />
      </LitterFilterProvider>
    </PageLayout>
  );
};

export default MyLitters;
