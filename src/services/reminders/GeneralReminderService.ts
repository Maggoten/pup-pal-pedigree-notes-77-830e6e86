
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO } from 'date-fns';
import { createScaleIcon } from '@/utils/iconUtils';

export const generateGeneralReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Check if there are any puppies that need weighing - this is a critical health maintenance task
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

