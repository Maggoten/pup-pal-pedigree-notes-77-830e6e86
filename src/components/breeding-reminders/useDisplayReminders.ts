
import { useMemo } from 'react';
import { Reminder } from '@/types/reminders';

export const useDisplayReminders = (reminders: Reminder[] = []) => {
  // Memoize the priority filtering logic to avoid recalculating on every render
  const displayReminders = useMemo(() => {
    if (!reminders || !Array.isArray(reminders)) {
      console.warn("BreedingReminders component received invalid reminders:", reminders);
      return [];
    }
    
    console.log("BreedingReminders - Calculating display reminders from", reminders.length, "reminders");
    
    // First prioritize vaccination reminders regardless of priority
    const vaccinationReminders = reminders
      .filter(r => r.type === 'vaccination' && !r.isCompleted)
      .slice(0, 3);
      
    console.log(`BreedingReminders - Found ${vaccinationReminders.length} vaccination reminders for display`);
    
    // Then high priority reminders that aren't vaccinations
    const highPriorityReminders = reminders
      .filter(r => r.priority === 'high' && !r.isCompleted && r.type !== 'vaccination')
      .slice(0, 3 - vaccinationReminders.length);
      
    // Then medium priority reminders if we need more
    const mediumPriorityReminders = reminders
      .filter(r => r.priority === 'medium' && !r.isCompleted && r.type !== 'vaccination') 
      .slice(0, 3 - vaccinationReminders.length - highPriorityReminders.length);
      
    // Finally low priority if needed
    const lowPriorityReminders = reminders
      .filter(r => r.priority === 'low' && !r.isCompleted)
      .slice(0, 3 - vaccinationReminders.length - highPriorityReminders.length - mediumPriorityReminders.length);
    
    // Combine all reminders in priority order
    const result = [
      ...vaccinationReminders,
      ...highPriorityReminders,
      ...mediumPriorityReminders,
      ...lowPriorityReminders
    ];
    
    // If no active reminders, show completed ones
    if (result.length === 0 && reminders.length > 0) {
      const completedReminders = reminders
        .filter(r => r.isCompleted)
        .slice(0, 3);
      
      result.push(...completedReminders);
    }

    console.log("BreedingReminders - Displaying reminders:", result.map(r => `${r.title} (${r.type}) - Priority: ${r.priority}`));
    return result;
  }, [reminders]);

  return {
    displayReminders,
    hasReminders: displayReminders.length > 0
  };
};
