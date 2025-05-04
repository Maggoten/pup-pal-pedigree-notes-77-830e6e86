
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, addYears, startOfDay, isAfter, isBefore, isToday, format, isSameDay } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';
import { dateToISOString, parseISODate } from '@/utils/dateUtils';

export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  console.log(`Generating reminders for ${dogs.length} dogs - Today is ${format(today, 'yyyy-MM-dd')}`);
  
  // Check each dog for upcoming events
  dogs.forEach((dog) => {
    console.log(`Processing dog: ${dog.name}, ID: ${dog.id}, Owner ID: ${dog.owner_id}`);
    console.log(`Dog data: Vaccination date: ${dog.vaccinationDate}, Heat history: ${dog.heatHistory ? dog.heatHistory.length : 0} entries`);
    
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
      
      console.log(`Dog ${dog.name}: Last heat date: ${format(lastHeatDate, 'yyyy-MM-dd')}, Next heat: ${format(nextHeatDate, 'yyyy-MM-dd')}, Days until: ${differenceInDays(nextHeatDate, today)}`);
      
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
      console.log(`[VACCINATION DEBUG] Processing vaccination for ${dog.name} (ID: ${dog.id})`);
      console.log(`[VACCINATION DEBUG] Vaccination date string: ${dog.vaccinationDate}`);
      
      try {
        const lastVaccination = parseISODate(dog.vaccinationDate);
        if (!lastVaccination) {
          console.error(`[VACCINATION DEBUG] Failed to parse vaccination date for ${dog.name}: ${dog.vaccinationDate}`);
          return; // Skip this vaccination reminder
        }
        
        console.log(`[VACCINATION DEBUG] Parsed last vaccination: ${format(lastVaccination, 'yyyy-MM-dd')}`);
        
        // FIXED: Calculate next vaccination properly accounting for the current year
        // Get the month and day from the last vaccination
        const lastVaccinationMonth = lastVaccination.getMonth();
        const lastVaccinationDay = lastVaccination.getDate();
        const currentYear = today.getFullYear();
        
        // Create a date for this year's vaccination using month and day from last vaccination
        const thisYearsVaccination = new Date(currentYear, lastVaccinationMonth, lastVaccinationDay);
        
        // Create a date for next year's vaccination
        const nextYearsVaccination = new Date(currentYear + 1, lastVaccinationMonth, lastVaccinationDay);
        
        // Decide which vaccination date to use
        let nextVaccination;
        if (isAfter(thisYearsVaccination, today) || isSameDay(thisYearsVaccination, today)) {
          nextVaccination = thisYearsVaccination;
          console.log(`[VACCINATION DEBUG] Using this year's vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}`);
        } else {
          nextVaccination = nextYearsVaccination;
          console.log(`[VACCINATION DEBUG] Using next year's vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}`);
        }
        
        // Calculate days until vaccination
        const daysUntilVaccination = differenceInDays(nextVaccination, today);
        
        console.log(`[VACCINATION DEBUG] Dog ${dog.name}: Next vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}, Days until: ${daysUntilVaccination}`);
        
        // Updated condition: Create reminder if vaccination is due within the next 60 days 
        // or up to 14 days overdue
        if (daysUntilVaccination >= -14 && daysUntilVaccination <= 60) {
          const isOverdue = daysUntilVaccination < 0;
          
          const vaccinationReminder: Reminder = {
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
          console.log(`[VACCINATION DEBUG] Created vaccination reminder for dog ${dog.name}:`, JSON.stringify(vaccinationReminder));
        } else {
          console.log(`[VACCINATION DEBUG] No vaccination reminder needed for ${dog.name}: ${daysUntilVaccination} days until due date`);
        }
      } catch (err) {
        console.error(`[VACCINATION ERROR] Error processing vaccination for ${dog.name}:`, err);
      }
    } else {
      console.log(`Dog ${dog.name}: No vaccination date recorded`);
    }
    
    // Check for dog birthdays
    if (dog.dateOfBirth) {
      try {
        const birthdate = parseISODate(dog.dateOfBirth);
        if (!birthdate) {
          console.error(`Failed to parse birthdate for ${dog.name}: ${dog.dateOfBirth}`);
          return; // Skip this birthday reminder
        }
        
        const currentYear = today.getFullYear();
        const birthdateThisYear = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
        
        // If birthday already passed this year, calculate for next year
        const nextBirthday = isBefore(birthdateThisYear, today) 
          ? new Date(currentYear + 1, birthdate.getMonth(), birthdate.getDate())
          : birthdateThisYear;
        
        const daysUntilBirthday = differenceInDays(nextBirthday, today);
        console.log(`Dog ${dog.name}: Birthday: ${format(birthdate, 'yyyy-MM-dd')}, Next birthday: ${format(nextBirthday, 'yyyy-MM-dd')}, Days until: ${daysUntilBirthday}`);
        
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
      } catch (err) {
        console.error(`Error processing birthday for ${dog.name}:`, err);
      }
    }
  });
  
  // Summarize vaccination reminders for debugging
  const vaccinationReminders = reminders.filter(r => r.type === 'vaccination');
  console.log(`[VACCINATION SUMMARY] Generated ${vaccinationReminders.length} vaccination reminders:`);
  vaccinationReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${format(r.dueDate, 'yyyy-MM-dd')}, priority: ${r.priority})`);
  });
  
  console.log(`Generated ${reminders.length} total dog reminders`);
  return reminders;
};
