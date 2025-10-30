
import { Reminder } from '@/types/reminders';
import { createPawPrintIcon } from '@/utils/iconUtils';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, startOfDay } from 'date-fns';
import { isMobileDevice } from '@/utils/fetchUtils';

// Generate litter-related reminders for a specific user
export const generateLitterReminders = async (userId: string): Promise<Reminder[]> => {
  console.log(`Generating litter reminders for user: ${userId}`);
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  try {
    // Fetch active pregnancies from Supabase for the current user with specific fields
    const { data: pregnancies, error: pregnancyError } = await supabase
      .from('pregnancies')
      .select('id, expected_due_date, status, user_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(isMobileDevice() ? 5 : 20); // Limit results based on device type
      
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
          const isOverdueOrToday = daysUntilBirth <= 0;
          
          reminders.push({
            id: `pregnancy-due-${pregnancy.id}`,
            title: '', // Will be translated via titleKey
            titleKey: isOverdueOrToday ? 'events.pregnancy.todayOrPassed' : 'events.pregnancy.approaching',
            description: '', // Will be translated via descriptionKey
            descriptionKey: isOverdueOrToday ? 'events.pregnancy.dueTodayOrPassed' : 'events.pregnancy.dueInDays',
            translationData: { days: Math.abs(daysUntilBirth) },
            dueDate,
            priority: 'high',
            type: 'pregnancy',
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
