
import { Dog } from '@/types/dogs';
import { supabase } from '@/integrations/supabase/client';
import { safeFilter } from '@/utils/supabaseTypeUtils';

export class HeatService {
  /**
   * Adds a heat date to a dog's heatHistory
   * @param dogId The ID of the dog
   * @param date The date of the heat
   */
  static async addHeatDate(dogId: string, date: Date): Promise<boolean> {
    try {
      // Get current heat history
      const { data: dog, error } = await safeFilter(
        supabase.from('dogs').select('heatHistory'),
        'id',
        dogId
      ).single();
      
      if (error) throw error;
      
      // Create new heat history entry
      const newHeatEntry = {
        date: date.toISOString(),
        recorded: new Date().toISOString()
      };
      
      // Update dog with new heat history
      let heatHistory = [];
      
      // Check if heatHistory exists and is an array
      if (dog && dog.heatHistory && Array.isArray(dog.heatHistory)) {
        heatHistory = [...dog.heatHistory];
      }
      
      // Add new entry (spread operator doesn't work correctly with JSON arrays in Supabase)
      heatHistory.push(newHeatEntry);
      
      // Update dog with new heat history
      const { error: updateError } = await safeFilter(
        supabase.from('dogs').update({ heatHistory }),
        'id',
        dogId
      );
      
      if (updateError) throw updateError;
      
      return true;
    } catch (error) {
      console.error('Error recording heat date:', error);
      return false;
    }
  }
  
  /**
   * Gets the heat history for a dog
   * @param dogId The ID of the dog
   */
  static async getHeatHistory(dogId: string): Promise<any[]> {
    try {
      const { data: dog, error } = await safeFilter(
        supabase.from('dogs').select('heatHistory'),
        'id',
        dogId
      ).single();
      
      if (error) throw error;
      
      if (dog && dog.heatHistory && Array.isArray(dog.heatHistory)) {
        return dog.heatHistory;
      }
      
      return [];
    } catch (error) {
      console.error('Error getting heat history:', error);
      return [];
    }
  }
  
  /**
   * Cleans up old heat entries (more than 30 days old)
   */
  static async cleanupOldHeatEntries(): Promise<boolean> {
    try {
      // Call the Supabase function to clean up old heat entries
      const { error } = await supabase.rpc('delete_old_heat_entries');
      
      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Error cleaning up old heat entries:', error);
      return false;
    }
  }
}
