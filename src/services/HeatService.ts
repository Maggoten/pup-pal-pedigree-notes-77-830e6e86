
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatCycleInsert = Database['public']['Tables']['heat_cycles']['Insert'];
type HeatCycleUpdate = Database['public']['Tables']['heat_cycles']['Update'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];
type HeatLogInsert = Database['public']['Tables']['heat_logs']['Insert'];
type HeatLogUpdate = Database['public']['Tables']['heat_logs']['Update'];

// Type for heat history entries
type HeatHistoryEntry = { date: string };
type HeatHistoryArray = HeatHistoryEntry[];

export class HeatService {
  /**
   * Syncs a heat cycle to dog's heatHistory
   */
  static async syncHeatCycleToHeatHistory(dogId: string, heatCycleId: string): Promise<boolean> {
    try {
      // Fetch the heat cycle
      const { data: heatCycle, error: cycleError } = await supabase
        .from('heat_cycles')
        .select('*')
        .eq('id', heatCycleId)
        .single();

      if (cycleError || !heatCycle) {
        console.error('Error fetching heat cycle:', cycleError);
        return false;
      }

      // Fetch current dog data
      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();

      if (dogError || !dog) {
        console.error('Error fetching dog:', dogError);
        return false;
      }

      const heatHistory = Array.isArray(dog.heatHistory) ? [...(dog.heatHistory as HeatHistoryArray)] : [];
      const heatDate = new Date(heatCycle.start_date).toISOString().split('T')[0];

      // Check if this heat cycle is already in history
      const existingIndex = heatHistory.findIndex(h => 
        new Date(h.date).toDateString() === new Date(heatCycle.start_date).toDateString()
      );

      if (existingIndex >= 0) {
        // Update existing entry
        heatHistory[existingIndex] = { date: heatDate };
      } else {
        // Add new entry
        heatHistory.push({ date: heatDate });
        // Sort by date (newest first)
        heatHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      }

      // Update dog's heat history
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
      console.error('Error in syncHeatCycleToHeatHistory:', error);
      return false;
    }
  }

  /**
   * Syncs dog's heatHistory to heat_cycles
   */
  static async syncHeatHistoryToHeatCycles(dogId: string): Promise<boolean> {
    try {
      // Fetch dog's heat history
      const { data: dog, error: dogError } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();

      if (dogError || !dog) {
        console.error('Error fetching dog:', dogError);
        return false;
      }

      const heatHistory = Array.isArray(dog.heatHistory) ? (dog.heatHistory as HeatHistoryArray) : [];
      if (heatHistory.length === 0) return true;

      // Fetch existing heat cycles
      const existingCycles = await this.getHeatCycles(dogId);
      const existingDates = new Set(
        existingCycles.map(cycle => new Date(cycle.start_date).toDateString())
      );

      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return false;

      // Create heat cycles for entries not already in the system
      for (const heatEntry of heatHistory) {
        const heatDate = new Date(heatEntry.date);
        const dateString = heatDate.toDateString();

        if (!existingDates.has(dateString)) {
          await this.createHeatCycle(dogId, heatDate, 'Migrated from heat history');
        }
      }

      return true;
    } catch (error) {
      console.error('Error in syncHeatHistoryToHeatCycles:', error);
      return false;
    }
  }

  /**
   * Gets the latest heat date from both systems
   */
  static async getLatestHeatDate(dogId: string): Promise<Date | null> {
    try {
      // Get from heat cycles
      const { data: latestCycle } = await supabase
        .from('heat_cycles')
        .select('start_date')
        .eq('dog_id', dogId)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get from dog heat history
      const { data: dog } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();

      const dates: Date[] = [];

      if (latestCycle) {
        dates.push(new Date(latestCycle.start_date));
      }

      if (dog?.heatHistory && Array.isArray(dog.heatHistory)) {
        const historyDates = (dog.heatHistory as HeatHistoryArray).map(h => new Date(h.date));
        dates.push(...historyDates);
      }

      if (dates.length === 0) return null;

      // Return the most recent date
      return new Date(Math.max(...dates.map(d => d.getTime())));
    } catch (error) {
      console.error('Error getting latest heat date:', error);
      return null;
    }
  }

  /**
   * Gets unified heat data from both systems
   */
  static async getUnifiedHeatData(dogId: string): Promise<{
    heatCycles: HeatCycle[];
    heatHistory: { date: string }[];
    latestDate: Date | null;
  }> {
    try {
      const [heatCycles, { data: dog }, latestDate] = await Promise.all([
        this.getHeatCycles(dogId),
        supabase.from('dogs').select('heatHistory').eq('id', dogId).single(),
        this.getLatestHeatDate(dogId)
      ]);

      const heatHistory = Array.isArray(dog?.heatHistory) ? (dog.heatHistory as HeatHistoryArray) : [];

      return {
        heatCycles,
        heatHistory,
        latestDate
      };
    } catch (error) {
      console.error('Error getting unified heat data:', error);
      return {
        heatCycles: [],
        heatHistory: [],
        latestDate: null
      };
    }
  }

  /**
   * Migrates heat history to cycles for a dog (one-time operation)
   */
  static async migrateHeatHistoryToCycles(dogId: string): Promise<boolean> {
    try {
      // Check if migration already happened by looking for existing cycles
      const existingCycles = await this.getHeatCycles(dogId);
      if (existingCycles.length > 0) {
        // Already migrated, just ensure sync
        return await this.syncHeatHistoryToHeatCycles(dogId);
      }

      // Perform full migration
      return await this.syncHeatHistoryToHeatCycles(dogId);
    } catch (error) {
      console.error('Error migrating heat history to cycles:', error);
      return false;
    }
  }

  /**
   * Removes a heat entry from dog's heatHistory when a heat cycle is deleted
   */
  static async removeFromHeatHistory(dogId: string, heatCycleStartDate: Date): Promise<boolean> {
    try {
      // Fetch current dog data
      const { data: dog, error: fetchError } = await supabase
        .from('dogs')
        .select('heatHistory')
        .eq('id', dogId)
        .single();
      
      if (fetchError || !dog) {
        console.error('Error fetching dog heat history:', fetchError);
        return false;
      }
      
      const heatHistory = Array.isArray(dog.heatHistory) ? [...(dog.heatHistory as HeatHistoryArray)] : [];
      const targetDateString = heatCycleStartDate.toDateString();
      
      // Find and remove the matching entry
      const filteredHistory = heatHistory.filter(h => 
        new Date(h.date).toDateString() !== targetDateString
      );
      
      // Update the dog with the modified heat history
      const { error: updateError } = await supabase
        .from('dogs')
        .update({ heatHistory: filteredHistory })
        .eq('id', dogId);
      
      if (updateError) {
        console.error('Error updating dog heat history:', updateError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Unexpected error in removeFromHeatHistory:', error);
      return false;
    }
  }

  /**
   * Deletes a specific heat entry from a dog's heat history
   * @param dogId The ID of the dog
   * @param heatIndex The index of the heat entry in the dog's heatHistory array
   * @returns A boolean indicating whether the operation was successful
   */
  /**
   * Edits a specific heat entry in a dog's heat history
   * @param dogId The ID of the dog
   * @param heatIndex The index of the heat entry in the dog's heatHistory array
   * @param newDate The new date for the heat entry
   * @returns A boolean indicating whether the operation was successful
   */
  static async editHeatEntry(dogId: string, heatIndex: number, newDate: Date): Promise<boolean> {
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
      const heatHistory = Array.isArray(dog.heatHistory) ? [...(dog.heatHistory as HeatHistoryArray)] : [];
      
      // Validate the index
      if (heatIndex < 0 || heatIndex >= heatHistory.length) {
        console.error('Invalid heat index:', heatIndex);
        return false;
      }
      
      // Validate the new date (should not be in the future)
      if (newDate > new Date()) {
        console.error('Cannot set heat date in the future');
        return false;
      }
      
      // Update the heat entry with the new date
      heatHistory[heatIndex] = { date: newDate.toISOString() };
      
      // Sort the heat history by date to maintain chronological order
      heatHistory.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
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
      console.error('Unexpected error in editHeatEntry:', error);
      return false;
    }
  }

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
      const heatHistory = Array.isArray(dog.heatHistory) ? [...(dog.heatHistory as HeatHistoryArray)] : [];
      
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

  /**
   * Creates a new heat cycle for a dog
   */
  static async createHeatCycle(dogId: string, startDate: Date, notes?: string): Promise<HeatCycle | null> {
    try {
      const { data, error } = await supabase
        .from('heat_cycles')
        .insert({
          dog_id: dogId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          start_date: startDate.toISOString(),
          notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating heat cycle:', error);
        return null;
      }

      // Sync to heat history
      await this.syncHeatCycleToHeatHistory(dogId, data.id);

      return data;
    } catch (error) {
      console.error('Unexpected error creating heat cycle:', error);
      return null;
    }
  }

  /**
   * Updates an existing heat cycle
   */
  static async updateHeatCycle(cycleId: string, updates: HeatCycleUpdate): Promise<HeatCycle | null> {
    try {
      const { data, error } = await supabase
        .from('heat_cycles')
        .update(updates)
        .eq('id', cycleId)
        .select()
        .single();

      if (error) {
        console.error('Error updating heat cycle:', error);
        return null;
      }

      // Sync to heat history if start_date was updated
      if (updates.start_date || updates.end_date) {
        await this.syncHeatCycleToHeatHistory(data.dog_id, data.id);
      }

      return data;
    } catch (error) {
      console.error('Unexpected error updating heat cycle:', error);
      return null;
    }
  }

  /**
   * Gets heat cycles for a specific dog
   */
  static async getHeatCycles(dogId: string): Promise<HeatCycle[]> {
    try {
      const { data, error } = await supabase
        .from('heat_cycles')
        .select('*')
        .eq('dog_id', dogId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching heat cycles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching heat cycles:', error);
      return [];
    }
  }

  /**
   * Deletes a heat cycle and all associated logs
   */
  static async deleteHeatCycle(cycleId: string): Promise<boolean> {
    try {
      // First get the heat cycle to get the dog_id and start_date
      const { data: heatCycle, error: fetchError } = await supabase
        .from('heat_cycles')
        .select('dog_id, start_date')
        .eq('id', cycleId)
        .single();

      if (fetchError || !heatCycle) {
        console.error('Error fetching heat cycle for deletion:', fetchError);
        return false;
      }

      // Delete all heat logs for this cycle
      const { error: logsError } = await supabase
        .from('heat_logs')
        .delete()
        .eq('heat_cycle_id', cycleId);

      if (logsError) {
        console.error('Error deleting heat logs:', logsError);
        return false;
      }

      // Delete the heat cycle
      const { error } = await supabase
        .from('heat_cycles')
        .delete()
        .eq('id', cycleId);

      if (error) {
        console.error('Error deleting heat cycle:', error);
        return false;
      }

      // Remove from heat history
      await this.removeFromHeatHistory(heatCycle.dog_id, new Date(heatCycle.start_date));

      return true;
    } catch (error) {
      console.error('Error deleting heat cycle:', error);
      return false;
    }
  }

  /**
   * Creates a new heat log entry
   */
  static async createHeatLog(
    heatCycleId: string,
    date: Date,
    temperature?: number,
    phase?: string,
    observations?: string,
    notes?: string
  ): Promise<HeatLog | null> {
    try {
      const { data, error } = await supabase
        .from('heat_logs')
        .insert({
          heat_cycle_id: heatCycleId,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
          date: date.toISOString(),
          temperature,
          phase,
          observations,
          notes
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating heat log:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error creating heat log:', error);
      return null;
    }
  }

  /**
   * Gets heat logs for a specific heat cycle
   */
  static async getHeatLogs(heatCycleId: string): Promise<HeatLog[]> {
    try {
      const { data, error } = await supabase
        .from('heat_logs')
        .select('*')
        .eq('heat_cycle_id', heatCycleId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching heat logs:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Unexpected error fetching heat logs:', error);
      return [];
    }
  }

  /**
   * Updates a heat log entry
   */
  static async updateHeatLog(logId: string, updates: HeatLogUpdate): Promise<HeatLog | null> {
    try {
      const { data, error } = await supabase
        .from('heat_logs')
        .update(updates)
        .eq('id', logId)
        .select()
        .single();

      if (error) {
        console.error('Error updating heat log:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error updating heat log:', error);
      return null;
    }
  }

  /**
   * Deletes a heat log entry
   */
  static async deleteHeatLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('heat_logs')
        .delete()
        .eq('id', logId);

      if (error) {
        console.error('Error deleting heat log:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Unexpected error deleting heat log:', error);
      return false;
    }
  }

  /**
   * Gets the active heat cycle for a dog (if any)
   */
  static async getActiveHeatCycle(dogId: string): Promise<HeatCycle | null> {
    try {
      const { data, error } = await supabase
        .from('heat_cycles')
        .select('*')
        .eq('dog_id', dogId)
        .is('end_date', null)
        .order('start_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching active heat cycle:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Unexpected error fetching active heat cycle:', error);
      return null;
    }
  }

  /**
   * Ends an active heat cycle by setting the end date
   */
  static async endHeatCycle(cycleId: string, endDate: Date = new Date()): Promise<HeatCycle | null> {
    try {
      const cycleLength = await this.calculateCycleLength(cycleId, endDate);

      const updates: HeatCycleUpdate = {
        end_date: endDate.toISOString(),
        cycle_length: cycleLength
      };

      const result = await this.updateHeatCycle(cycleId, updates);
      return result;
    } catch (error) {
      console.error('Error ending heat cycle:', error);
      return null;
    }
  }

  /**
   * Calculates the cycle length in days
   */
  private static async calculateCycleLength(cycleId: string, endDate: Date): Promise<number | null> {
    try {
      const { data: cycle, error } = await supabase
        .from('heat_cycles')
        .select('start_date')
        .eq('id', cycleId)
        .single();

      if (error || !cycle) {
        console.error('Error fetching cycle for length calculation:', error);
        return null;
      }

      const startDate = new Date(cycle.start_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays;
    } catch (error) {
      console.error('Error calculating cycle length:', error);
      return null;
    }
  }
}
