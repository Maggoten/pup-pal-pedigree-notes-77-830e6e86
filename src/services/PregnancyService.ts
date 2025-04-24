
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

    // Using the proper syntax to disambiguate relationships with dogs table
    const { data: pregnancies, error } = await supabase
      .from('pregnancies')
      .select(`
        id,
        mating_date,
        expected_due_date,
        external_male_name,
        user_id,
        female_dog_id,
        male_dog_id,
        dogs!female_dog_id(id, name),
        dogs!male_dog_id(id, name)
      `)
      .eq('status', 'active')
      .eq('user_id', sessionData.session.user.id);

    if (error) {
      throw error;
    }

    return pregnancies.map((pregnancy) => {
      const matingDate = new Date(pregnancy.mating_date);
      const expectedDueDate = new Date(pregnancy.expected_due_date);
      const daysLeft = differenceInDays(expectedDueDate, new Date());
      
      // Access dog names from the correctly hinted relationships
      const femaleDog = pregnancy["dogs!female_dog_id"];
      const maleDog = pregnancy["dogs!male_dog_id"];

      return {
        id: pregnancy.id,
        maleName: maleDog?.[0]?.name || pregnancy.external_male_name,
        femaleName: femaleDog?.[0]?.name,
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
