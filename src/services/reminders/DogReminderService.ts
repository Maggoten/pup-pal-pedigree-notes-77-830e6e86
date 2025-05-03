
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, addYears, startOfDay, isAfter, isBefore, isToday } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';
import { dateToISOString, parseISODate } from '@/utils/dateUtils';

export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  console.log(`Generating reminders for ${dogs.length} dogs`);
  
  // Check each dog for upcoming events
  dogs.forEach((dog) => {
    console.log(`Processing dog: ${dog.name}, ID: ${dog.id}, Owner ID: ${dog.owner_id}`);
    
    // If female, add heat cycle reminders (assuming a 6-month cycle)
    if (dog.gender === 'female' && dog.heatHistory && dog.heatHistory.length > 0) {
      // Find the last heat date
      const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const lastHeatDate = parseISODate(sortedHeatDates[0].date) || new Date();
      // Use heat interval if available, otherwise default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      const nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      console.log(`Dog ${dog.name}: Last heat date: ${lastHeatDate.toISOString()}, Next heat: ${nextHeatDate.toISOString()}, Days until: ${differenceInDays(nextHeatDate, today)}`);
      
      // Show reminder for upcoming heat 30 days in advance
      if (isAfter(nextHeatDate, today) && differenceInDays(nextHeatDate, today) <= 30) {
        reminders.push({
          id: `heat-${dog.id}`,
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
    
    // Check for upcoming vaccinations
    if (dog.vaccinationDate) {
      const lastVaccination = parseISODate(dog.vaccinationDate) || new Date();
      const nextVaccination = addYears(lastVaccination, 1); // Yearly vaccinations
      
      const daysUntilVaccination = differenceInDays(nextVaccination, today);
      console.log(`Dog ${dog.name} (ID: ${dog.id}): Vaccination date: ${dog.vaccinationDate}, Last vaccination: ${lastVaccination.toISOString()}`);
      console.log(`Dog ${dog.name}: Next vaccination date: ${nextVaccination.toISOString()}, Days until: ${daysUntilVaccination}`);
      
      // Create reminder if vaccination is due within the next 30 days or up to 7 days overdue
      if (daysUntilVaccination >= -7 && daysUntilVaccination <= 30) {
        const isOverdue = daysUntilVaccination < 0;
        
        const vaccinationReminder = {
          id: `vaccine-${dog.id}`,
          title: `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due'}`,
          description: isOverdue 
            ? `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days`
            : `Vaccination due in ${daysUntilVaccination} days`,
          icon: createCalendarClockIcon("amber-500"),
          dueDate: nextVaccination,
          priority: isOverdue ? 'high' : 'medium',
          type: 'vaccination',
          relatedId: dog.id
        };
        
        reminders.push(vaccinationReminder);
        console.log(`Created vaccination reminder for dog ${dog.name}:`, JSON.stringify(vaccinationReminder));
      } else {
        console.log(`No vaccination reminder needed for ${dog.name}: ${daysUntilVaccination} days until due date`);
      }
    } else {
      console.log(`Dog ${dog.name}: No vaccination date recorded`);
    }
    
    // Check for dog birthdays
    if (dog.dateOfBirth) {
      const birthdate = parseISODate(dog.dateOfBirth) || new Date();
      const currentYear = today.getFullYear();
      const birthdateThisYear = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
      
      // If birthday already passed this year, calculate for next year
      const nextBirthday = isBefore(birthdateThisYear, today) 
        ? new Date(currentYear + 1, birthdate.getMonth(), birthdate.getDate())
        : birthdateThisYear;
      
      const daysUntilBirthday = differenceInDays(nextBirthday, today);
      console.log(`Dog ${dog.name}: Birthday: ${birthdate.toISOString()}, Next birthday: ${nextBirthday.toISOString()}, Days until: ${daysUntilBirthday}`);
      
      // Show birthday reminders within 7 days before and 2 days after
      if (daysUntilBirthday <= 7 && daysUntilBirthday >= -2) {
        const age = isToday(nextBirthday) 
          ? currentYear - birthdate.getFullYear() 
          : (currentYear + (isBefore(birthdateThisYear, today) ? 1 : 0)) - birthdate.getFullYear();
        
        reminders.push({
          id: `birthday-${dog.id}`,
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
    }
  });
  
  console.log(`Generated ${reminders.length} total dog reminders`);
  return reminders;
};
