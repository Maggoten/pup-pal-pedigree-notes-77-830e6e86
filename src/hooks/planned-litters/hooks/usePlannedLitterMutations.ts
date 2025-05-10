
import { toast } from '@/hooks/use-toast';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { format } from 'date-fns';
import { UsePlannedLitterMutations } from './types';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';

export const usePlannedLitterMutations = (
  refreshLitters: () => Promise<void>
): UsePlannedLitterMutations => {
  const { isAuthReady, session } = useAuth();
  const [sessionChecked, setSessionChecked] = useState(false);
  
  // Check session on component mount and when auth state changes
  useEffect(() => {
    if (isAuthReady) {
      verifyAuth(true).then(isValid => {
        setSessionChecked(isValid);
      });
    }
  }, [isAuthReady, session]);
  
  const verifyAuth = async (silent = false): Promise<boolean> => {
    // Check if auth is ready
    if (!isAuthReady) {
      console.log('[PlannedLitters] Auth not ready yet, delaying operation');
      if (!silent) {
        toast({
          title: "Please wait",
          description: "Preparing your account. Please try again in a moment.",
        });
      }
      return false;
    }
    
    // Check if session exists
    if (!session) {
      // Try to get a fresh session
      const { data: sessionData, error } = await supabase.auth.getSession();
      
      if (!sessionData.session || error) {
        console.error('[PlannedLitters] No active session found:', error);
        
        // Only show toast for non-silent checks
        if (!silent) {
          toast({
            title: "Authentication required",
            description: "You need to be logged in to perform this action",
            variant: "destructive"
          });
        }
        return false;
      }
      
      console.log('[PlannedLitters] Session retrieved successfully');
    }
    
    console.log('[PlannedLitters] Auth verified successfully');
    return true;
  };

  const handleAddPlannedLitter = async (values: PlannedLitterFormValues) => {
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
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
    // Verify authentication first with more detailed logging
    console.log('[PlannedLitters] Adding mating date - checking authentication');
    if (!(await verifyAuth())) {
      console.log('[PlannedLitters] Authentication failed, cannot add mating date');
      return;
    }
    
    try {
      console.log("[PlannedLitters] Adding mating date:", date, "for litter:", litterId);
      
      // Try with retry logic up to 3 times
      let attemptCount = 0;
      let success = false;
      let lastError: any = null;
      
      while (attemptCount < 3 && !success) {
        try {
          console.log(`[PlannedLitters] Add mating date attempt ${attemptCount + 1}`);
          await plannedLittersService.addMatingDate(litterId, date);
          success = true;
        } catch (error) {
          lastError = error;
          console.error(`[PlannedLitters] Error adding mating date (attempt ${attemptCount + 1}):`, error);
          
          // For auth errors, try refreshing session
          if (error instanceof Error && 
              (error.message.includes('auth') || 
               error.message.includes('token') || 
               error.message.includes('permission'))) {
            console.log('[PlannedLitters] Auth error detected, refreshing session');
            await supabase.auth.refreshSession();
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1500));
          attemptCount++;
        }
      }
      
      if (!success) {
        throw lastError || new Error("Failed after multiple attempts");
      }
      
      await refreshLitters();
      
      toast({
        title: "Mating Date Added",
        description: `Mating date ${format(date, 'PPP')} added successfully. A pregnancy has been created.`
      });
    } catch (error) {
      console.error('Error adding mating date:', error);
      toast({
        title: "Error",
        description: "Failed to add mating date. Please try refreshing the page and try again.",
        variant: "destructive",
        action: {
          label: "Refresh",
          onClick: () => window.location.reload(),
        }
      });
    }
  };

  const handleEditMatingDate = async (litterId: string, dateIndex: number, newDate: Date) => {
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
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
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
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
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
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
    handleDeleteLitter,
    sessionChecked
  };
};
