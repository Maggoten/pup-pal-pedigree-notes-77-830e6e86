
import { supabase } from "@/integrations/supabase/client";

// Delete a dog
export const deleteDog = async (id: string, dogName: string): Promise<boolean> => {
  try {
    // First check if the dog exists and belongs to the current user
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData?.user) {
      throw new Error("You must be logged in to delete a dog");
    }
    
    const { data: dogData, error: fetchError } = await supabase
      .from('dogs')
      .select('id')
      .eq('id', id)
      .eq('user_id', userData.user.id)
      .single();
      
    if (fetchError || !dogData) {
      throw new Error("Dog not found or you don't have permission to delete it");
    }
    
    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dog:', error);
      throw new Error(`Failed to delete dog: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Unexpected error deleting dog:', error);
    throw error;
  }
};
