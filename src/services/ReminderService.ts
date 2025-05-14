
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
    
    // Call generateLitterReminders with the correct parameter type
    const litterReminders = await generateLitterReminders(userId);
    console.log(`[Manual Reminder Generation] Generated ${litterReminders.length} litter reminders`);
    
    // Call generateGeneralReminders without unnecessary parameters
    const generalReminders = generateGeneralReminders(userDogs);
    console.log(`[Manual Reminder Generation] Generated ${generalReminders.length} general reminders`);
    
    const allReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    return allReminders;
  } catch (error) {
    console.error('[Manual Reminder Generation] Failed:', error);
    return [];
  }
};
