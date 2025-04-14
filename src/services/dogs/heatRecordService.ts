
import { supabase } from "@/integrations/supabase/client";
import { HeatRecord } from "@/types/dogs";
import { mapDbHeatRecordToHeatRecord } from "./mappers";
import { format } from "date-fns";

// Fetch heat records for a dog
export const fetchHeatRecords = async (dogId: string): Promise<HeatRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('heat_records')
      .select('*')
      .eq('dog_id', dogId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching heat records:', error);
      throw new Error(`Failed to fetch heat records: ${error.message}`);
    }

    return (data || []).map(mapDbHeatRecordToHeatRecord);
  } catch (error) {
    console.error('Unexpected error fetching heat records:', error);
    throw error;
  }
};

// Add a heat record
export const addHeatRecord = async (dogId: string, date: Date): Promise<boolean> => {
  try {
    // Format date as YYYY-MM-DD for database
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    const { error } = await supabase
      .from('heat_records')
      .insert({
        dog_id: dogId,
        date: formattedDate
      });

    if (error) {
      console.error('Error adding heat record:', error);
      throw new Error(`Failed to add heat record: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Unexpected error adding heat record:', error);
    throw error;
  }
};

// Delete a heat record
export const deleteHeatRecord = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('heat_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting heat record:', error);
      throw new Error(`Failed to delete heat record: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting heat record:', error);
    throw error;
  }
};
