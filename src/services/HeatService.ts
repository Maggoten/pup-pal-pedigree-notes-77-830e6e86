
import { supabase } from '@/integrations/supabase/client';
import { Dog } from '@/types/dogs';

export class HeatService {
  static async addHeatDate(dogId: string, date: Date): Promise<boolean> {
    try {
      // Fetch the dog to get current heat history
      const { data, error } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();
      
      if (error || !data) {
        console.error('Error fetching dog heat history:', error);
        return false;
      }
      
      // Create new heat entry
      const newEntry = {
        date: date.toISOString(),
        recorded: new Date().toISOString()
      };
      
      // Add to existing heat history or create new array
      const heatHistory = data.heatHistory || [];
      heatHistory.push(newEntry);
      
      // Update the dog with new heat history
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
      console.error('Unexpected error adding heat date:', error);
      return false;
    }
  }
  
  static async deleteOldHeatEntries(): Promise<boolean> {
    try {
      // Call the Supabase function to delete old heat entries
      const { error } = await supabase.rpc('delete_old_heat_entries');
      
      if (error) {
        console.error('Error calling delete_old_heat_entries:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error deleting old heat entries:', error);
      return false;
    }
  }
}
