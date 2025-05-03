
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

    // Use the specific relationship name as suggested in the error hint
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
        femaleDog:dogs!fk_pregnancies_female_dog_id(id, name),
        maleDog:dogs!pregnancies_female_dog_id_fkey(id, name)
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
      
      // Get the dog data from the proper aliased joins
      const femaleDog = pregnancy.femaleDog;
      const maleDog = pregnancy.maleDog;
      
      let femaleName = "Unknown Female";
      // Check if femaleDog exists and has the expected structure
      if (femaleDog && Array.isArray(femaleDog) && femaleDog.length > 0) {
        femaleName = femaleDog[0]?.name || "Unknown Female";
      } else if (femaleDog && typeof femaleDog === 'object' && 'name' in femaleDog) {
        femaleName = femaleDog.name;
      }
      
      // Male dog handling (could be external)
      let maleName = pregnancy.external_male_name || "Unknown Male";
      if (pregnancy.male_dog_id) {
        if (maleDog && Array.isArray(maleDog) && maleDog.length > 0) {
          maleName = maleDog[0]?.name || "Unknown Male";
        } else if (maleDog && typeof maleDog === 'object' && 'name' in maleDog) {
          maleName = maleDog.name;
        }
      }

      console.log(`Processing pregnancy ${pregnancy.id}:`);
      console.log(`- Female: ${femaleName} (ID: ${pregnancy.female_dog_id})`);
      console.log(`- Male: ${maleName} (ID: ${pregnancy.male_dog_id || 'external'})`);
      console.log(`- Mating date: ${matingDate}`);
      console.log(`- Expected due date: ${expectedDueDate}`);
      console.log(`- Days left: ${daysLeft}`);

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
        femaleDog:dogs!fk_pregnancies_female_dog_id(id, name),
        maleDog:dogs!pregnancies_female_dog_id_fkey(id, name)
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
    
    // Process female dog data
    const femaleDog = pregnancy.femaleDog;
    let femaleName = "Unknown Female";
    if (femaleDog && Array.isArray(femaleDog) && femaleDog.length > 0) {
      femaleName = femaleDog[0]?.name || "Unknown Female";
    } else if (femaleDog && typeof femaleDog === 'object' && 'name' in femaleDog) {
      femaleName = femaleDog.name;
    }
    
    // Process male dog data
    const maleDog = pregnancy.maleDog;
    let maleName = pregnancy.external_male_name || "Unknown Male";
    if (pregnancy.male_dog_id) {
      if (maleDog && Array.isArray(maleDog) && maleDog.length > 0) {
        maleName = maleDog[0]?.name || "Unknown Male";
      } else if (maleDog && typeof maleDog === 'object' && 'name' in maleDog) {
        maleName = maleDog.name;
      }
    }

    console.log("Fetched pregnancy details for ID:", pregnancyId);
    console.log("- Female dog data:", femaleDog);
    console.log("- Male dog data:", maleDog);
    console.log("- Female name processed:", femaleName);
    console.log("- Male name processed:", maleName);

    return {
      id: pregnancy.id,
      maleName,
      femaleName,
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
