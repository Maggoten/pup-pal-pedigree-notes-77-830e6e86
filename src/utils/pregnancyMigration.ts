
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const migratePregnancyData = async () => {
  try {
    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to migrate pregnancy data.",
        variant: "destructive"
      });
      return { success: false, error: "Authentication required" };
    }
    
    const userId = sessionData.session.user.id;
    
    // Migrate planned litters with mating dates to pregnancies
    const plannedLittersJSON = localStorage.getItem('plannedLitters');
    if (plannedLittersJSON) {
      const plannedLitters = JSON.parse(plannedLittersJSON);
      const activeLitters = plannedLitters.filter((litter: any) => 
        litter.matingDates && litter.matingDates.length > 0
      );

      for (const litter of activeLitters) {
        const { error } = await supabase.from('pregnancies').insert({
          user_id: userId,
          female_dog_id: litter.femaleId,
          male_dog_id: litter.maleId,
          external_male_name: !litter.maleId ? litter.maleName : null,
          mating_date: litter.matingDates[0],
          expected_due_date: addDays(new Date(litter.matingDates[0]), 63).toISOString(),
          status: 'active'
        });

        if (error) {
          console.error('Error migrating pregnancy:', error);
          continue;
        }

        // Get the newly created pregnancy ID
        const { data: newPregnancy } = await supabase
          .from('pregnancies')
          .select('id')
          .eq('user_id', userId)
          .eq('female_dog_id', litter.femaleId)
          .eq('mating_date', litter.matingDates[0])
          .single();
          
        if (!newPregnancy) continue;
        const newPregnancyId = newPregnancy.id;

        // Migrate temperature logs
        const tempLogsJSON = localStorage.getItem(`temperature_${litter.id}`);
        if (tempLogsJSON) {
          const tempLogs = JSON.parse(tempLogsJSON);
          for (const temp of tempLogs) {
            await supabase.from('temperature_logs').insert({
              pregnancy_id: newPregnancyId,
              user_id: userId,
              temperature: temp.temperature,
              date: temp.date,
              notes: temp.notes || null
            });
          }
        }

        // Migrate symptom logs
        const symptomLogsJSON = localStorage.getItem(`symptoms_${litter.id}`);
        if (symptomLogsJSON) {
          const symptomLogs = JSON.parse(symptomLogsJSON);
          for (const symptom of symptomLogs) {
            await supabase.from('symptom_logs').insert({
              pregnancy_id: newPregnancyId,
              user_id: userId,
              title: symptom.title,
              description: symptom.description,
              date: symptom.date
            });
          }
        }
      }
    }

    toast({
      title: "Migration successful",
      description: "Your pregnancy data has been successfully migrated to the database."
    });
    
    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    toast({
      title: "Migration failed",
      description: "There was an error migrating your pregnancy data.",
      variant: "destructive"
    });
    return { success: false, error };
  }
};

// Helper function to add days to a date
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
