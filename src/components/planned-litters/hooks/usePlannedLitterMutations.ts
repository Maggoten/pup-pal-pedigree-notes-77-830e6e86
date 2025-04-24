
import { toast } from '@/hooks/use-toast';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { format } from 'date-fns';
import { UsePlannedLitterMutations } from './types';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { supabase } from '@/integrations/supabase/client';

export const usePlannedLitterMutations = (
  refreshLitters: () => Promise<void>
): UsePlannedLitterMutations => {
  const handleAddPlannedLitter = async (values: PlannedLitterFormValues) => {
    try {
      const newLitter = await plannedLittersService.createPlannedLitter(values);
      if (newLitter) {
        toast({
          title: "Planned Litter Added",
          description: `${newLitter.maleName || values.externalMaleName || 'Male'} × ${newLitter.femaleName} planned breeding added successfully.`
        });
        await refreshLitters();
      }
    } catch (error) {
      console.error('Error adding planned litter:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleAddMatingDate = async (litterId: string, date: Date) => {
    try {
      console.log("Adding mating date:", date, "for litter:", litterId);
      await plannedLittersService.addMatingDate(litterId, date);
      await refreshLitters();
      
      toast({
        title: "Mating Date Added",
        description: `Mating date ${format(date, 'PPP')} added successfully. A pregnancy has been created.`
      });
    } catch (error) {
      console.error('Error adding mating date:', error);
      toast({
        title: "Error",
        description: "Failed to add mating date",
        variant: "destructive"
      });
    }
  };

  const handleEditMatingDate = async (litterId: string, dateIndex: number, newDate: Date) => {
    try {
      console.log("Editing mating date at index:", dateIndex, "to:", newDate, "for litter:", litterId);
      await plannedLittersService.editMatingDate(litterId, dateIndex, newDate);
      await refreshLitters();
      
      toast({
        title: "Mating Date Updated",
        description: `Mating date updated to ${format(newDate, 'PPP')} successfully.`
      });
    } catch (error) {
      console.error('Error updating mating date:', error);
      toast({
        title: "Error",
        description: "Failed to update mating date",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMatingDate = async (litterId: string, dateIndex: number) => {
    try {
      console.log("Deleting mating date at index:", dateIndex, "for litter:", litterId);
      await plannedLittersService.deleteMatingDate(litterId, dateIndex);
      await refreshLitters();
      
      toast({
        title: "Mating Date Deleted",
        description: "The mating date has been removed successfully."
      });
    } catch (error) {
      console.error('Error deleting mating date:', error);
      toast({
        title: "Error",
        description: "Failed to delete mating date",
        variant: "destructive"
      });
    }
  };

  const handleDeleteLitter = async (litterId: string) => {
    try {
      console.log("Deleting litter:", litterId);
      const { error } = await supabase
        .from('planned_litters')
        .delete()
        .eq('id', litterId);
        
      if (error) throw error;
      
      await refreshLitters();
      
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

  return {
    handleAddPlannedLitter,
    handleAddMatingDate,
    handleEditMatingDate,
    handleDeleteMatingDate,
    handleDeleteLitter
  };
};
