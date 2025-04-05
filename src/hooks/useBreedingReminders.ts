
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { differenceInDays, parseISO, addDays } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon, createScaleIcon } from '@/utils/iconUtils';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'heat' | 'mating' | 'vaccination' | 'deworming' | 'weighing' | 'other';
}

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const today = new Date();
  
  // Generate reminders based on dogs data
  const generateReminders = (): Reminder[] => {
    const reminders: Reminder[] = [];
    
    // Check each dog for upcoming events
    dogs.forEach((dog) => {
      // If female, add heat cycle reminders (assuming a 6-month cycle)
      if (dog.gender === 'female' && dog.breedingHistory?.matings) {
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
              type: 'heat'
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
            type: 'vaccination'
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
            type: 'deworming'
          });
        }
      }
    });
    
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

  const reminders = generateReminders();
  
  // Sort reminders by priority (high first)
  const sortedReminders = [...reminders].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const handleMarkComplete = (id: string) => {
    toast({
      title: "Reminder Completed",
      description: "This task has been marked as completed."
    });
    // In a real app, this would update the backend
  };
  
  return {
    reminders: sortedReminders,
    handleMarkComplete
  };
};
