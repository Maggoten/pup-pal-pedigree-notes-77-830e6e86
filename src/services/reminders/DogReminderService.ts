
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, isSameMonth, isSameDay, addYears, startOfDay, isAfter, isBefore, isToday } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';
import { v5 as uuidv5 } from 'uuid';

// Namespace UUID for deterministic reminder IDs (prevents collisions)
const REMINDER_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// Generate deterministic UUID based on dog ID, type, and date
const generateSystemReminderId = (dogId: string, type: string, date: Date): string => {
  // Create a deterministic seed from dog ID, type, and date
  const seed = `${dogId}-${type}-${date.toDateString()}`;
  // Generate deterministic UUID that will always be the same for the same inputs
  return uuidv5(seed, REMINDER_NAMESPACE);
};

export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  console.log(`Generating reminders for ${dogs.length} dogs`);
  
  // Check each dog for upcoming events
  dogs.forEach((dog) => {
    console.log(`Processing dog: ${dog.name}, ID: ${dog.id}, Owner ID: ${dog.owner_id}`);
    
    // If female and not sterilized, check if heat tracking should be suggested or if cycle reminders should be created
    if (dog.gender === 'female' && !dog.sterilization_date) {
      // Check if dog has heat history
      if (!dog.heatHistory || dog.heatHistory.length === 0) {
        // Suggest starting heat tracking
        reminders.push({
          id: generateSystemReminderId(dog.id, 'heat-tracking', today),
          title: `Start Heat Tracking for ${dog.name}`,
          description: `Begin tracking heat cycles for better breeding management`,
          icon: createPawPrintIcon("pink-500"),
          dueDate: today,
          priority: 'medium',
          type: 'other', 
          relatedId: dog.id
        });
        console.log(`Created heat tracking suggestion for dog ${dog.name}`);
      } else {
        // Has heat history, create cycle reminders
      // Find the last heat date
      const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastHeatDate = parseISO(sortedHeatDates[0].date);
      // Use heat interval if available, otherwise default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      const nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      console.log(`Dog ${dog.name}: Last heat date: ${lastHeatDate.toISOString()}, Next heat: ${nextHeatDate.toISOString()}, Days until: ${differenceInDays(nextHeatDate, today)}`);
      
      // Show reminder for upcoming heat 30 days in advance
      if (isAfter(nextHeatDate, today) && differenceInDays(nextHeatDate, today) <= 30) {
        reminders.push({
          id: generateSystemReminderId(dog.id, 'heat', nextHeatDate),
          title: `${dog.name}'s Heat Approaching`,
          description: `Expected heat cycle in ${differenceInDays(nextHeatDate, today)} days`,
          icon: createPawPrintIcon("rose-500"),
          dueDate: nextHeatDate,
          priority: 'high',
          type: 'heat', 
          relatedId: dog.id
        });
        console.log(`Created heat reminder for dog ${dog.name}`);
      }
    }
  }
    
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
        
        reminders.push({
          id: generateSystemReminderId(dog.id, 'vaccination', nextVaccination),
          title: `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due Soon'}`,
          description: isOverdue 
            ? `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days`
            : `Vaccination due in ${daysUntilVaccination} days`,
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
        
        reminders.push({
          id: generateSystemReminderId(dog.id, 'birthday', nextBirthday),
          title: `${dog.name}'s Birthday`,
          description: daysUntilBirthday === 0 
            ? `${dog.name} turns ${age} today!` 
            : daysUntilBirthday > 0 
              ? `${dog.name} turns ${age} in ${daysUntilBirthday} days`
              : `${dog.name} turned ${age} ${Math.abs(daysUntilBirthday)} day${Math.abs(daysUntilBirthday) !== 1 ? 's' : ''} ago`,
          icon: createPawPrintIcon("blue-500"),
          dueDate: nextBirthday,
          priority: 'medium',
          type: 'birthday',
          relatedId: dog.id
        });
        console.log(`Created birthday reminder for dog ${dog.name}`);
      }
    }
  });
  
  console.log(`Generated ${reminders.length} total dog reminders`);
  return reminders;
};
