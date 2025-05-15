
import { supabase } from '@/integrations/supabase/client';
import { addDays } from 'date-fns';
import { Dog } from '@/types/dogs';
import { toast } from '@/components/ui/use-toast';

// Define heat entry type for better type safety
interface HeatEntry {
  date: string;
  recorded: string;
}

export class HeatService {
  static async recordHeatDate(dogId: string, date: Date): Promise<boolean> {
    try {
      // Get the dog's current data
      const { data: dog, error: fetchError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', dogId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching dog for heat record:', fetchError);
        return false;
      }
      
      // Create the new heat entry
      const newHeatEntry = {
        date: date.toISOString(),
        recorded: new Date().toISOString()
      };
      
      // Get the current heat history or initialize empty array
      let heatHistory: HeatEntry[] = [];
      
      if (dog.heatHistory) {
        if (typeof dog.heatHistory === 'string') {
          try {
            heatHistory = JSON.parse(dog.heatHistory);
          } catch (e) {
            heatHistory = [];
          }
        } else if (Array.isArray(dog.heatHistory)) {
          heatHistory = dog.heatHistory;
        }
      }
      
      // Add the new entry
      heatHistory.push(newHeatEntry);
      
      // Update the dog with the new heat history
      const { error: updateError } = await supabase
        .from('dogs')
        .update({
          heatHistory: heatHistory
        })
        .eq('id', dogId);
        
      if (updateError) {
        console.error('Error updating dog heat history:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording heat date:', error);
      return false;
    }
  }
  
  static async deleteHeatDate(dogId: string, date: string): Promise<boolean> {
    try {
      // Get the dog's current data
      const { data: dog, error: fetchError } = await supabase
        .from('dogs')
        .select('*')
        .eq('id', dogId)
        .single();
        
      if (fetchError) {
        console.error('Error fetching dog for heat deletion:', fetchError);
        return false;
      }
      
      // Get the current heat history
      let heatHistory: HeatEntry[] = [];
      
      if (dog.heatHistory) {
        if (typeof dog.heatHistory === 'string') {
          try {
            heatHistory = JSON.parse(dog.heatHistory);
          } catch (e) {
            heatHistory = [];
          }
        } else if (Array.isArray(dog.heatHistory)) {
          heatHistory = dog.heatHistory;
        }
      }
      
      // Filter out the entry with the matching date
      const filteredHistory = heatHistory.filter(entry => entry?.date !== date);
      
      // Update the dog with the filtered heat history
      const { error: updateError } = await supabase
        .from('dogs')
        .update({
          heatHistory: filteredHistory
        })
        .eq('id', dogId);
        
      if (updateError) {
        console.error('Error updating dog heat history after deletion:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting heat date:', error);
      return false;
    }
  }

  // Add the method referenced in PlannedLittersContent.tsx
  static async cleanupOldHeatEntries(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Get all dogs for the current user
      const { data: dogs, error } = await supabase
        .from('dogs')
        .select('*')
        .eq('owner_id', user.id);
        
      if (error) {
        console.error('Error fetching dogs for heat cleanup:', error);
        return false;
      }
      
      // Get cutoff date (e.g., 1 year ago)
      const cutoffDate = addDays(new Date(), -365).toISOString();
      
      // Process each dog
      const updates = dogs.map(dog => {
        if (!dog.heatHistory) {
          return null; // Skip dogs without heat history
        }
        
        let heatHistory: HeatEntry[] = [];
        
        // Parse heat history
        if (typeof dog.heatHistory === 'string') {
          try {
            heatHistory = JSON.parse(dog.heatHistory);
          } catch (e) {
            return null;
          }
        } else if (Array.isArray(dog.heatHistory)) {
          heatHistory = dog.heatHistory;
        } else {
          return null;
        }
        
        if (!Array.isArray(heatHistory) || heatHistory.length === 0) {
          return null;
        }
        
        // Filter heat entries newer than cutoff date
        const filteredHistory = heatHistory.filter(entry => {
          if (entry && typeof entry === 'object' && 'date' in entry) {
            return entry.date > cutoffDate;
          }
          return false;
        });
        
        // Only update if there's a change
        if (filteredHistory.length < heatHistory.length) {
          return supabase
            .from('dogs')
            .update({
              heatHistory: filteredHistory
            })
            .eq('id', dog.id);
        }
        
        return null;
      });
      
      // Execute all updates that need to be performed
      const validUpdates = updates.filter(update => update !== null);
      if (validUpdates.length > 0) {
        await Promise.all(validUpdates);
        
        toast({
          title: "Heat Records Cleaned",
          description: `Removed old heat records older than one year.`,
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error cleaning up old heat entries:', error);
      return false;
    }
  }
}
