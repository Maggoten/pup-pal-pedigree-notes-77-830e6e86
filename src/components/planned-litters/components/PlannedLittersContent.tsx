
import React, { useEffect } from 'react';
import PlannedLittersList from '@/components/planned-litters/PlannedLittersList';
import MatingSection from '@/components/planned-litters/mating/MatingSection';
import { usePlannedLitters } from '../hooks/usePlannedLitters';
import { HeatService } from '@/services/HeatService';
import { MatingData, RecentMating } from '@/types/reminders'; 

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

  // Run cleanup of old heat entries when the page loads
  useEffect(() => {
    const cleanup = async () => {
      await HeatService.deleteOldHeatEntries();
    };
    
    cleanup();
    // Only run once when the component mounts
  }, []);

  const handleHeatDeleted = () => {
    // Refresh data after a heat entry is deleted
    refreshLitters();
  };

  // Convert MatingData to RecentMating type
  const typedRecentMatings: RecentMating[] = recentMatings.map(mating => ({
    id: mating.id,
    litterId: mating.litterId,
    femaleName: mating.femaleName,
    maleName: mating.maleName,
    date: mating.matingDate,
    formattedDate: mating.formattedDate,
    isToday: mating.isToday
  }));

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
        recentMatings={typedRecentMatings}
        onHeatDeleted={handleHeatDeleted}
      />
    </>
  );
};

export default PlannedLittersContent;
