import { supabase } from '@/integrations/supabase/client';

export const migratePregnancyData = async () => {
  try {
    // Migrate planned litters with mating dates to pregnancies
    const plannedLittersJSON = localStorage.getItem('plannedLitters');
    if (plannedLittersJSON) {
      const plannedLitters = JSON.parse(plannedLittersJSON);
      const activeLitters = plannedLitters.filter((litter: any) => 
        litter.matingDates && litter.matingDates.length > 0
      );

      for (const litter of activeLitters) {
        const { error } = await supabase.from('pregnancies').insert({
          female_dog_id: litter.femaleId,
          male_dog_id: litter.maleId,
          external_male_name: !litter.maleId ? litter.maleName : null,
          mating_date: litter.matingDates[0],
          status: 'active'
        });

        if (error) {
          console.error('Error migrating pregnancy:', error);
          continue;
        }

        // Migrate temperature logs
        const tempLogsJSON = localStorage.getItem(`temperature_${litter.id}`);
        if (tempLogsJSON) {
          const tempLogs = JSON.parse(tempLogsJSON);
          for (const temp of tempLogs) {
            await supabase.from('temperature_logs').insert({
              pregnancy_id: litter.id,
              temperature: temp.temperature,
              date: temp.date,
              notes: temp.notes
            });
          }
        }

        // Migrate symptom logs
        const symptomLogsJSON = localStorage.getItem(`symptoms_${litter.id}`);
        if (symptomLogsJSON) {
          const symptomLogs = JSON.parse(symptomLogsJSON);
          for (const symptom of symptomLogs) {
            await supabase.from('symptom_logs').insert({
              pregnancy_id: litter.id,
              title: symptom.title,
              description: symptom.description,
              date: symptom.date
            });
          }
        }
      }
    }

    // Clear migrated data from localStorage
    // Keep this commented out until we're sure the migration was successful
    // localStorage.removeItem('plannedLitters');
    
    return { success: true };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error };
  }
};
