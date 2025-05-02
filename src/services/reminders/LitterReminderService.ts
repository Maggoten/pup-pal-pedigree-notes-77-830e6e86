
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon, createPawPrintIcon } from '@/utils/iconUtils';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';

// Generate litter-related reminders for a specific user
export const generateLitterReminders = async (userId: string): Promise<Reminder[]> => {
  console.log(`Generating litter reminders for user: ${userId}`);
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  try {
    // Fetch active pregnancies from Supabase for the current user
    const { data: pregnancies, error: pregnancyError } = await supabase
      .from('pregnancies')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active');
      
    if (pregnancyError) {
      console.error("Error fetching pregnancies for reminders:", pregnancyError);
    } else if (pregnancies?.length) {
      console.log(`Found ${pregnancies.length} active pregnancies for user ${userId}`);
      
      // Process each pregnancy
      pregnancies.forEach(pregnancy => {
        const dueDate = new Date(pregnancy.expected_due_date);
        const daysUntilBirth = differenceInDays(dueDate, today);
        
        // Add due date reminder starting 14 days before
        if (daysUntilBirth >= -2 && daysUntilBirth <= 14) {
          reminders.push({
            id: `pregnancy-due-${pregnancy.id}`,
            title: `Pregnancy Due Date ${daysUntilBirth <= 0 ? 'Today/Passed' : 'Approaching'}`,
            description: daysUntilBirth <= 0 
              ? `Due date is today or has passed` 
              : `Due in ${daysUntilBirth} days`,
            dueDate,
            priority: 'high',
            type: 'other',
            icon: createPawPrintIcon('rose-500'),
            relatedId: pregnancy.id
          });
          
          console.log(`Created due date reminder for pregnancy ${pregnancy.id}`);
        }
      });
    }
    
    // Fetch litters from Supabase for the current user
    const { data: litters, error } = await supabase
      .from('litters')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false);
      
    if (error) {
      console.error("Error fetching litters for reminders:", error);
      return reminders;
    }
    
    console.log(`Found ${litters?.length || 0} litters for user ${userId}`);
    
    // Process each litter
    litters?.forEach(litter => {
      const birthDate = new Date(litter.date_of_birth);
      
      // Create reminders for upcoming litter care milestones
      [7, 14, 21, 28, 42, 56].forEach(days => {
        const milestoneDate = new Date(birthDate);
        milestoneDate.setDate(birthDate.getDate() + days);
        
        const daysUntilMilestone = differenceInDays(milestoneDate, today);
        
        // Only show milestone reminders that are coming up within the next 7 days
        if (daysUntilMilestone >= 0 && daysUntilMilestone <= 7) {
          let title = '';
          let description = '';
          
          switch(days) {
            case 7:
              title = `${litter.name} - 1 Week Milestone`;
              description = 'Time for first deworming';
              break;
            case 14:
              title = `${litter.name} - 2 Weeks Milestone`;
              description = 'Eyes opening, start monitoring development';
              break;
            case 21:
              title = `${litter.name} - 3 Weeks Milestone`;
              description = 'Second deworming, introduce soft food';
              break;
            case 28:
              title = `${litter.name} - 4 Weeks Milestone`;
              description = 'Weaning begins, increase solid food';
              break;
            case 42:
              title = `${litter.name} - 6 Weeks Milestone`;
              description = 'Health check and first vaccinations';
              break;
            case 56:
              title = `${litter.name} - 8 Weeks Milestone`;
              description = 'Puppies ready for new homes';
              break;
          }
          
          reminders.push({
            id: `litter-milestone-${litter.id}-${days}`,
            title,
            description,
            dueDate: milestoneDate,
            priority: 'medium',
            type: 'other',
            icon: createCalendarClockIcon('amber-500'),
            relatedId: litter.id
          });
          
          console.log(`Created ${days}-day milestone reminder for litter ${litter.name}`);
        }
      });
    });
    
    console.log(`Generated ${reminders.length} litter reminders for user ${userId}`);
    return reminders;
  } catch (error) {
    console.error("Error generating litter reminders:", error);
    return [];
  }
};
