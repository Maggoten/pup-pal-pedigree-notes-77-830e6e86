
import React from 'react';
import PlannedLittersList from '@/components/planned-litters/PlannedLittersList';
import MatingSection from '@/components/planned-litters/MatingSection';
import { usePlannedLitters } from '../hooks/usePlannedLitters';
import { RecentMating } from '../types';

const PlannedLittersContent: React.FC = () => {
  const {
    plannedLitters,
    upcomingHeats,
    recentMatings,
    males,
    females,
    handleAddPlannedLitter,
    handleAddMatingDate,
    handleEditMatingDate,
    handleDeleteMatingDate,
    handleDeleteLitter
  } = usePlannedLitters();

  return (
    <>
      {/* Planned Litters Section */}
      <PlannedLittersList 
        plannedLitters={plannedLitters}
        males={males}
        females={females}
        onAddPlannedLitter={handleAddPlannedLitter}
        onAddMatingDate={handleAddMatingDate}
        onEditMatingDate={handleEditMatingDate}
        onDeleteMatingDate={handleDeleteMatingDate}
        onDeleteLitter={handleDeleteLitter}
      />
      
      {/* Mating Section */}
      <MatingSection 
        upcomingHeats={upcomingHeats}
        recentMatings={recentMatings}
      />
    </>
  );
};

export default PlannedLittersContent;
