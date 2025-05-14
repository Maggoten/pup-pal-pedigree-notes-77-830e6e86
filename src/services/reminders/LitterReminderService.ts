
import { Litter } from '@/types/breeding';
import { Reminder, createReminder } from '@/types/reminders';
import { differenceInDays, parseISO, isBefore, addDays, addWeeks } from 'date-fns';
import { createPawPrintIcon } from '@/utils/iconUtils';

export const generateLitterReminders = (litters: Litter[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Filter for active litters (not archived)
  const activeLitters = litters.filter(litter => !litter.archived);
  
  activeLitters.forEach(litter => {
    // Only process litters with a valid date of birth
    if (!litter.dateOfBirth) return;
    
    const litterBirthDate = parseISO(litter.dateOfBirth);
    
    // Create reminders for key litter milestones
    const milestones = [
      { days: 3, title: 'Dewclaw Removal', description: 'Time to remove dewclaws if necessary', priority: 'high' as const },
      { days: 7, title: 'First Weigh-In', description: 'Time for the first weight check', priority: 'medium' as const },
      { days: 14, title: 'Eyes Opening', description: 'Puppies\' eyes should be opening', priority: 'low' as const },
      { days: 21, title: 'Deworming Due', description: 'First deworming treatment due', priority: 'high' as const },
      { days: 28, title: 'Weaning Time', description: 'Start introducing solid food', priority: 'medium' as const },
      { days: 42, title: 'First Vaccinations', description: 'Time for first vaccinations', priority: 'high' as const },
      { days: 49, title: 'Ready for New Homes', description: 'Puppies can start going to new homes', priority: 'medium' as const },
    ];
    
    milestones.forEach(milestone => {
      const milestoneDate = addDays(litterBirthDate, milestone.days);
      const daysUntil = differenceInDays(milestoneDate, today);
      
      // Only create reminders for upcoming or recent (within 2 days) milestones
      if (daysUntil >= -2 && daysUntil <= 7) {
        reminders.push(createReminder({
          id: `litter-milestone-${litter.id}-${milestone.days}`,
          title: `${litter.name}: ${milestone.title}`,
          description: milestone.description,
          dueDate: milestoneDate,
          priority: milestone.priority,
          type: 'litter-milestone',
          icon: createPawPrintIcon("amber-500"),
          relatedId: litter.id
        }));
      }
    });
  });
  
  return reminders;
};
