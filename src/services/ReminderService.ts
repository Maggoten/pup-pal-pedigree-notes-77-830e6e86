
// Unified export file for all reminder generators
export { generateDogReminders } from './reminders/DogReminderService';
export { generateLitterReminders } from './reminders/LitterReminderService';
export { generateGeneralReminders } from './reminders/GeneralReminderService';

import { TriggerAllRemindersFunction } from '@/types/reminderFunctions';
import { Reminder } from '@/types/reminders';
import { supabase } from '@/integrations/supabase/client';

// Add a new manual trigger function with explicit type
export const triggerAllReminders: TriggerAllRemindersFunction = async (userId: string): Promise<Reminder[]> => {
  console.log(`[Manual Reminder Generation] Starting for user ${userId}`);
  
  if (!userId) {
    console.error('[Manual Reminder Generation] No user ID provided');
    return [];
  }
  
  try {
    // First fetch the user's dogs
    const { data: dogs, error: dogsError } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', userId);
      
    if (dogsError) {
      console.error('[Manual Reminder Generation] Error fetching dogs:', dogsError);
      return [];
    }
    
    const userDogs = dogs || [];
    console.log(`[Manual Reminder Generation] Found ${userDogs.length} dogs for user`);
    
    // Import services dynamically
    const { generateDogReminders } = await import('./reminders/DogReminderService');
    const { generateLitterReminders } = await import('./reminders/LitterReminderService');
    const { generateGeneralReminders } = await import('./reminders/GeneralReminderService');
    
    // Generate all reminders
    const dogReminders = generateDogReminders(userDogs);
    console.log(`[Manual Reminder Generation] Generated ${dogReminders.length} dog reminders`);
    
    const litterReminders = await generateLitterReminders(userId);
    console.log(`[Manual Reminder Generation] Generated ${litterReminders.length} litter reminders`);
    
    const generalReminders = generateGeneralReminders(userDogs);
    console.log(`[Manual Reminder Generation] Generated ${generalReminders.length} general reminders`);
    
    const allReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    return allReminders;
  } catch (error) {
    console.error('[Manual Reminder Generation] Failed:', error);
    return [];
  }
};
