import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, addYears, startOfDay, isAfter, isBefore, isToday, format, isSameDay, isValid } from 'date-fns';
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
      
      const lastHeatDateString = sortedHeatDates[0].date;
      console.log(`[HEAT DEBUG] Processing heat for ${dog.name}, last heat date string: ${lastHeatDateString}`);
      
      const lastHeatDate = parseISODate(lastHeatDateString);
      if (!lastHeatDate) {
        console.error(`[HEAT ERROR] Failed to parse last heat date for ${dog.name}: ${lastHeatDateString}`);
        return; // Skip heat reminders for this dog
      }
      
      // Use heat interval if available, otherwise default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      
      // Calculate the next heat date by adding the interval to the last heat date
      const nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      console.log(`[HEAT DEBUG] Dog ${dog.name}: Last heat date: ${format(lastHeatDate, 'yyyy-MM-dd')}, Next heat: ${format(nextHeatDate, 'yyyy-MM-dd')}`);
      console.log(`[HEAT DEBUG] Days until next heat: ${differenceInDays(nextHeatDate, today)}, Interval: ${intervalDays} days`);
      
      // Show reminder for upcoming heat 30 days in advance
      const daysUntilHeat = differenceInDays(nextHeatDate, today);
      console.log(`[HEAT DEBUG] Days until heat for ${dog.name}: ${daysUntilHeat}`);
      
      if (daysUntilHeat <= 30 && daysUntilHeat >= -5) { // Show reminder even if up to 5 days past
        reminders.push({
          id: `heat-${dog.id}-${Date.now()}`, // Add timestamp for uniqueness
          title: `${dog.name}'s Heat ${daysUntilHeat < 0 ? 'Started' : 'Approaching'}`,
          description: daysUntilHeat < 0 
            ? `Heat started ${Math.abs(daysUntilHeat)} days ago` 
            : `Expected heat cycle in ${daysUntilHeat} days`,
          icon: createPawPrintIcon("rose-500"),
          dueDate: nextHeatDate,
          priority: daysUntilHeat <= 7 ? 'high' : 'medium',
          type: 'heat',
          relatedId: dog.id
        });
        console.log(`[HEAT DEBUG] Created heat reminder for dog ${dog.name}`);
      } else {
        console.log(`[HEAT DEBUG] No heat reminder created for ${dog.name}, outside window: ${daysUntilHeat} days until heat`);
      }
    }
    
    // Check for upcoming vaccinations
    if (dog.vaccinationDate) {
      console.log(`[VACCINATION DEBUG] Processing vaccination for ${dog.name} (ID: ${dog.id})`);
      console.log(`[VACCINATION DEBUG] Vaccination date string: ${dog.vaccinationDate}`);
      
      try {
        const lastVaccination = parseISODate(dog.vaccinationDate);
        if (!lastVaccination || !isValid(lastVaccination)) {
          console.error(`[VACCINATION DEBUG] Failed to parse vaccination date for ${dog.name}: ${dog.vaccinationDate}`);
          return; // Skip this vaccination reminder
        }
        
        console.log(`[VACCINATION DEBUG] Parsed last vaccination: ${format(lastVaccination, 'yyyy-MM-dd')}`);
        
        // Extract day and month from the last vaccination date
        const lastVaccinationMonth = lastVaccination.getMonth();
        const lastVaccinationDay = lastVaccination.getDate();
        
        // Create dates for both this year and next year's vaccinations
        const thisYear = today.getFullYear();
        const nextYear = thisYear + 1;
        
        // Create normalized dates at noon to avoid time comparison issues
        const thisYearVaccination = new Date(thisYear, lastVaccinationMonth, lastVaccinationDay, 12, 0, 0, 0);
        const nextYearVaccination = new Date(nextYear, lastVaccinationMonth, lastVaccinationDay, 12, 0, 0, 0);
        
        console.log(`[VACCINATION DEBUG] Today: ${format(today, 'yyyy-MM-dd')} `);
        console.log(`[VACCINATION DEBUG] This year vaccination: ${format(thisYearVaccination, 'yyyy-MM-dd')}`);
        console.log(`[VACCINATION DEBUG] Next year vaccination: ${format(nextYearVaccination, 'yyyy-MM-dd')}`);
        
        // Decide which vaccination date to use - the closest future date or most recent past date
        let nextVaccination;
        let daysUntilVaccination;
        
        if (isSameDay(thisYearVaccination, today) || isAfter(thisYearVaccination, today)) {
          // If this year's date is today or in the future, use it
          nextVaccination = thisYearVaccination;
          daysUntilVaccination = differenceInDays(thisYearVaccination, today);
          console.log(`[VACCINATION DEBUG] Using this year's vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}`);
        } else {
          // Otherwise use next year's date
          nextVaccination = nextYearVaccination;
          daysUntilVaccination = differenceInDays(nextYearVaccination, today);
          console.log(`[VACCINATION DEBUG] Using next year's vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}`);
        }
        
        console.log(`[VACCINATION DEBUG] Dog ${dog.name}: Days until vaccination: ${daysUntilVaccination}`);
        
        // Create reminder if vaccination is:
        // 1. Coming up in the next 60 days, or
        // 2. Overdue by up to 30 days, or
        // 3. Today
        if (daysUntilVaccination >= -30 && daysUntilVaccination <= 60) {
          const isOverdue = daysUntilVaccination < 0;
          const isToday = daysUntilVaccination === 0;
          
          const reminderPriority = isOverdue ? 'high' : (daysUntilVaccination <= 7 ? 'high' : 'medium');
          
          const vaccinationReminder: Reminder = {
            id: `vaccine-${dog.id}-${Date.now()}`, // Add timestamp for uniqueness
            title: isToday 
              ? `${dog.name}'s Vaccination Due Today`
              : `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due'}`,
            description: isToday 
              ? `${dog.name}'s vaccination is due today` 
              : isOverdue 
                ? `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days`
                : `Vaccination due in ${daysUntilVaccination} days`,
            icon: createCalendarClockIcon(isOverdue ? "red-500" : "amber-500"),
            dueDate: nextVaccination,
            priority: reminderPriority,
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
    }
  });
  
  // Summarize vaccination reminders for debugging
  const vaccinationReminders = reminders.filter(r => r.type === 'vaccination');
  console.log(`[VACCINATION SUMMARY] Generated ${vaccinationReminders.length} vaccination reminders:`);
  vaccinationReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${format(r.dueDate, 'yyyy-MM-dd')}, priority: ${r.priority})`);
  });
  
  // Summarize heat reminders
  const heatReminders = reminders.filter(r => r.type === 'heat');
  console.log(`[HEAT SUMMARY] Generated ${heatReminders.length} heat reminders:`);
  heatReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${format(r.dueDate, 'yyyy-MM-dd')}, priority: ${r.priority})`);
  });
  
  console.log(`Generated ${reminders.length} total dog reminders`);
  return reminders;
};
