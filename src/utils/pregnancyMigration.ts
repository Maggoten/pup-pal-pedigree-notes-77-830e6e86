
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
    const accessToken = sessionData.session.access_token;
    const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
    
    // Migrate planned litters with mating dates to pregnancies
    const plannedLittersJSON = localStorage.getItem('plannedLitters');
    if (plannedLittersJSON) {
      const plannedLitters = JSON.parse(plannedLittersJSON);
      const activeLitters = plannedLitters.filter((litter: any) => 
        litter.matingDates && litter.matingDates.length > 0
      );

      for (const litter of activeLitters) {
        // Insert pregnancy using REST API
        const pregnancyData = {
          user_id: userId,
          female_dog_id: litter.femaleId,
          male_dog_id: litter.maleId,
          external_male_name: !litter.maleId ? litter.maleName : null,
          mating_date: litter.matingDates[0],
          expected_due_date: addDays(new Date(litter.matingDates[0]), 63).toISOString(),
          status: 'active'
        };
        
        const pregnancyResponse = await fetch(
          `${supabaseUrl}/rest/v1/pregnancies`, 
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
              'Prefer': 'return=representation'
            },
            body: JSON.stringify(pregnancyData)
          }
        );
        
        if (!pregnancyResponse.ok) {
          console.error('Error creating pregnancy:', await pregnancyResponse.text());
          continue;
        }
        
        const pregnancyResult = await pregnancyResponse.json();
        const newPregnancy = pregnancyResult[0];
        
        if (!newPregnancy) {
          console.error('No pregnancy created');
          continue;
        }
        
        const newPregnancyId = newPregnancy.id;

        // Migrate temperature logs
        const tempLogsJSON = localStorage.getItem(`temperature_${litter.id}`);
        if (tempLogsJSON) {
          const tempLogs = JSON.parse(tempLogsJSON);
          for (const temp of tempLogs) {
            const tempData = {
              pregnancy_id: newPregnancyId,
              user_id: userId,
              temperature: temp.temperature,
              date: temp.date,
              notes: temp.notes || null
            };
            
            await fetch(
              `${supabaseUrl}/rest/v1/temperature_logs`, 
              {
                method: 'POST',
                headers: {
                  'apikey': supabaseKey,
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(tempData)
              }
            );
          }
        }

        // Migrate symptom logs
        const symptomLogsJSON = localStorage.getItem(`symptoms_${litter.id}`);
        if (symptomLogsJSON) {
          const symptomLogs = JSON.parse(symptomLogsJSON);
          for (const symptom of symptomLogs) {
            const symptomData = {
              pregnancy_id: newPregnancyId,
              user_id: userId,
              title: symptom.title,
              description: symptom.description,
              date: symptom.date
            };
            
            await fetch(
              `${supabaseUrl}/rest/v1/symptom_logs`, 
              {
                method: 'POST',
                headers: {
                  'apikey': supabaseKey,
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(symptomData)
              }
            );
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
