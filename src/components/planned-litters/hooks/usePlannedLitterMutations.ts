
import { toast } from '@/hooks/use-toast';
import { plannedLittersService } from '@/services/PlannedLitterService';
import { format } from 'date-fns';
import { UsePlannedLitterMutations } from './types';
import { PlannedLitterFormValues } from '@/services/PlannedLitterService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';

export const usePlannedLitterMutations = (
  refreshLitters: () => Promise<void>
): UsePlannedLitterMutations => {
  const { isAuthReady, session } = useAuth();
  const { t } = useTranslation('plannedLitters');
  
  const verifyAuth = async () => {
    // Check if auth is ready
    if (!isAuthReady) {
      console.log('[PlannedLitters] Auth not ready yet, delaying operation');
      toast({
        title: t('toasts.error.title'),
        description: t('toasts.error.pleaseWait'),
      });
      return false;
    }
    
    // Check if session exists
    if (!session) {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        console.error('[PlannedLitters] No active session found');
        toast({
          title: t('toasts.error.title'),
          description: t('toasts.error.authenticationRequired'),
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  const handleAddPlannedLitter = async (values: PlannedLitterFormValues) => {
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
    try {
      const newLitter = await plannedLittersService.createPlannedLitter(values);
      if (newLitter) {
        await refreshLitters();
      }
    } catch (error) {
      console.error('Error adding planned litter:', error);
      toast({
        title: t('toasts.error.title'),
        description: error instanceof Error ? error.message : t('toasts.error.failedToAddLitter'),
        variant: "destructive"
      });
    }
  };

  const handleAddMatingDate = async (litterId: string, date: Date) => {
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
    try {
      console.log("Adding mating date:", date, "for litter:", litterId);
      await plannedLittersService.addMatingDate(litterId, date);
      
      // Update status to 'active' when first mating date is added
      const { error: statusError } = await supabase
        .from('planned_litters')
        .update({ status: 'active' })
        .eq('id', litterId)
        .eq('status', 'planned');
      
      if (statusError) {
        console.error('Error updating planned litter status:', statusError);
      }
      
      await refreshLitters();
    } catch (error) {
      console.error('Error adding mating date:', error);
      toast({
        title: t('toasts.error.title'),
        description: t('toasts.error.failedToAddMatingDate'),
        variant: "destructive"
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
    } catch (error) {
      console.error('Error updating mating date:', error);
      toast({
        title: t('toasts.error.title'),
        description: t('toasts.error.failedToUpdateMatingDate'),
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
    } catch (error) {
      console.error('Error deleting mating date:', error);
      toast({
        title: t('toasts.error.title'),
        description: t('toasts.error.failedToDeleteMatingDate'),
        variant: "destructive"
      });
    }
  };

  const handleEditPlannedLitter = async (litterId: string, values: PlannedLitterFormValues) => {
    // Verify authentication first
    if (!(await verifyAuth())) return;
    
    try {
      console.log("Updating litter:", litterId, "with values:", values);
      const updatedLitter = await plannedLittersService.updatePlannedLitter(litterId, values);
      
      if (updatedLitter) {
        await refreshLitters();
      }
    } catch (error) {
      console.error('Error updating planned litter:', error);
      toast({
        title: t('toasts.error.title'),
        description: error instanceof Error ? error.message : t('toasts.error.failedToUpdateLitter'),
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
    } catch (error) {
      console.error('Error deleting litter:', error);
      toast({
        title: t('toasts.error.title'),
        description: t('toasts.error.failedToDeletePlannedLitter'),
        variant: "destructive"
      });
    }
  };

  return {
    handleAddPlannedLitter,
    handleEditPlannedLitter,
    handleAddMatingDate,
    handleEditMatingDate,
    handleDeleteMatingDate,
    handleDeleteLitter
  };
};
