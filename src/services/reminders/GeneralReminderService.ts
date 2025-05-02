
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
  
  // Generate health check reminders for any dog that hasn't had a health check in the last 6 months
  const healthCheckRemindersDogs = dogs.filter(dog => {
    // Skip dogs with missing vaccination and deworming dates
    if (!dog.vaccinationDate && !dog.dewormingDate) return false;
    
    // Check if vaccination date is older than 6 months
    if (dog.vaccinationDate) {
      const vaccinationDate = parseISO(dog.vaccinationDate);
      const monthsSinceVaccination = differenceInMonths(today, vaccinationDate);
      if (monthsSinceVaccination >= 9) return true;
    }
    
    // Check if deworming date is older than 3 months
    if (dog.dewormingDate) {
      const dewormingDate = parseISO(dog.dewormingDate);
      const monthsSinceDeworming = differenceInMonths(today, dewormingDate);
      if (monthsSinceDeworming >= 4) return true;
    }
    
    return false;
  });
  
  // Add health check reminders
  healthCheckRemindersDogs.forEach(dog => {
    reminders.push({
      id: `general-healthcheck-${dog.id}`,
      title: `General Health Check for ${dog.name}`,
      description: `${dog.name} may be due for a general health examination`,
      icon: createCalendarClockIcon('emerald-500'),
      dueDate: today,
      priority: 'medium',
      type: 'vet-visit',
      relatedId: dog.id
    });
  });
  
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
