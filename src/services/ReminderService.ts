import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, isSameMonth, isSameDay } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon, createScaleIcon } from '@/utils/iconUtils';
import { litterService } from '@/services/LitterService';

export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Check each dog for upcoming events
  dogs.forEach((dog) => {
    // If female, add heat cycle reminders (assuming a 6-month cycle)
    if (dog.gender === 'female' && dog.breedingHistory?.matings && dog.breedingHistory.matings.length > 0) {
      // Find the last heat date (using the last mating date as an approximation)
      const lastMating = dog.breedingHistory.matings.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      )[0];
      
      if (lastMating) {
        const lastHeatDate = parseISO(lastMating.date);
        const nextHeatDate = addDays(lastHeatDate, 180); // Approximately 6 months
        
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

export const generateLitterReminders = (): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Add puppy-related reminders from litters
  const litters = litterService.loadLitters();
  const activeLitters = litters.filter(litter => !litter.archived);
  
  activeLitters.forEach(litter => {
    const litterBirthDate = parseISO(litter.dateOfBirth);
    const puppyAge = differenceInDays(today, litterBirthDate);
    
    // Deworming at 3 weeks
    if (puppyAge >= 19 && puppyAge <= 22) {
      reminders.push({
        id: `deworm-3w-${litter.id}`,
        title: `Deworm ${litter.name} Puppies`,
        description: `First deworming for puppies at 3 weeks old`,
        icon: createCalendarClockIcon("green-500"),
        dueDate: addDays(litterBirthDate, 21),
        priority: 'high',
        type: 'deworming',
        relatedId: litter.id
      });
    }
    
    // Deworming at 5 weeks
    if (puppyAge >= 33 && puppyAge <= 36) {
      reminders.push({
        id: `deworm-5w-${litter.id}`,
        title: `Deworm ${litter.name} Puppies`,
        description: `Second deworming for puppies at 5 weeks old`,
        icon: createCalendarClockIcon("green-500"),
        dueDate: addDays(litterBirthDate, 35),
        priority: 'high',
        type: 'deworming',
        relatedId: litter.id
      });
    }
    
    // Deworming at 7 weeks
    if (puppyAge >= 47 && puppyAge <= 50) {
      reminders.push({
        id: `deworm-7w-${litter.id}`,
        title: `Deworm ${litter.name} Puppies`,
        description: `Third deworming for puppies at 7 weeks old`,
        icon: createCalendarClockIcon("green-500"),
        dueDate: addDays(litterBirthDate, 49),
        priority: 'high',
        type: 'deworming',
        relatedId: litter.id
      });
    }
    
    // Vet visit reminder at 6 weeks
    if (puppyAge >= 40 && puppyAge <= 43) {
      reminders.push({
        id: `vet-6w-${litter.id}`,
        title: `Schedule Vet Visit for ${litter.name}`,
        description: `Book vet appointment for final check before puppies go to new homes`,
        icon: createCalendarClockIcon("purple-500"),
        dueDate: addDays(litterBirthDate, 42),
        priority: 'high',
        type: 'vet-visit',
        relatedId: litter.id
      });
    }
    
    // Weight check reminders for young puppies (every 3 days for first 3 weeks)
    if (puppyAge <= 21 && puppyAge % 3 === 0) {
      reminders.push({
        id: `weight-${litter.id}-${puppyAge}`,
        title: `Weigh ${litter.name} Puppies`,
        description: `Regular weight tracking at ${puppyAge} days old`,
        icon: createScaleIcon("blue-500"),
        dueDate: today,
        priority: 'medium',
        type: 'weighing',
        relatedId: litter.id
      });
    }
  });
  
  return reminders;
};

export const generateGeneralReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Add a few general reminders
  if (dogs.length > 0 && dogs.filter(dog => dog.gender === 'female').length === 0) {
    reminders.push({
      id: 'add-female',
      title: 'Add Female Dogs',
      description: 'Add your female dogs to start tracking heat cycles',
      icon: createPawPrintIcon("primary"),
      dueDate: today,
      priority: 'low',
      type: 'other'
    });
  }
  
  // Check if there are any puppies that need weighing
  const hasActiveLitters = dogs.some(dog => 
    dog.gender === 'female' && 
    dog.breedingHistory?.litters && 
    dog.breedingHistory.litters.some(litter => {
      const litterDate = parseISO(litter.date);
      return differenceInDays(today, litterDate) <= 56; // Puppies less than 8 weeks old
    })
  );
  
  if (hasActiveLitters) {
    reminders.push({
      id: 'weigh-puppies',
      title: 'Weigh Puppies',
      description: 'Regular weight tracking is important for puppy development',
      icon: createScaleIcon("blue-500"),
      dueDate: today,
      priority: 'high',
      type: 'weighing'
    });
  }
  
  return reminders;
};
