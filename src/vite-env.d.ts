
/// <reference types="vite/client" />

// Explicitly declare module resolution for our reminder services
declare module '@/services/ReminderService' {
  import { TriggerAllRemindersFunction } from '@/types/reminderFunctions';
  export const triggerAllReminders: TriggerAllRemindersFunction;
  
  // Also declare exported functions from sub-modules
  import { generateDogReminders } from './reminders/DogReminderService';
  import { generateLitterReminders } from './reminders/LitterReminderService';
  import { generateGeneralReminders } from './reminders/GeneralReminderService';
  
  export { generateDogReminders, generateLitterReminders, generateGeneralReminders };
}
