
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { supabase } from '@/integrations/supabase/client';

// Generate litter-related reminders for a specific user
export const generateLitterReminders = async (userId: string): Promise<Reminder[]> => {
  console.log(`Generating litter reminders for user: ${userId}`);
  const reminders: Reminder[] = [];
  
  try {
    // Fetch litters from Supabase for the current user
    const { data: litters, error } = await supabase
      .from('litters')
      .select('*')
      .eq('user_id', userId)
      .eq('archived', false);
      
    if (error) {
      console.error("Error fetching litters for reminders:", error);
      return [];
    }
    
    console.log(`Found ${litters?.length || 0} litters for user ${userId}`);
    
    // Process each litter
    litters?.forEach(litter => {
      const birthDate = new Date(litter.date_of_birth);
      const today = new Date();
      
      // Create a reminder for litter's birth date
      if (birthDate > today) {
        const daysUntilBirth = Math.floor((birthDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilBirth <= 14) { // Two weeks before birth date
          reminders.push({
            id: `litter-birth-${litter.id}`,
            title: `Litter Birth Approaching`,
            description: `${litter.name} is due in ${daysUntilBirth} days`,
            dueDate: birthDate,
            priority: 'high',
            type: 'other',
            icon: createCalendarClockIcon('rose-500'),
            relatedId: litter.id
          });
          
          console.log(`Created birth reminder for litter ${litter.name}`);
        }
      }
      
      // Add other litter-related reminders as needed
    });
    
    console.log(`Generated ${reminders.length} litter reminders for user ${userId}`);
    return reminders;
  } catch (error) {
    console.error("Error generating litter reminders:", error);
    return [];
  }
};
