
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, isSameMonth, isSameDay, addYears } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';

export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
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
      
      const lastHeatDate = parseISO(sortedHeatDates[0].date);
      // Use heat interval if available, otherwise default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      const nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      console.log(`Dog ${dog.name}: Last heat date: ${lastHeatDate.toISOString()}, Next heat: ${nextHeatDate.toISOString()}, Days until: ${differenceInDays(nextHeatDate, today)}`);
      
      if (differenceInDays(nextHeatDate, today) <= 30) {
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
      console.log(`Dog ${dog.name}: Has vaccination date: ${dog.vaccinationDate}`);
      const lastVaccination = parseISO(dog.vaccinationDate);
      const nextVaccination = addYears(lastVaccination, 1); // Yearly vaccinations (changed from addDays(365) to addYears(1))
      
      const daysUntilVaccination = differenceInDays(nextVaccination, today);
      console.log(`Dog ${dog.name}: Next vaccination date: ${nextVaccination.toISOString()}, Days until: ${daysUntilVaccination}`);
      
      // Create reminder if vaccination is due within the next 30 days
      if (daysUntilVaccination <= 30 && daysUntilVaccination >= -7) { // Include slightly overdue vaccinations
        reminders.push({
          id: `vaccine-${dog.id}`,
          title: `${dog.name}'s Vaccination Due`,
          description: daysUntilVaccination >= 0 
            ? `Vaccination due in ${daysUntilVaccination} days`
            : `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days`,
          icon: createCalendarClockIcon("amber-500"),
          dueDate: nextVaccination,
          priority: 'medium',
          type: 'vaccination',
          relatedId: dog.id
        });
        console.log(`Created vaccination reminder for dog ${dog.name}`);
      } else {
        console.log(`Skipping vaccination reminder for ${dog.name}: Not within reminder window (${daysUntilVaccination} days until due)`);
      }
    } else {
      console.log(`Dog ${dog.name}: No vaccination date recorded`);
    }
    
    // Check for upcoming deworming
    if (dog.dewormingDate) {
      const lastDeworming = parseISO(dog.dewormingDate);
      const nextDeworming = addDays(lastDeworming, 90); // Quarterly deworming
      
      const daysUntilDeworming = differenceInDays(nextDeworming, today);
      console.log(`Dog ${dog.name}: Next deworming date: ${nextDeworming.toISOString()}, Days until: ${daysUntilDeworming}`);
      
      if (daysUntilDeworming <= 14 && daysUntilDeworming >= -7) { // Include slightly overdue dewormings
        reminders.push({
          id: `deworm-${dog.id}`,
          title: `${dog.name}'s Deworming Due`,
          description: daysUntilDeworming >= 0 
            ? `Deworming due in ${daysUntilDeworming} days`
            : `Deworming overdue by ${Math.abs(daysUntilDeworming)} days`,
          icon: createCalendarClockIcon("green-500"),
          dueDate: nextDeworming,
          priority: 'medium',
          type: 'deworming',
          relatedId: dog.id
        });
        console.log(`Created deworming reminder for dog ${dog.name}`);
      }
    }
    
    // Check for dog birthdays (if dateOfBirth is available)
    if (dog.dateOfBirth) {
      const birthdate = parseISO(dog.dateOfBirth);
      const birthdateThisYear = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
      
      // If birthday is within the next 7 days or was in the last 2 days
      const daysUntilBirthday = differenceInDays(birthdateThisYear, today);
      console.log(`Dog ${dog.name}: Birthday: ${birthdate.toISOString()}, Days until this year: ${daysUntilBirthday}`);
      
      if ((daysUntilBirthday >= -2 && daysUntilBirthday <= 7) || 
          (isSameMonth(birthdate, today) && isSameDay(birthdate, today))) {
        const age = today.getFullYear() - birthdate.getFullYear();
        
        reminders.push({
          id: `birthday-${dog.id}`,
          title: `${dog.name}'s Birthday`,
          description: daysUntilBirthday <= 0 
            ? `${dog.name} turns ${age} today!` 
            : `${dog.name} turns ${age} in ${daysUntilBirthday} days`,
          icon: createPawPrintIcon("blue-500"),
          dueDate: birthdateThisYear,
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
