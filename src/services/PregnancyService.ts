
import { supabase } from '@/integrations/supabase/client';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { parseISO, addDays, differenceInDays } from 'date-fns';

export interface PregnancyDetails {
  id: string;
  maleName: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
  daysLeft: number;
}

export const getActivePregnancies = async (): Promise<ActivePregnancy[]> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("No active session found for pregnancy data");
      return [];
    }

    console.log("Fetching active pregnancies for user:", sessionData.session.user.id);

    // First get all active pregnancies with more detailed join queries
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
        status,
        dogs!female_dog_id(id, name),
        dogs!male_dog_id(id, name)
      `)
      .eq('status', 'active')
      .eq('user_id', sessionData.session.user.id);

    if (error) {
      console.error("Error fetching pregnancies:", error);
      throw error;
    }

    console.log("Raw pregnancies data:", pregnancies);
    
    if (!pregnancies || pregnancies.length === 0) {
      console.log("No active pregnancies found for this user");
      return [];
    }

    const activePregnancies = pregnancies.map((pregnancy) => {
      const matingDate = new Date(pregnancy.mating_date);
      const expectedDueDate = new Date(pregnancy.expected_due_date);
      const daysLeft = differenceInDays(expectedDueDate, new Date());
      
      // Get the dog data from the join results
      const femaleDog = pregnancy.dogs || [];
      let femaleName = "Unknown Female";
      
      // Female dog should be the one with the correct female_dog_id
      if (pregnancy.female_dog_id && femaleDog && femaleDog.length > 0) {
        const female = femaleDog.find(dog => dog?.id === pregnancy.female_dog_id);
        if (female) {
          femaleName = female.name;
        }
      }
      
      // Male dog handling (could be external)
      let maleName = pregnancy.external_male_name || "Unknown Male";
      if (pregnancy.male_dog_id && femaleDog && femaleDog.length > 0) {
        const male = femaleDog.find(dog => dog?.id === pregnancy.male_dog_id);
        if (male) {
          maleName = male.name;
        }
      }

      console.log(`Processing pregnancy ${pregnancy.id}:`);
      console.log(`- Female: ${femaleName} (ID: ${pregnancy.female_dog_id})`);
      console.log(`- Male: ${maleName} (ID: ${pregnancy.male_dog_id || 'external'})`);
      console.log(`- Mating date: ${matingDate}`);

      return {
        id: pregnancy.id,
        maleName,
        femaleName,
        matingDate,
        expectedDueDate,
        daysLeft: daysLeft > 0 ? daysLeft : 0
      };
    });

    console.log("Processed active pregnancies:", activePregnancies);
    return activePregnancies;

  } catch (err) {
    console.error('Error in getActivePregnancies:', err);
    return [];
  }
};

export const getPregnancyDetails = async (pregnancyId: string): Promise<PregnancyDetails | null> => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log("No active session found for pregnancy details");
      return null;
    }

    const { data: pregnancy, error } = await supabase
      .from('pregnancies')
      .select(`
        id,
        mating_date,
        expected_due_date,
        external_male_name,
        female_dog_id,
        male_dog_id,
        femaleDog:dogs!female_dog_id(id, name),
        maleDog:dogs!male_dog_id(id, name)
      `)
      .eq('id', pregnancyId)
      .eq('user_id', sessionData.session.user.id)
      .single();

    if (error) {
      console.error("Error fetching pregnancy details:", error);
      return null;
    }

    if (!pregnancy) {
      return null;
    }

    const matingDate = new Date(pregnancy.mating_date);
    const expectedDueDate = new Date(pregnancy.expected_due_date);
    const daysLeft = differenceInDays(expectedDueDate, new Date());
    
    const femaleDog = pregnancy.femaleDog || [];
    const maleDog = pregnancy.maleDog || [];
    const femaleName = femaleDog[0]?.name || "Unknown Female";
    const maleName = maleDog[0]?.name || pregnancy.external_male_name || "Unknown Male";

    return {
      id: pregnancy.id,
      maleName: maleName || "Unknown Male",
      femaleName: femaleName || "Unknown Female",
      matingDate,
      expectedDueDate,
      daysLeft: daysLeft > 0 ? daysLeft : 0
    };
  } catch (err) {
    console.error('Error in getPregnancyDetails:', err);
    return null;
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
