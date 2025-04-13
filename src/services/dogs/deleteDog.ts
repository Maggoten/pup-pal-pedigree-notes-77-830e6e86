
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Delete a dog
export const deleteDog = async (id: string, dogName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dog:', error);
      toast({
        title: "Error",
        description: "Failed to delete dog. Please try again.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: `${dogName} has been removed from your dogs.`,
    });

    return true;
  } catch (error) {
    console.error('Unexpected error deleting dog:', error);
    return false;
  }
};
