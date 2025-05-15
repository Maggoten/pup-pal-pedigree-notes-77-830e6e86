
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { UpcomingHeat } from '@/types/reminders';
import { format, addDays, differenceInDays } from 'date-fns';
import { Dog } from '@/types/dogs';

export class HeatService {
  /**
   * Add a heat date to a dog's heat history
   */
  static async addHeatDate(dogId: string, heatDate: Date): Promise<boolean> {
    try {
      // Fetch current heat history
      const { data, error } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();
      
      if (error) throw error;
      
      // Prepare updated heat history
      let heatHistory: any[] = [];
      if (data && data.heatHistory) {
        // Check if heatHistory is already an array
        if (Array.isArray(data.heatHistory)) {
          heatHistory = [...data.heatHistory];
        } else {
          // If it's not an array (perhaps it's a string or other type), initialize a new one
          heatHistory = [];
        }
      }
      
      // Add new heat date
      heatHistory.push({
        date: heatDate.toISOString(),
        notes: "Recorded heat"
      });
      
      // Update dog with new heat history
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ heatHistory })
        .eq('id', dogId);
      
      if (updateError) throw updateError;
      
      // Show toast message on success
      toast({
        title: "Heat record added",
        description: `Heat cycle recorded for ${format(heatDate, 'MMM d, yyyy')}`
      });
      
      return true;
    } catch (error) {
      console.error('Error adding heat date:', error);
      toast({
        title: "Error adding heat record",
        description: "Failed to save heat cycle data",
        variant: "destructive"
      });
      return false;
    }
  }
  
  /**
   * Calculate the expected next heat date based on previous heats
   */
  static calculateNextHeatDate(dog: Dog): Date | null {
    // Default heat interval in days
    const defaultInterval = 180; // ~ 6 months
    
    // Use configured heat interval if available
    const intervalDays = dog.heatInterval || defaultInterval;
    
    if (!dog.heatHistory || !Array.isArray(dog.heatHistory) || dog.heatHistory.length === 0) {
      // If no heat history, estimate from birth date or return null
      return dog.birthdate ? addDays(new Date(dog.birthdate), 270) : null;
    }
    
    // Sort heat history by date, most recent first
    const sortedHeats = [...dog.heatHistory].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB.getTime() - dateA.getTime();
    });
    
    // Get the most recent heat date
    const lastHeatDate = new Date(sortedHeats[0].date);
    
    // Calculate expected date
    return addDays(lastHeatDate, intervalDays);
  }
  
  /**
   * Get a list of upcoming heats for a collection of dogs
   */
  static getUpcomingHeats(dogs: Dog[]): UpcomingHeat[] {
    if (!dogs || dogs.length === 0) return [];
    
    // Filter only female dogs
    const femaleDogs = dogs.filter(dog => dog.gender === 'female');
    
    const upcomingHeats: UpcomingHeat[] = [];
    
    // Calculate upcoming heat for each female dog
    femaleDogs.forEach(dog => {
      const nextHeatDate = this.calculateNextHeatDate(dog);
      if (!nextHeatDate) return;
      
      const today = new Date();
      const daysTillHeat = differenceInDays(nextHeatDate, today);
      
      // Include heats up to 30 days in the past (already started) and 60 days in the future
      if (daysTillHeat > -30 && daysTillHeat < 60) {
        upcomingHeats.push({
          dog,
          expectedDate: nextHeatDate,
          daysTillHeat,
          // Add properties required by ReminderCalendarSyncService
          dogId: dog.id,
          dogName: dog.name,
          date: nextHeatDate
        });
      }
    });
    
    // Sort by date, closest first
    return upcomingHeats.sort((a, b) => a.daysTillHeat - b.daysTillHeat);
  }
}
