
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO } from 'date-fns';
import { createPawPrintIcon, createScaleIcon } from '@/utils/iconUtils';

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
