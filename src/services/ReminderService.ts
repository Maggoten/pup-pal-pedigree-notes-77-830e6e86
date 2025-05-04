
// Unified export file for all reminder generators
export { generateDogReminders } from './reminders/DogReminderService';
export { generateLitterReminders } from './reminders/LitterReminderService';
export { generateGeneralReminders } from './reminders/GeneralReminderService';

// Add a new manual trigger function
export async function triggerAllReminders(userId: string, dogs: any[]) {
  console.log(`[Manual Reminder Generation] Starting for user ${userId}`);
  
  if (!userId) {
    console.error('[Manual Reminder Generation] No user ID provided');
    return [];
  }
  
  try {
    // Import services dynamically
    const { generateDogReminders } = await import('./reminders/DogReminderService');
    const { generateLitterReminders } = await import('./reminders/LitterReminderService');
    const { generateGeneralReminders } = await import('./reminders/GeneralReminderService');
    
    // Filter for this user's dogs
    const userDogs = dogs.filter(dog => dog.owner_id === userId);
    console.log(`[Manual Reminder Generation] Found ${userDogs.length} dogs for user`);
    
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
}
