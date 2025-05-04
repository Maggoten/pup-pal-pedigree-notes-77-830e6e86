
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, format, isSameDay, isAfter } from 'date-fns';
import { createPawPrintIcon } from '@/utils/iconUtils';
import { parseISODate } from '@/utils/dateUtils';

/**
 * Generate birthday reminders for dogs
 */
export const generateBirthdayReminders = (dog: Dog, today: Date): Reminder[] => {
  const reminders: Reminder[] = [];
  
  // Skip if no birth date is available
  if (!dog.dateOfBirth) {
    return reminders;
  }
  
  try {
    const birthdate = parseISODate(dog.dateOfBirth);
    if (!birthdate) {
      console.error(`Failed to parse birthdate for ${dog.name}: ${dog.dateOfBirth}`);
      return reminders;
    }
    
    // Extract day and month from birthdate
    const birthMonth = birthdate.getMonth();
    const birthDay = birthdate.getDate();
    
    // Create dates for this year's birthday
    const thisYear = today.getFullYear();
    const nextYear = thisYear + 1;
    
    // Create normalized birthday dates at noon
    const thisYearBirthday = new Date(thisYear, birthMonth, birthDay, 12, 0, 0, 0);
    const nextYearBirthday = new Date(nextYear, birthMonth, birthDay, 12, 0, 0, 0);
    
    // Choose the appropriate birthday based on date
    let nextBirthday;
    if (isSameDay(thisYearBirthday, today) || isAfter(thisYearBirthday, today)) {
      nextBirthday = thisYearBirthday;
    } else {
      nextBirthday = nextYearBirthday;
    }
    
    const daysUntilBirthday = differenceInDays(nextBirthday, today);
    console.log(`Dog ${dog.name}: Birthday: ${format(birthdate, 'yyyy-MM-dd')}, Next birthday: ${format(nextBirthday, 'yyyy-MM-dd')}, Days until: ${daysUntilBirthday}`);
    
    // Show birthday reminders within 7 days before and 2 days after
    if (daysUntilBirthday <= 7 && daysUntilBirthday >= -2) {
      const birthYear = birthdate.getFullYear();
      const age = thisYear - birthYear + (nextBirthday === nextYearBirthday ? 1 : 0);
      
      reminders.push({
        id: `birthday-${dog.id}-${Date.now()}`, // Add timestamp for uniqueness
        title: `${dog.name}'s Birthday`,
        description: daysUntilBirthday === 0 
          ? `${dog.name} turns ${age} today!` 
          : daysUntilBirthday > 0 
            ? `${dog.name} turns ${age} in ${daysUntilBirthday} days`
            : `${dog.name} turned ${age} ${Math.abs(daysUntilBirthday)} day${Math.abs(daysUntilBirthday) !== 1 ? 's' : ''} ago`,
        icon: createPawPrintIcon("blue-500"),
        dueDate: nextBirthday,
        priority: 'low',
        type: 'birthday',
        relatedId: dog.id
      });
      console.log(`Created birthday reminder for dog ${dog.name}`);
    }
  } catch (err) {
    console.error(`Error processing birthday for ${dog.name}:`, err);
  }
  
  return reminders;
};
