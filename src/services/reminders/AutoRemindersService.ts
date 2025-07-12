
import { PlannedLitter } from '@/types/breeding';
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, addYears, isAfter, isBefore, parseISO } from 'date-fns';
import { createCalendarClockIcon, createPawPrintIcon } from '@/utils/iconUtils';
import { v5 as uuidv5 } from 'uuid';

// Namespace UUID for deterministic reminder IDs (prevents collisions)
const REMINDER_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Generate deterministic UUID for system reminders
const generateSystemReminderId = (relatedId: string, type: string, date: Date): string => {
  // Create a deterministic seed from related ID, type, and date
  const seed = `${relatedId}-${type}-${date.toDateString()}`;
  // Generate deterministic UUID that will always be the same for the same inputs
  return uuidv5(seed, REMINDER_NAMESPACE);
};

/**
 * Generate reminders for upcoming planned heat dates
 */
export const generatePlannedHeatReminders = (plannedLitters: PlannedLitter[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Filter litters with upcoming heat dates within the next 30 days
  const upcomingHeats = plannedLitters.filter(litter => {
    const heatDate = new Date(litter.expectedHeatDate);
    const daysUntil = differenceInDays(heatDate, today);
    return daysUntil >= 0 && daysUntil <= 30;
  });
  
  // Create reminders for upcoming heats
  upcomingHeats.forEach(litter => {
    const heatDate = new Date(litter.expectedHeatDate);
    const daysUntil = differenceInDays(heatDate, today);
    
    reminders.push({
      id: generateSystemReminderId(litter.femaleId, 'planned-heat', heatDate),
      title: `Upcoming Heat for ${litter.femaleName}`,
      description: `Heat expected in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      dueDate: heatDate,
      priority: 'high',
      type: 'heat',
      icon: createPawPrintIcon("rose-500"),
      relatedId: litter.femaleId
    });
  });
  
  return reminders;
};

/**
 * Generate enhanced birthday reminders for dogs - EXTENDED TO 14 DAYS
 */
export const generateEnhancedBirthdayReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  dogs.forEach(dog => {
    if (!dog.dateOfBirth) return;
    
    const birthdate = parseISO(dog.dateOfBirth);
    const currentYear = today.getFullYear();
    
    // Calculate next birthday
    const birthdateThisYear = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
    const nextBirthday = isBefore(birthdateThisYear, today)
      ? new Date(currentYear + 1, birthdate.getMonth(), birthdate.getDate())
      : birthdateThisYear;
    
    const daysUntil = differenceInDays(nextBirthday, today);
    
    // If birthday is within 14 days (extended from 7 days)
    if (daysUntil >= 0 && daysUntil <= 14) {
      const age = isBefore(birthdateThisYear, today)
        ? currentYear + 1 - birthdate.getFullYear()
        : currentYear - birthdate.getFullYear();
      
      reminders.push({
        id: generateSystemReminderId(dog.id, 'enhanced-birthday', nextBirthday),
        title: `${dog.name}'s Birthday Coming Up!`,
        description: `${dog.name} will turn ${age} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        dueDate: nextBirthday,
        priority: 'medium',
        type: 'birthday',
        icon: createPawPrintIcon("blue-500"),
        relatedId: dog.id
      });
    }
  });
  
  return reminders;
};

/**
 * Generate vaccination reminders for dogs - EXTENDED TO 14 DAYS
 */
export const generateVaccinationReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  dogs.forEach(dog => {
    if (!dog.vaccinationDate) return;
    
    const lastVaccination = parseISO(dog.vaccinationDate);
    const nextVaccination = addYears(lastVaccination, 1); // Annual vaccination schedule
    
    const daysUntil = differenceInDays(nextVaccination, today);
    
    // If next vaccination is within 14 days or overdue by up to 30 days (extended from 7 days)
    if (daysUntil >= -30 && daysUntil <= 14) {
      const isOverdue = daysUntil < 0;
      
      reminders.push({
        id: generateSystemReminderId(dog.id, 'enhanced-vaccination', nextVaccination),
        title: `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due Soon'}`,
        description: isOverdue 
          ? `Vaccination overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
          : `Vaccination due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        dueDate: nextVaccination,
        priority: 'high',
        type: 'vaccination',
        icon: createCalendarClockIcon("amber-500"),
        relatedId: dog.id
      });
    }
  });
  
  return reminders;
};

/**
 * Enhanced merge function that prevents duplicates more robustly
 * Prioritizes custom reminders over system reminders
 * Uses deterministic IDs and type+relatedId+date matching for safety
 */
export const mergeReminders = (...reminderSets: Reminder[][]): Reminder[] => {
  const allReminders: Reminder[] = [];
  const seenIds = new Set<string>();
  const duplicateKeys = new Set<string>(); // Track type+relatedId+date combinations
  
  // Create debug helper
  const debugMerge = (source: string, reminder: Reminder, isAdded: boolean, reason?: string) => {
    console.log(`[Reminders Debug] ${source} - ${reminder.title} (${reminder.id}) - ${isAdded ? 'Added' : `Skipped${reason ? ': ' + reason : ''}`}`);
  };
  
  // Helper to create duplicate detection key
  const createDuplicateKey = (reminder: Reminder): string => {
    const dateKey = reminder.dueDate.toDateString();
    return `${reminder.type}-${reminder.relatedId || 'none'}-${dateKey}`;
  };
  
  // Process all reminder sets with priority order
  reminderSets.forEach((reminderSet, setIndex) => {
    const source = setIndex === 0 ? 'UserReminder' :
                   setIndex === 1 ? 'DogReminder' :
                   setIndex === 2 ? 'LitterReminder' :
                   setIndex === 3 ? 'GeneralReminder' :
                   setIndex === 4 ? 'PlannedHeatReminder' :
                   setIndex === 5 ? 'BirthdayReminder' : 'VaccinationReminder';
    
    (reminderSet || []).forEach(reminder => {
      // Check for exact ID match (deterministic IDs should prevent this)
      if (seenIds.has(reminder.id)) {
        debugMerge(source, reminder, false, 'duplicate ID');
        return;
      }
      
      // Check for logical duplicate (same type, related item, and date)
      const duplicateKey = createDuplicateKey(reminder);
      if (duplicateKeys.has(duplicateKey)) {
        debugMerge(source, reminder, false, 'duplicate type+relatedId+date');
        return;
      }
      
      // Additional safety check: don't add system reminders that are too similar to custom ones
      if (source !== 'UserReminder') {
        const hasSimilarCustomReminder = allReminders.some(existing => 
          existing.type === reminder.type && 
          existing.relatedId === reminder.relatedId &&
          Math.abs(existing.dueDate.getTime() - reminder.dueDate.getTime()) < 24 * 60 * 60 * 1000 // Within 1 day
        );
        
        if (hasSimilarCustomReminder) {
          debugMerge(source, reminder, false, 'similar custom reminder exists');
          return;
        }
      }
      
      // Add the reminder
      seenIds.add(reminder.id);
      duplicateKeys.add(duplicateKey);
      allReminders.push(reminder);
      debugMerge(source, reminder, true);
    });
  });
  
  console.log(`[Reminders Debug] Merged ${allReminders.length} reminders from ${reminderSets.length} sources`);
  
  return allReminders;
};
