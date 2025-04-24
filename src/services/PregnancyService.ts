
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
    
    // Using raw query to avoid type issues
    const { data: pregnancies, error } = await supabase
      .from('pregnancies')
      .select(`
        id,
        mating_date,
        female_dog_id,
        male_dog_id,
        external_male_name,
        dogs!female_dog_id (name),
        male:dogs!male_dog_id (name)
      `)
      .eq('status', 'active')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching pregnancies:', error);
      return [];
    }

    return pregnancies.map((pregnancy: any) => {
      const matingDate = parseISO(pregnancy.mating_date);
      const expectedDueDate = addDays(matingDate, 63);
      const daysLeft = differenceInDays(expectedDueDate, new Date());

      return {
        id: pregnancy.id,
        maleName: pregnancy.male?.name || pregnancy.external_male_name,
        femaleName: pregnancy.dogs.name,
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
  const pregnancies = await getActivePregnancies();
  return pregnancies.length > 0 ? pregnancies[0].id : null;
};
