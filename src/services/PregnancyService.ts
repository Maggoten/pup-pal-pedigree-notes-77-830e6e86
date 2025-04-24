
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

    // Using a simpler query approach to avoid relationship conflicts
    const { data: pregnancies, error } = await supabase
      .from('pregnancies')
      .select('*, female:dogs(id, name), male:dogs(id, name)')
      .eq('status', 'active')
      .eq('user_id', sessionData.session.user.id);

    if (error) {
      throw error;
    }

    // Fetch all related dogs in a single query to join with pregnancies
    return pregnancies.map((pregnancy) => {
      const matingDate = new Date(pregnancy.mating_date);
      const expectedDueDate = new Date(pregnancy.expected_due_date);
      const daysLeft = differenceInDays(expectedDueDate, new Date());
      
      // Get female and male dogs using the explicit relationships
      const femaleDog = pregnancy.female;
      const maleDog = pregnancy.male;

      return {
        id: pregnancy.id,
        maleName: maleDog?.name || pregnancy.external_male_name,
        femaleName: femaleDog?.name,
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
