
// Unified export file for all reminder generators
export { generateDogReminders } from './reminders/DogReminderService';
export { generateLitterReminders } from './reminders/LitterReminderService';
export { generateGeneralReminders } from './reminders/GeneralReminderService';

import { TriggerAllRemindersFunction } from '@/types/reminderFunctions';
import { Reminder } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';
import { enrichDog } from '@/utils/dogUtils';
import { generateDogReminders } from './reminders/DogReminderService';
import { generateLitterReminders } from './reminders/LitterReminderService';
import { generateGeneralReminders } from './reminders/GeneralReminderService';
import { isMobileDevice } from '@/utils/fetchUtils';
import { Litter } from '@/types/breeding';

// Add a new manual trigger function with explicit type
export const triggerAllReminders: TriggerAllRemindersFunction = async (userId: string): Promise<Reminder[]> => {
  console.log(`[Manual Reminder Generation] Starting for user ${userId}`);
  
  if (!userId) {
    console.error('[Manual Reminder Generation] No user ID provided');
    return [];
  }
  
  try {
    // First fetch the user's dogs with specific fields instead of select('*')
    const { data: dogsData, error: dogsError } = await supabase
      .from('dogs')
      .select('id, name, breed, gender, birthdate, dewormingDate, vaccinationDate, owner_id')
      .eq('owner_id', userId)
      .limit(isMobileDevice() ? 5 : 20); // Limit results based on device
      
    if (dogsError) {
      console.error('[Manual Reminder Generation] Error fetching dogs:', dogsError);
      return [];
    }
    
    // Transform database dogs into the expected Dog type using enrichDog
    const userDogs = (dogsData || []).map(dog => enrichDog(dog));
    console.log(`[Manual Reminder Generation] Found ${userDogs.length} dogs for user`);
    
    // Generate all reminders without dynamic imports
    const dogReminders = generateDogReminders(userDogs);
    console.log(`[Manual Reminder Generation] Generated ${dogReminders.length} dog reminders`);
    
    // Fetch litters for the user to pass to generateLitterReminders
    const { data: littersData, error: littersError } = await supabase
      .from('litters')
      .select('*')
      .eq('user_id', userId);
      
    if (littersError) {
      console.error('[Manual Reminder Generation] Error fetching litters:', littersError);
      return [];
    }
    
    // Convert litters data to expected Litter type before passing to generateLitterReminders
    const processedLitters: Litter[] = (littersData || []).map(litter => ({
      id: litter.id,
      userId: litter.user_id,
      name: litter.name,
      dateOfBirth: new Date(litter.date_of_birth),
      sireName: litter.sire_name,
      damName: litter.dam_name,
      sireId: litter.sire_id,
      damId: litter.dam_id,
      puppies: [], // Default empty puppies array
      archived: litter.archived || false,
      createdAt: litter.created_at,
      updatedAt: litter.updated_at
    }));
    
    // Call generateLitterReminders with the properly converted litters array
    const litterReminders = await generateLitterReminders(processedLitters);
    console.log(`[Manual Reminder Generation] Generated ${litterReminders.length} litter reminders`);
    
    // Call generateGeneralReminders
    const generalReminders = generateGeneralReminders();
    console.log(`[Manual Reminder Generation] Generated ${generalReminders.length} general reminders`);
    
    const allReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    return allReminders;
  } catch (error) {
    console.error('[Manual Reminder Generation] Failed:', error);
    return [];
  }
};
