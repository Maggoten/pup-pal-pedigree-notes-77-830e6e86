
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Dog } from '@/types/dogs';

export const HeatService = {
  /**
   * Delete old heat entries (older than 30 days) from the database
   */
  async deleteOldHeatEntries(): Promise<void> {
    try {
      console.log('Running function to delete old heat entries...');
      const { data, error } = await supabase.rpc('delete_old_heat_entries');
      
      if (error) {
        console.error('Error deleting old heat entries:', error);
      } else {
        console.log('Successfully cleaned up old heat entries');
      }
    } catch (err) {
      console.error('Exception in deleteOldHeatEntries:', err);
    }
  },

  /**
   * Delete a specific heat entry from a dog
   */
  async deleteHeatEntry(dogId: string, heatIndex: number): Promise<boolean> {
    try {
      console.log(`Deleting heat at index ${heatIndex} for dog ${dogId}`);
      
      // First, get the current dog data
      const { data: dog, error: fetchError } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();
      
      if (fetchError || !dog) {
        console.error('Error fetching dog:', fetchError);
        return false;
      }
      
      // Get the current heat history and remove the specified index
      const heatHistory = Array.isArray(dog.heatHistory) ? [...dog.heatHistory] : [];
      if (heatIndex < 0 || heatIndex >= heatHistory.length) {
        console.error('Invalid heat index:', heatIndex);
        return false;
      }
      
      // Remove the entry at the specified index
      heatHistory.splice(heatIndex, 1);
      
      // Update the dog record with the modified heat history
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ heatHistory })
        .eq('id', dogId);
      
      if (updateError) {
        console.error('Error updating heat history:', updateError);
        return false;
      }
      
      console.log('Successfully deleted heat entry');
      return true;
    } catch (err) {
      console.error('Exception in deleteHeatEntry:', err);
      return false;
    }
  }
};
