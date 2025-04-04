
import React from 'react';
import { LitterFilterProvider } from '@/components/litters/LitterFilterProvider';
import MyLittersContent from '@/components/litters/MyLittersContent';

const MyLitters: React.FC = () => {
  return (
    <LitterFilterProvider>
      <MyLittersContent />
    </LitterFilterProvider>
  );
};

export default MyLitters;
