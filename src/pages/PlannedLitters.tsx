
import React, { useState, useEffect } from 'react';
import PageLayout from '@/components/PageLayout';
import { toast } from '@/components/ui/use-toast';
import { format, parseISO, isBefore } from 'date-fns';
import { useDogs } from '@/context/DogsContext';
import { PlannedLitter } from '@/types/breeding';
import { plannedLitterService, PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { UpcomingHeat } from '@/types/reminders';
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
    const loadLitters = async () => {
      try {
        const litters = await plannedLitterService.loadPlannedLitters();
        setPlannedLitters(litters);
        
        // Extract mating dates for Recent Matings section
        const matings: RecentMating[] = [];
        
        litters.forEach(litter => {
          if (litter.matingDates && litter.matingDates.length > 0) {
            litter.matingDates.forEach(dateStr => {
              const matingDate = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
              // Only include matings that have already occurred
              if (isBefore(matingDate, new Date())) {
                matings.push({
                  id: `${litter.id}-${dateStr}`,
                  maleName: litter.maleName || 'Unknown',
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
      } catch (error) {
        console.error('Error loading planned litters:', error);
        toast({
          title: "Error",
          description: "Failed to load planned litters",
          variant: "destructive"
        });
      }
    };

    loadLitters();
    
    // Calculate upcoming heats
    setUpcomingHeats(calculateUpcomingHeats(dogs));
  }, [dogs]);
  
  const handleAddPlannedLitter = async (values: PlannedLitterFormValues) => {
    try {
      const newLitter = await plannedLitterService.createPlannedLitter(values);
      if (newLitter) {
        setPlannedLitters(prev => [...prev, newLitter]);
        
        toast({
          title: "Planned Litter Added",
          description: `${newLitter.maleName || values.externalMaleName || 'Male'} × ${newLitter.femaleName} planned breeding added successfully.`
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleAddMatingDate = async (litterId: string, date: Date) => {
    try {
      await plannedLitterService.addMatingDate(litterId, date);
      
      // Refresh litters to get the updated data
      const updatedLitters = await plannedLitterService.loadPlannedLitters();
      setPlannedLitters(updatedLitters);
      
      toast({
        title: "Mating Date Added",
        description: `Mating date ${format(date, 'PPP')} added successfully. A pregnancy has been created.`
      });

      // Add new mating to recent matings
      const litter = plannedLitters.find(l => l.id === litterId);
      if (litter) {
        setRecentMatings(prev => [{
          id: `${litter.id}-${format(date, 'yyyy-MM-dd')}`,
          maleName: litter.maleName || 'Unknown',
          femaleName: litter.femaleName,
          date: date
        }, ...prev]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add mating date",
        variant: "destructive"
      });
    }
  };

  const handleEditMatingDate = async (litterId: string, dateIndex: number, newDate: Date) => {
    try {
      await plannedLitterService.editMatingDate(litterId, dateIndex, newDate);
      
      // Refresh litters to get the updated data
      const updatedLitters = await plannedLitterService.loadPlannedLitters();
      setPlannedLitters(updatedLitters);
      
      toast({
        title: "Mating Date Updated",
        description: `Mating date updated to ${format(newDate, 'PPP')} successfully.`
      });
      
      // Update recent matings list
      updateRecentMatings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update mating date",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteMatingDate = async (litterId: string, dateIndex: number) => {
    try {
      await plannedLitterService.deleteMatingDate(litterId, dateIndex);
      
      // Refresh litters to get the updated data
      const updatedLitters = await plannedLitterService.loadPlannedLitters();
      setPlannedLitters(updatedLitters);
      
      toast({
        title: "Mating Date Deleted",
        description: "The mating date has been removed successfully."
      });
      
      // Update recent matings list
      updateRecentMatings();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete mating date",
        variant: "destructive"
      });
    }
  };
  
  const updateRecentMatings = async () => {
    try {
      const litters = await plannedLitterService.loadPlannedLitters();
      const matings: RecentMating[] = [];
      
      litters.forEach(litter => {
        if (litter.matingDates && litter.matingDates.length > 0) {
          litter.matingDates.forEach(dateStr => {
            const matingDate = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
            if (isBefore(matingDate, new Date())) {
              matings.push({
                id: `${litter.id}-${dateStr}`,
                maleName: litter.maleName || 'Unknown',
                femaleName: litter.femaleName,
                date: matingDate
              });
            }
          });
        }
      });
      
      matings.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentMatings(matings);
    } catch (error) {
      console.error('Error updating recent matings:', error);
    }
  };

  const handleDeleteLitter = async (litterId: string) => {
    try {
      // Get the litter to be deleted first
      const litterToDelete = plannedLitters.find(litter => litter.id === litterId);
      
      // Delete from Supabase (this will cascade delete mating_dates)
      const { error } = await supabase
        .from('planned_litters')
        .delete()
        .eq('id', litterId);
        
      if (error) throw error;
      
      // Update local state
      setPlannedLitters(plannedLitters.filter(litter => litter.id !== litterId));
      
      // Also filter out any recent matings associated with this litter
      const updatedMatings = recentMatings.filter(
        mating => !mating.id.startsWith(`${litterId}-`)
      );
      setRecentMatings(updatedMatings);
      
      toast({
        title: "Planned Litter Deleted",
        description: "The planned litter has been removed successfully."
      });
    } catch (error) {
      console.error('Error deleting litter:', error);
      toast({
        title: "Error",
        description: "Failed to delete planned litter",
        variant: "destructive"
      });
    }
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
        onEditMatingDate={handleEditMatingDate}
        onDeleteMatingDate={handleDeleteMatingDate}
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
