
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

    // Fetch active pregnancies with related dog names
    // Using explicit foreign key references to avoid type errors
    const { data: pregnancies, error } = await supabase
      .from('pregnancies')
      .select(`
        id,
        mating_date,
        expected_due_date,
        female_dog_id,
        male_dog_id,
        external_male_name,
        dogs!female_dog_id(name),
        dogs!male_dog_id(name)
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
      
      // Access the dog names from the properly referenced relationships
      const femaleDog = pregnancy.dogs?.find(dog => dog.id === pregnancy.female_dog_id);
      const maleDog = pregnancy.dogs?.find(dog => dog.id === pregnancy.male_dog_id);

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
