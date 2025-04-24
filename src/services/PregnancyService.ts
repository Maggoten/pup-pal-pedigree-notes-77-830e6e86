
import { supabase } from '@/integrations/supabase/client';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { parseISO, addDays, differenceInDays } from 'date-fns';

export const getActivePregnancies = async (): Promise<ActivePregnancy[]> => {
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
    .eq('status', 'active');

  if (error) {
    console.error('Error fetching pregnancies:', error);
    return [];
  }

  return pregnancies.map((pregnancy) => {
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
};

export const getFirstActivePregnancy = async (): Promise<string | null> => {
  const pregnancies = await getActivePregnancies();
  return pregnancies.length > 0 ? pregnancies[0].id : null;
};
