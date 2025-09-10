
import React from 'react';
import PlannedLittersList from '@/components/planned-litters/PlannedLittersList';
import EnhancedMatingSection from '@/components/planned-litters/mating/EnhancedMatingSection';
import PlannedLittersHero from './PlannedLittersHero';
import { usePlannedLitters } from '../hooks/usePlannedLitters';

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
    <div className="space-y-8">
      {/* Hero Section */}
      <PlannedLittersHero />
      
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
      
      {/* Enhanced Mating Section */}
      <EnhancedMatingSection 
        upcomingHeats={upcomingHeats}
        recentMatings={recentMatings}
        onHeatDeleted={handleHeatDeleted}
      />
    </div>
  );
};

export default PlannedLittersContent;
