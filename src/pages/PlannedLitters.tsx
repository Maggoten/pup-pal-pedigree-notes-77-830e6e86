
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO, isBefore } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLitterService, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { calculateUpcomingHeats, UpcomingHeat } from '@/utils/heatCalculator';
import PlannedLittersList from '@/components/planned-litters/PlannedLittersList';
import MatingSection from '@/components/planned-litters/MatingSection';

interface RecentMating {
  id: string;
  maleName: string;
  femaleName: string;
  date: Date;
}

const PlannedLittersContent: React.FC = () => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>([]);
  const [upcomingHeats, setUpcomingHeats] = useState<UpcomingHeat[]>([]);
  const [recentMatings, setRecentMatings] = useState<RecentMating[]>([]);
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  // Load planned litters and calculate heats on component mount
  useEffect(() => {
    const litters = plannedLitterService.loadPlannedLitters();
    setPlannedLitters(litters);
    
    // Calculate upcoming heats
    setUpcomingHeats(calculateUpcomingHeats(dogs));
    
    // Extract mating dates for Recent Matings section
    const matings: RecentMating[] = [];
    
    litters.forEach(litter => {
      if (litter.matingDates && litter.matingDates.length > 0) {
        litter.matingDates.forEach(dateStr => {
          const matingDate = parseISO(dateStr);
          // Only include matings that have already occurred
          if (isBefore(matingDate, new Date())) {
            matings.push({
              id: `${litter.id}-${dateStr}`,
              maleName: litter.maleName,
              femaleName: litter.femaleName,
              date: matingDate
            });
          }
        });
      }
    });
    
    // Sort by date, most recent first
    matings.sort((a, b) => b.date.getTime() - a.date.getTime());
    setRecentMatings(matings);
  }, [dogs]);
  
  // Save planned litters to localStorage whenever they change
  useEffect(() => {
    plannedLitterService.savePlannedLitters(plannedLitters);
  }, [plannedLitters]);
  
  const handleAddPlannedLitter = (values: PlannedLitterFormValues) => {
    try {
      const newLitter = plannedLitterService.createPlannedLitter(values, dogs);
      setPlannedLitters([...plannedLitters, newLitter]);
      
      toast({
        title: "Planned Litter Added",
        description: `${newLitter.maleName} × ${newLitter.femaleName} planned breeding added successfully.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleAddMatingDate = (litterId: string, date: Date) => {
    const updatedLitters = plannedLitterService.addMatingDate(plannedLitters, litterId, date);
    setPlannedLitters(updatedLitters);
    
    toast({
      title: "Mating Date Added",
      description: `Mating date ${format(date, 'PPP')} added successfully. A pregnancy has been created.`
    });

    // Add new mating to recent matings
    const litter = plannedLitters.find(l => l.id === litterId);
    if (litter) {
      setRecentMatings([{
        id: `${litter.id}-${format(date, 'yyyy-MM-dd')}`,
        maleName: litter.maleName,
        femaleName: litter.femaleName,
        date: date
      }, ...recentMatings]);
    }
  };

  const handleDeleteLitter = (litterId: string) => {
    const updatedLitters = plannedLitterService.deletePlannedLitter(plannedLitters, litterId);
    setPlannedLitters(updatedLitters);
    
    // Also filter out any recent matings associated with this litter
    const updatedMatings = recentMatings.filter(
      mating => !mating.id.startsWith(`${litterId}-`)
    );
    setRecentMatings(updatedMatings);
    
    toast({
      title: "Planned Litter Deleted",
      description: "The planned litter has been removed successfully."
    });
  };

  return (
    <PageLayout 
      title="Planned Litters & Mating" 
      description="Plan your future litters, track heat cycles, and manage breeding activities"
    >
      {/* Planned Litters Section */}
      <PlannedLittersList 
        plannedLitters={plannedLitters}
        males={males}
        females={females}
        onAddPlannedLitter={handleAddPlannedLitter}
        onAddMatingDate={handleAddMatingDate}
        onDeleteLitter={handleDeleteLitter}
      />
      
      {/* Mating Section */}
      <MatingSection 
        upcomingHeats={upcomingHeats}
        recentMatings={recentMatings}
      />
    </PageLayout>
  );
};

const PlannedLitters: React.FC = () => {
  return <PlannedLittersContent />;
};

export default PlannedLitters;
