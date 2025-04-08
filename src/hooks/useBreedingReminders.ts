
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { differenceInDays, parseISO, addDays, isSameMonth, isSameDay } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon, createScaleIcon } from '@/utils/iconUtils';
import { litterService } from '@/services/LitterService';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Reminder {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'heat' | 'mating' | 'vaccination' | 'deworming' | 'weighing' | 'vet-visit' | 'birthday' | 'other' | 'custom';
  relatedId?: string; // ID of the related dog or litter
  isCompleted?: boolean;
}

export interface CustomReminderInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
}

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const today = new Date();
  const [customReminders, setCustomReminders] = useState<Reminder[]>([]);
  const [completedReminders, setCompletedReminders] = useState<Set<string>>(new Set());
  
  // Load custom reminders and completed state from localStorage on mount
  useEffect(() => {
    const storedCustomReminders = localStorage.getItem('customReminders');
    if (storedCustomReminders) {
      const parsed = JSON.parse(storedCustomReminders).map((r: any) => ({
        ...r,
        dueDate: new Date(r.dueDate),
        icon: createCalendarClockIcon(
          r.priority === 'high' ? 'rose-500' : 
          r.priority === 'medium' ? 'amber-500' : 'green-500'
        )
      }));
      setCustomReminders(parsed);
    }
    
    const storedCompletedReminders = localStorage.getItem('completedReminders');
    if (storedCompletedReminders) {
      setCompletedReminders(new Set(JSON.parse(storedCompletedReminders)));
    }
  }, []);
  
  // Save custom reminders to localStorage when they change
  useEffect(() => {
    if (customReminders.length > 0) {
      const serializableReminders = customReminders.map(r => ({
        ...r,
        icon: null // Don't store React nodes in localStorage
      }));
      localStorage.setItem('customReminders', JSON.stringify(serializableReminders));
    }
  }, [customReminders]);
  
  // Save completed reminders to localStorage when they change
  useEffect(() => {
    if (completedReminders.size > 0) {
      localStorage.setItem('completedReminders', JSON.stringify([...completedReminders]));
    }
  }, [completedReminders]);
  
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
    
    // Add custom reminders
    const allReminders = [...reminders, ...customReminders];
    
    // Add completed status to reminders
    return allReminders.map(reminder => ({
      ...reminder,
      isCompleted: completedReminders.has(reminder.id)
    }));
  };

  const allReminders = generateReminders();
  
  // Sort reminders by priority (high first) and then by completion status
  const sortedReminders = [...allReminders].sort((a, b) => {
    // First sort by completion status
    if (a.isCompleted && !b.isCompleted) return 1;
    if (!a.isCompleted && b.isCompleted) return -1;
    
    // Then sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const handleMarkComplete = (id: string) => {
    setCompletedReminders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    
    toast({
      title: completedReminders.has(id) ? "Reminder Reopened" : "Reminder Completed",
      description: completedReminders.has(id) 
        ? "This task has been marked as not completed."
        : "This task has been marked as completed."
    });
  };
  
  const addCustomReminder = (input: CustomReminderInput) => {
    const newReminder: Reminder = {
      id: `custom-${uuidv4()}`,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      type: 'custom',
      icon: createCalendarClockIcon(
        input.priority === 'high' ? 'rose-500' : 
        input.priority === 'medium' ? 'amber-500' : 'green-500'
      )
    };
    
    setCustomReminders(prev => [...prev, newReminder]);
  };
  
  const deleteReminder = (id: string) => {
    // Only custom reminders can be deleted
    if (id.startsWith('custom-')) {
      setCustomReminders(prev => prev.filter(r => r.id !== id));
      
      // Also remove from completed if needed
      if (completedReminders.has(id)) {
        setCompletedReminders(prev => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
      
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been deleted successfully."
      });
    } else {
      toast({
        title: "Cannot Delete",
        description: "System-generated reminders cannot be deleted.",
        variant: "destructive"
      });
    }
  };
  
  return {
    reminders: sortedReminders,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  };
};
