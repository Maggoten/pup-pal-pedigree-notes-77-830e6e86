
import React from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import MyLittersContent from '@/components/litters/MyLittersContent';

const MyLitters: React.FC = () => {
  return (
    <div className="bg-greige-50">
      <LitterFilterProvider>
        <MyLittersContent />
      </LitterFilterProvider>
    </div>
  );
};

export default MyLitters;
