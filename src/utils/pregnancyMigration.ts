
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { addDays } from 'date-fns';

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
        // Insert pregnancy
        const matingDate = new Date(litter.matingDates[0]);
        const expectedDueDate = addDays(matingDate, 63); // 63 days is average gestation
        
        const { data: pregnancy, error: pregnancyError } = await supabase
          .from('pregnancies')
          .insert({
            user_id: userId,
            female_dog_id: litter.femaleId,
            male_dog_id: litter.maleId,
            external_male_name: !litter.maleId ? litter.maleName : null,
            mating_date: matingDate.toISOString(),
            expected_due_date: expectedDueDate.toISOString(),
            status: 'active'
          })
          .select()
          .single();

        if (pregnancyError) {
          console.error('Error creating pregnancy:', pregnancyError);
          continue;
        }

        // Migrate temperature logs
        const tempLogsJSON = localStorage.getItem(`temperature_${litter.id}`);
        if (tempLogsJSON) {
          const tempLogs = JSON.parse(tempLogsJSON);
          for (const temp of tempLogs) {
            const { error: tempError } = await supabase
              .from('temperature_logs')
              .insert({
                pregnancy_id: pregnancy.id,
                user_id: userId,
                temperature: temp.temperature,
                date: temp.date,
                notes: temp.notes || null
              });

            if (tempError) {
              console.error('Error migrating temperature log:', tempError);
            }
          }
        }

        // Migrate symptom logs
        const symptomLogsJSON = localStorage.getItem(`symptoms_${litter.id}`);
        if (symptomLogsJSON) {
          const symptomLogs = JSON.parse(symptomLogsJSON);
          for (const symptom of symptomLogs) {
            const { error: symptomError } = await supabase
              .from('symptom_logs')
              .insert({
                pregnancy_id: pregnancy.id,
                user_id: userId,
                title: symptom.title,
                description: symptom.description,
                date: symptom.date
              });

            if (symptomError) {
              console.error('Error migrating symptom log:', symptomError);
            }
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

