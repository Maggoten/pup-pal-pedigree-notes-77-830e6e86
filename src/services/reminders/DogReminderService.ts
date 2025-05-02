
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, isSameMonth, isSameDay } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';

export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Check each dog for upcoming events
  dogs.forEach((dog) => {
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
      }
    }
    
    // Check for upcoming vaccinations
    if (dog.vaccinationDate) {
      const lastVaccination = parseISO(dog.vaccinationDate);
      const nextVaccination = addDays(lastVaccination, 365); // Yearly vaccinations
      
      if (differenceInDays(nextVaccination, today) <= 30) {
        reminders.push({
          id: `vaccine-${dog.id}`,
          title: `${dog.name}'s Vaccination Due`,
          description: `Vaccination due in ${differenceInDays(nextVaccination, today)} days`,
          icon: createCalendarClockIcon("amber-500"),
          dueDate: nextVaccination,
          priority: 'medium',
          type: 'vaccination',
          relatedId: dog.id
        });
      }
    }
    
    // Check for upcoming deworming
    if (dog.dewormingDate) {
      const lastDeworming = parseISO(dog.dewormingDate);
      const nextDeworming = addDays(lastDeworming, 90); // Quarterly deworming
      
      if (differenceInDays(nextDeworming, today) <= 14) {
        reminders.push({
          id: `deworm-${dog.id}`,
          title: `${dog.name}'s Deworming Due`,
          description: `Deworming due in ${differenceInDays(nextDeworming, today)} days`,
          icon: createCalendarClockIcon("green-500"),
          dueDate: nextDeworming,
          priority: 'medium',
          type: 'deworming',
          relatedId: dog.id
        });
      }
    }
    
    // Check for dog birthdays (if dateOfBirth is available)
    if (dog.dateOfBirth) {
      const birthdate = parseISO(dog.dateOfBirth);
      const birthdateThisYear = new Date(today.getFullYear(), birthdate.getMonth(), birthdate.getDate());
      
      // If birthday is within the next 7 days or was in the last 2 days
      const daysUntilBirthday = differenceInDays(birthdateThisYear, today);
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
      }
    }
  });
  
  return reminders;
};
