
import React, { useEffect } from 'react';
import PlannedLittersList from '@/components/planned-litters/PlannedLittersList';
import MatingSection from '@/components/planned-litters/mating/MatingSection';
import { usePlannedLitters } from '../hooks/usePlannedLitters';
import { HeatService } from '@/services/HeatService';

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
    handleDeleteLitter,
    refreshLitters
  } = usePlannedLitters();


  const handleHeatDeleted = () => {
    // Refresh data after a heat entry is deleted
    refreshLitters();
  };

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
        onHeatDeleted={handleHeatDeleted}
      />
    </>
  );
};

export default PlannedLittersContent;
