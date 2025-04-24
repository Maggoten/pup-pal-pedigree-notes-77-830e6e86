
import { supabase } from '@/integrations/supabase/client';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { parseISO, addDays, differenceInDays } from 'date-fns';

export const getActivePregnancies = async (): Promise<ActivePregnancy[]> => {
  try {
    // Get current session to check authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("No active session found for pregnancy data");
      return [];
    }
    
    const userId = sessionData.session.user.id;
    
    // Use fetch API to bypass TypeScript restrictions
    const supabaseUrl = "https://yqcgqriecxtppuvcguyj.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlxY2dxcmllY3h0cHB1dmNndXlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2OTI4NjksImV4cCI6MjA2MDI2ODg2OX0.PD0W-rLpQBHUGm9--nv4-3PVYQFMAsRujmExBDuP5oA";
    
    const response = await fetch(
      `${supabaseUrl}/rest/v1/pregnancies?status=eq.active&user_id=eq.${userId}&select=id,mating_date,female_dog_id,male_dog_id,external_male_name,dogs:female_dog_id(name),male:male_dog_id(name)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session.access_token}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to load pregnancies data');
    }
    
    const data = await response.json();

    return data.map((pregnancy: any) => {
      const matingDate = parseISO(pregnancy.mating_date);
      const expectedDueDate = addDays(matingDate, 63);
      const daysLeft = differenceInDays(expectedDueDate, new Date());

      return {
        id: pregnancy.id,
        maleName: pregnancy.male?.name || pregnancy.external_male_name,
        femaleName: pregnancy.dogs?.name,
        matingDate,
        expectedDueDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0
      };
    });
  } catch (err) {
    console.error('Error in getActivePregnancies:', err);
    return [];
  }
};

export const getFirstActivePregnancy = async (): Promise<string | null> => {
  try {
    const pregnancies = await getActivePregnancies();
    return pregnancies.length > 0 ? pregnancies[0].id : null;
  } catch (error) {
    console.error('Error in getFirstActivePregnancy:', error);
    return null;
  }
};
