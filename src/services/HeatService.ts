
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type HeatCycle = Database['public']['Tables']['heat_cycles']['Row'];
type HeatCycleInsert = Database['public']['Tables']['heat_cycles']['Insert'];
type HeatCycleUpdate = Database['public']['Tables']['heat_cycles']['Update'];
type HeatLog = Database['public']['Tables']['heat_logs']['Row'];
type HeatLogInsert = Database['public']['Tables']['heat_logs']['Insert'];
type HeatLogUpdate = Database['public']['Tables']['heat_logs']['Update'];

export class HeatService {
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
      // First delete all heat logs for this cycle
      const { error: logsError } = await supabase
        .from('heat_logs')
        .delete()
        .eq('heat_cycle_id', cycleId);

      if (logsError) {
        console.error('Error deleting heat logs:', logsError);
        return false;
      }

      // Then delete the heat cycle
      const { error } = await supabase
        .from('heat_cycles')
        .delete()
        .eq('id', cycleId);

      if (error) {
        console.error('Error deleting heat cycle:', error);
        return false;
      }

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
}
