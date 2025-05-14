
import { litterService } from '@/services/LitterService';
import { toast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from '../queries/useAddLitterMutation';

export function useAddLitter(
  loadLittersData,
  setActiveLitters,
  setArchivedLitters,
  setSelectedLitterId
) {
  const { isAuthReady } = useAuth();
  const queryClient = useQueryClient();
  
  // Handler for adding a new litter
  const handleAddLitter = async (newLitter: Litter) => {
    // Check if auth is ready before proceeding
    if (!isAuthReady) {
      console.log('[LitterOps] Auth not ready yet, delaying litter addition');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
    newLitter.puppies = [];
    newLitter.archived = false;
    
    // Verify user session
    const { data: sessionData } = await supabase.auth.getSession();
    
    console.log("Adding litter with session:", sessionData?.session ? {
      id: sessionData.session.user.id,
      email: sessionData.session.user.email
    } : "No active session");
    
    if (!sessionData.session || !sessionData.session.user) {
      toast({
        title: "Authentication Error",
        description: "You must be signed in to add a litter.",
        variant: "destructive"
      });
      return;
    }
    
    // Ensure user_id is set correctly
    newLitter.user_id = sessionData.session.user.id;
    
    try {
      console.log("Adding new litter with user ID:", newLitter.user_id);
      const result = await litterService.addLitter(newLitter);
      
      // Immediately invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      
      // Force a refresh of the litters data
      const updatedLitters = await loadLittersData();
      
      if (updatedLitters) {
        // Update the UI with the returned data if it's available
        const active = updatedLitters.filter(litter => !litter.archived);
        const archived = updatedLitters.filter(litter => litter.archived);
        
        console.log("Updated active litters:", active);
        setActiveLitters(active);
        setArchivedLitters(archived);
      }
      
      // Set the newly created litter as selected
      setSelectedLitterId(newLitter.id);
      
      toast({
        title: "Litter Added",
        description: `${newLitter.name} has been added successfully.`
      });
      
      return result;
    } catch (error) {
      console.error('Error adding litter:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add litter. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  return handleAddLitter;
}
