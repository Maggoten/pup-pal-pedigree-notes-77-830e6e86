
import React from 'react';
import PlannedLittersList from '@/components/planned-litters/PlannedLittersList';
import PlannedLittersLoadingSkeleton from './PlannedLittersLoadingSkeleton';
import { HeatPlanningSection } from '@/components/heat-planning/HeatPlanningSection';
import { usePlannedLitters } from '../hooks/usePlannedLitters';
import { useDogs } from '@/hooks/dogs';

const PlannedLittersContent: React.FC = () => {
  const { dogs } = useDogs();
  const {
    plannedLitters,
    males,
    females,
    isLoading,
    handleAddPlannedLitter,
    handleEditPlannedLitter,
    handleAddMatingDate,
    handleEditMatingDate,
    handleDeleteMatingDate,
    handleDeleteLitter
  } = usePlannedLitters();

  // Show loading skeleton while initial data is loading
  if (isLoading) {
    return <PlannedLittersLoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Planned Litters Section */}
      <PlannedLittersList 
        plannedLitters={plannedLitters}
        males={males}
        females={females}
        onAddPlannedLitter={handleAddPlannedLitter}
        onEditPlannedLitter={handleEditPlannedLitter}
        onAddMatingDate={handleAddMatingDate}
        onEditMatingDate={handleEditMatingDate}
        onDeleteMatingDate={handleDeleteMatingDate}
        onDeleteLitter={handleDeleteLitter}
      />
      
      {/* Heat Planning Section */}
      <HeatPlanningSection 
        dogs={dogs}
        plannedLitters={plannedLitters}
      />
    </div>
  );
};

export default PlannedLittersContent;
