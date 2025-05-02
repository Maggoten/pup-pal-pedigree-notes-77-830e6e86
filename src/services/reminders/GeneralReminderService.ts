
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { differenceInMonths, parseISO, startOfDay } from 'date-fns';

/**
 * Generate general breeding-related reminders
 */
export const generateGeneralReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  // Female dogs of breeding age without heat records
  const femaleDogsWithoutHeatRecords = dogs.filter(dog => {
    if (dog.gender !== 'female') return false;
    if (!dog.dateOfBirth) return false;
    
    const birthDate = parseISO(dog.dateOfBirth);
    const ageInMonths = differenceInMonths(today, birthDate);
    
    // Only consider dogs older than 6 months (potential breeding age)
    if (ageInMonths < 6) return false;
    
    // Check if the dog has heat records
    return !dog.heatHistory || dog.heatHistory.length === 0;
  });
  
  // Add heat tracking reminders
  femaleDogsWithoutHeatRecords.forEach(dog => {
    reminders.push({
      id: `general-heat-tracking-${dog.id}`,
      title: `Start Heat Tracking for ${dog.name}`,
      description: `${dog.name} is of breeding age but has no heat records`,
      icon: createCalendarClockIcon('purple-500'),
      dueDate: today,
      priority: 'low',
      type: 'other',
      relatedId: dog.id
    });
  });
  
  return reminders;
};
