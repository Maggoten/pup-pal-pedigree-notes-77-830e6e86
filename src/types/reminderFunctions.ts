
import { Reminder } from './reminders';
import { Dog } from './dogs';

/**
 * Type definition for the triggerAllReminders function
 * Ensures TypeScript correctly identifies the function signature
 */
export type TriggerAllRemindersFunction = (
  userId: string, 
  dogs: Dog[]
) => Promise<Reminder[]>;
