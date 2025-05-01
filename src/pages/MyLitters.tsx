
import React from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import MyLittersContent from '@/components/litters/MyLittersContent';
import PageLayout from '@/components/PageLayout';
import { Heart } from 'lucide-react';

const MyLitters: React.FC = () => {
  return (
    <PageLayout
      title="My Litters"
      description="Track and manage your litters and puppies"
      icon={<Heart className="h-6 w-6" />}
    >
      <div className="bg-greige-50">
        <LitterFilterProvider>
          <MyLittersContent />
        </LitterFilterProvider>
      </div>
    </PageLayout>
  );
};

export default MyLitters;
