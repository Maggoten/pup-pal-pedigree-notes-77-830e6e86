import React from 'react';
import { Puppy, Litter } from '@/types/breeding';
import WeeklyPhotosSection from '../weekly-photos/WeeklyPhotosSection';

interface PuppyDevelopmentTabProps {
  puppy: Puppy;
  litter?: Litter;
  onUpdatePuppy: (puppy: Puppy) => void;
}

const PuppyDevelopmentTab: React.FC<PuppyDevelopmentTabProps> = ({ 
  puppy, 
  litter, 
  onUpdatePuppy 
}) => {
  return (
    <WeeklyPhotosSection 
      puppy={puppy} 
      litter={litter}
      onUpdate={onUpdatePuppy}
    />
  );
};

export default PuppyDevelopmentTab;