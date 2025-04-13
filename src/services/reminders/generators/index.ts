
import { Dog } from '@/context/DogsContext';
import { Reminder } from '@/types/reminders';
import { addSystemReminder } from '../systemReminderService';
import { generateDogReminders } from './dogReminders';
import { generateLitterReminders } from './litterReminders';
import { generateGeneralReminders } from './generalReminders';

/**
 * Generate all system reminders for a logged-in user
 */
export const generateAllSystemReminders = async (dogs: Dog[]): Promise<void> => {
  try {
    // Generate reminders from different sources
    const dogReminders = generateDogReminders(dogs);
    const litterReminders = generateLitterReminders();
    const generalReminders = generateGeneralReminders(dogs);
    
    // Combine all reminders
    const allReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    
    // Add each reminder to Supabase (if it doesn't exist already)
    for (const reminder of allReminders) {
      const { icon, ...reminderData } = reminder;
      await addSystemReminder(reminderData);
    }
  } catch (error) {
    console.error("Error generating system reminders:", error);
  }
};

// Export all generator functions
export { generateDogReminders } from './dogReminders';
export { generateLitterReminders } from './litterReminders';
export { generateGeneralReminders } from './generalReminders';
