import { PlannedLitter } from '@/types/breeding';
import { Dog } from '@/types/dogs';
import { Reminder, createReminder } from '@/types/reminders';
import { differenceInDays, addYears, isAfter, isBefore, parseISO } from 'date-fns';
import { createCalendarClockIcon, createPawPrintIcon } from '@/utils/iconUtils';

/**
 * Generate reminders for upcoming planned heat dates
 */
export const generatePlannedHeatReminders = (plannedLitters: PlannedLitter[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Filter litters with upcoming heat dates within the next 30 days (changed from 14 to 30)
  const upcomingHeats = plannedLitters.filter(litter => {
    const heatDate = new Date(litter.expectedHeatDate);
    const daysUntil = differenceInDays(heatDate, today);
    return daysUntil >= 0 && daysUntil <= 30; // Changed from 14 to 30 days
  });
  
  // Create reminders for upcoming heats
  upcomingHeats.forEach(litter => {
    const heatDate = new Date(litter.expectedHeatDate);
    const daysUntil = differenceInDays(heatDate, today);
    
    reminders.push(createReminder({
      id: `auto_planned-heat-${litter.femaleId}-${litter.id}`, // Added 'auto_' prefix to avoid collisions
      title: `Upcoming Heat for ${litter.femaleName}`,
      description: `Heat expected in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      dueDate: heatDate,
      priority: 'high',
      type: 'heat',
      icon: createPawPrintIcon("rose-500"),
      relatedId: litter.femaleId
    }));
  });
  
  return reminders;
};

/**
 * Generate enhanced birthday reminders for dogs
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
    
    // If birthday is within 7 days (changed from 14 to 7)
    if (daysUntil >= 0 && daysUntil <= 7) {
      const age = isBefore(birthdateThisYear, today)
        ? currentYear + 1 - birthdate.getFullYear()
        : currentYear - birthdate.getFullYear();
      
      reminders.push(createReminder({
        id: `auto_birthday-${dog.id}-${currentYear}`, // Added 'auto_' prefix to avoid collisions
        title: `${dog.name}'s Birthday Coming Up!`,
        description: `${dog.name} will turn ${age} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        dueDate: nextBirthday,
        priority: 'medium',
        type: 'birthday',
        icon: createPawPrintIcon("blue-500"),
        relatedId: dog.id
      }));
    }
  });
  
  return reminders;
};

/**
 * Generate vaccination reminders for dogs
 */
export const generateVaccinationReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  dogs.forEach(dog => {
    if (!dog.vaccinationDate) return;
    
    const lastVaccination = parseISO(dog.vaccinationDate);
    const nextVaccination = addYears(lastVaccination, 1); // Annual vaccination schedule
    
    const daysUntil = differenceInDays(nextVaccination, today);
    
    // If next vaccination is within 7 days (changed from 14 to 7) or overdue by up to 30 days
    if (daysUntil >= -30 && daysUntil <= 7) {
      const isOverdue = daysUntil < 0;
      
      reminders.push(createReminder({
        id: `auto_vaccination-${dog.id}`, // Added 'auto_' prefix to avoid collisions
        title: `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due Soon'}`,
        description: isOverdue 
          ? `Vaccination overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
          : `Vaccination due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        dueDate: nextVaccination,
        priority: 'high',
        type: 'vaccination',
        icon: createCalendarClockIcon("amber-500"),
        relatedId: dog.id
      }));
    }
  });
  
  return reminders;
};

/**
 * Merge multiple reminder sources while avoiding duplicates
 */
export const mergeReminders = (...reminderSets: Reminder[][]): Reminder[] => {
  const allReminders: Reminder[] = [];
  const seenIds = new Set<string>();
  const typeToIdsMap = new Map<string, Set<string>>(); // Track dog IDs by reminder type
  
  // Create debug helper
  const debugMerge = (source: string, reminder: Reminder, isAdded: boolean) => {
    console.log(`[Reminders Debug] ${source} - ${reminder.title} (${reminder.id}) - ${isAdded ? 'Added' : 'Skipped (duplicate)'}`);
  };
  
  // First pass: add reminders from regulated sources (custom user reminders)
  const userReminders = reminderSets[0] || [];
  userReminders.forEach(reminder => {
    seenIds.add(reminder.id);
    allReminders.push(reminder);
    
    // Track by type and related ID
    if (reminder.relatedId && reminder.type) {
      const key = `${reminder.type}-${reminder.relatedId}`;
      if (!typeToIdsMap.has(key)) {
        typeToIdsMap.set(key, new Set());
      }
      typeToIdsMap.get(key)?.add(reminder.id);
    }
    
    debugMerge('UserReminder', reminder, true);
  });
  
  // Next priority: dog reminders from generateDogReminders
  const dogReminders = reminderSets[1] || [];
  dogReminders.forEach(reminder => {
    // If we already have this ID, skip it
    if (seenIds.has(reminder.id)) {
      debugMerge('DogReminder', reminder, false);
      return;
    }
    
    // Check if we already have a reminder of the same type for the same dog
    // from user reminders (priority to user-created reminders)
    if (reminder.relatedId && reminder.type) {
      const key = `${reminder.type}-${reminder.relatedId}`;
      if (typeToIdsMap.has(key) && typeToIdsMap.get(key)!.size > 0) {
        debugMerge('DogReminder', reminder, false);
        return;
      }
      
      // Track this reminder
      if (!typeToIdsMap.has(key)) {
        typeToIdsMap.set(key, new Set());
      }
      typeToIdsMap.get(key)?.add(reminder.id);
    }
    
    seenIds.add(reminder.id);
    allReminders.push(reminder);
    debugMerge('DogReminder', reminder, true);
  });
  
  // Process remaining reminders
  for (let i = 2; i < reminderSets.length; i++) {
    const reminderSet = reminderSets[i] || [];
    const source = i === 2 ? 'LitterReminder' :
                 i === 3 ? 'GeneralReminder' :
                 i === 4 ? 'PlannedHeatReminder' :
                 i === 5 ? 'BirthdayReminder' : 'VaccinationReminder';
    
    reminderSet.forEach(reminder => {
      // Skip if we've already seen this ID
      if (seenIds.has(reminder.id)) {
        debugMerge(source, reminder, false);
        return;
      }
      
      // Check for type+relatedId collision
      if (reminder.relatedId && reminder.type) {
        const key = `${reminder.type}-${reminder.relatedId}`;
        if (typeToIdsMap.has(key) && typeToIdsMap.get(key)!.size > 0) {
          debugMerge(source, reminder, false);
          return;
        }
        
        // Track this reminder
        if (!typeToIdsMap.has(key)) {
          typeToIdsMap.set(key, new Set());
        }
        typeToIdsMap.get(key)?.add(reminder.id);
      }
      
      seenIds.add(reminder.id);
      allReminders.push(reminder);
      debugMerge(source, reminder, true);
    });
  }
  
  console.log(`[Reminders Debug] Merged ${allReminders.length} reminders from ${reminderSets.length} sources`);
  
  return allReminders;
};
