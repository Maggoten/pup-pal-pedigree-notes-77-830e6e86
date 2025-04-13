
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays } from 'date-fns';
import { createCalendarClockIcon, createScaleIcon } from '@/utils/iconUtils';
import { litterService } from '@/services/LitterService';

/**
 * Generate reminders related to litters and puppies
 */
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
