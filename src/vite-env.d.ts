
/// <reference types="vite/client" />

// Explicitly declare module resolution for our reminder services
declare module '@/services/ReminderService' {
  import { TriggerAllRemindersFunction } from '@/types/reminderFunctions';
  export const triggerAllReminders: TriggerAllRemindersFunction;
}
