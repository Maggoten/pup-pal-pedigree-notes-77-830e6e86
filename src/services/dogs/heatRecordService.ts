
import { supabase } from "@/integrations/supabase/client";
import { HeatRecord } from "@/types/dogs";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

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
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Unexpected error fetching heat records:', error);
    return [];
  }
};

// Add a heat record
export const addHeatRecord = async (dogId: string, date: Date): Promise<boolean> => {
  try {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const { error } = await supabase
      .from('heat_records')
      .insert({
        dog_id: dogId,
        date: formattedDate
      });

    if (error) {
      console.error('Error adding heat record:', error);
      toast({
        title: "Error",
        description: "Failed to add heat record. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Heat record has been added.",
    });

    return true;
  } catch (error) {
    console.error('Unexpected error adding heat record:', error);
    return false;
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
      toast({
        title: "Error",
        description: "Failed to delete heat record. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Heat record has been removed.",
    });

    return true;
  } catch (error) {
    console.error('Unexpected error deleting heat record:', error);
    return false;
  }
};
