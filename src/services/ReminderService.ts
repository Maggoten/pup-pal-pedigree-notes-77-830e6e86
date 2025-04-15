
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { 
  generateDogReminders 
} from '@/services/reminders/DogReminderService';
import { 
  generateLitterReminders 
} from '@/services/reminders/LitterReminderService';
import { 
  generateGeneralReminders 
} from '@/services/reminders/GeneralReminderService';

// Re-export the reminder generation functions for backward compatibility
export { 
  generateDogReminders,
  generateLitterReminders,
  generateGeneralReminders
};
