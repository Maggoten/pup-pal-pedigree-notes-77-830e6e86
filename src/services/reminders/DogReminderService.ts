
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, isSameMonth, isSameDay, addYears, startOfDay, isAfter, isBefore, isToday } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';
import { v5 as uuidv5 } from 'uuid';
import i18n from '@/i18n';
import { HeatService } from '@/services/HeatService';

// Namespace UUID for deterministic reminder IDs (prevents collisions)
const REMINDER_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Helper method to get translation with fallback
const t = (key: string, options?: any): string => {
  return i18n.t(key, { ...options, ns: 'home' }) as string;
};

// Generate deterministic UUID based on dog ID, type, and date
const generateSystemReminderId = (dogId: string, type: string, date: Date): string => {
  // Create a deterministic seed from dog ID, type, and date
  const seed = `${dogId}-${type}-${date.toDateString()}`;
  // Generate deterministic UUID that will always be the same for the same inputs
  return uuidv5(seed, REMINDER_NAMESPACE);
};

export const generateDogReminders = async (dogs: Dog[]): Promise<Reminder[]> => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  console.log(`Generating reminders for ${dogs.length} dogs`);
  
  // Process each dog for upcoming events
  for (const dog of dogs) {
    console.log(`Processing dog: ${dog.name}, ID: ${dog.id}, Owner ID: ${dog.owner_id}`);
    
    // Heat cycle reminders have been removed to prevent daily bombardment
    // Heat tracking is still available in the heat management section
    
    // Check for upcoming vaccinations - EXTENDED TO 14 DAYS
    if (dog.vaccinationDate) {
      console.log(`Dog ${dog.name}: Has vaccination date: ${dog.vaccinationDate}`);
      const lastVaccination = parseISO(dog.vaccinationDate);
      const nextVaccination = addYears(lastVaccination, 1); // Yearly vaccinations
      
      const daysUntilVaccination = differenceInDays(nextVaccination, today);
      console.log(`Dog ${dog.name}: Next vaccination date: ${nextVaccination.toISOString()}, Days until: ${daysUntilVaccination}`);
      
      // Create reminder if vaccination is due within the next 14 days or up to 7 days overdue
      if (daysUntilVaccination >= -7 && daysUntilVaccination <= 14) {
        const isOverdue = daysUntilVaccination < 0;
        const days = Math.abs(daysUntilVaccination);
        
        reminders.push({
          id: generateSystemReminderId(dog.id, 'vaccination', nextVaccination),
          title: '',
          description: '',
          titleKey: 'events.vaccination.title',
          descriptionKey: isOverdue ? 'events.vaccination.overdue' : 'events.vaccination.upcoming',
          translationData: { dogName: dog.name, days },
          icon: createCalendarClockIcon("amber-500"),
          dueDate: nextVaccination,
          priority: isOverdue ? 'high' : 'medium',
          type: 'vaccination', 
          relatedId: dog.id
        });
        console.log(`Created vaccination reminder for dog ${dog.name}`);
      }
    } else {
      console.log(`Dog ${dog.name}: No vaccination date recorded`);
    }
    
    // Check for dog birthdays - EXTENDED TO 14 DAYS
    if (dog.dateOfBirth) {
      const birthdate = parseISO(dog.dateOfBirth);
      const currentYear = today.getFullYear();
      const birthdateThisYear = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
      
      // If birthday already passed this year, calculate for next year
      const nextBirthday = isBefore(birthdateThisYear, today) 
        ? new Date(currentYear + 1, birthdate.getMonth(), birthdate.getDate())
        : birthdateThisYear;
      
      const daysUntilBirthday = differenceInDays(nextBirthday, today);
      console.log(`Dog ${dog.name}: Birthday: ${birthdate.toISOString()}, Next birthday: ${nextBirthday.toISOString()}, Days until: ${daysUntilBirthday}`);
      
      // Show birthday reminders within 14 days before and 2 days after
      if (daysUntilBirthday <= 14 && daysUntilBirthday >= -2) {
        const age = isToday(nextBirthday) 
          ? currentYear - birthdate.getFullYear() 
          : (currentYear + (isBefore(birthdateThisYear, today) ? 1 : 0)) - birthdate.getFullYear();
        
        let days = daysUntilBirthday;
        let descriptionKey: string;
        if (daysUntilBirthday === 0) {
          descriptionKey = 'events.birthday.today';
        } else if (daysUntilBirthday > 0) {
          descriptionKey = 'events.birthday.upcoming';
        } else {
          descriptionKey = 'events.birthday.recent';
          days = Math.abs(daysUntilBirthday);
        }
        
        reminders.push({
          id: generateSystemReminderId(dog.id, 'birthday', nextBirthday),
          title: '',
          description: '',
          titleKey: 'events.birthday.title',
          descriptionKey,
          translationData: { dogName: dog.name, age, days },
          icon: createPawPrintIcon("blue-500"),
          dueDate: nextBirthday,
          priority: 'medium',
          type: 'birthday',
          relatedId: dog.id
        });
        console.log(`Created birthday reminder for dog ${dog.name}`);
      }
    }
  }
  
  console.log(`Generated ${reminders.length} total dog reminders`);
  return reminders;
};
