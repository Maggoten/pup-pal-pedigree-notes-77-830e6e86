
import { supabase } from '@/integrations/supabase/client';

export class HeatService {
  /**
   * Deletes heat history entries that are older than 30 days
   * This calls a database function that handles the cleanup
   * @returns A boolean indicating whether the operation was successful
   */
  static async deleteOldHeatEntries(): Promise<boolean> {
    try {
      const { error } = await supabase.rpc('delete_old_heat_entries');
      
      if (error) {
        console.error('Error deleting old heat entries:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in deleteOldHeatEntries:', error);
      return false;
    }
  }

  /**
   * Deletes a specific heat entry from a dog's heat history
   * @param dogId The ID of the dog
   * @param heatIndex The index of the heat entry in the dog's heatHistory array
   * @returns A boolean indicating whether the operation was successful
   */
  static async deleteHeatEntry(dogId: string, heatIndex: number): Promise<boolean> {
    try {
      // First, fetch the current dog data
      const { data: dog, error: fetchError } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();
      
      if (fetchError || !dog) {
        console.error('Error fetching dog heat history:', fetchError);
        return false;
      }
      
      // Make a copy of the heat history, ensuring it's an array
      const heatHistory = Array.isArray(dog.heatHistory) ? [...dog.heatHistory] : [];
      
      // Validate the index
      if (heatIndex < 0 || heatIndex >= heatHistory.length) {
        console.error('Invalid heat index:', heatIndex);
        return false;
      }
      
      // Remove the specified heat entry
      heatHistory.splice(heatIndex, 1);
      
      // Update the dog with the modified heat history
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ heatHistory })
        .eq('id', dogId);
      
      if (updateError) {
        console.error('Error updating dog heat history:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in deleteHeatEntry:', error);
      return false;
    }
  }
}
