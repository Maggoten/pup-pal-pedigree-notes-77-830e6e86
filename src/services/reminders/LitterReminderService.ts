
import { Reminder } from '@/types/reminders';
import { createPawPrintIcon } from '@/utils/iconUtils';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, startOfDay } from 'date-fns';

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
    
    console.log(`Generated ${reminders.length} litter reminders for user ${userId}`);
    return reminders;
  } catch (error) {
    console.error("Error generating litter reminders:", error);
    return [];
  }
};
