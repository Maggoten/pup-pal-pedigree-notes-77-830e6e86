
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, format, addDays, isValid, startOfDay } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';
import { safelyParseDate } from '@/utils/dateUtils';

/**
 * A class to encapsulate dog reminder generation logic
 * This can be used for on-demand reminder generation and debugging
 */
export class DogReminderGenerator {
  private dogs: Dog[];
  private today: Date;
  
  constructor(dogs: Dog[]) {
    this.dogs = dogs;
    this.today = startOfDay(new Date());
  }
  
  /**
   * Generate all types of reminders for the dogs
   */
  public generateReminders(): Reminder[] {
    console.log(`[DOG_REMINDER_GEN] Generating reminders for ${this.dogs.length} dogs`);
    
    const reminders: Reminder[] = [];
    
    try {
      // Process each dog for heat reminders
      this.dogs.forEach(dog => {
        // Only process valid dogs
        if (!dog || !dog.id) {
          console.warn('[DOG_REMINDER_GEN] Invalid dog object');
          return;
        }

        // Generate heat reminders for female dogs
        if (dog.gender === 'female') {
          try {
            const heatReminders = this.generateHeatReminders(dog);
            reminders.push(...heatReminders);
          } catch (error) {
            console.error(`[DOG_REMINDER_GEN] Error generating heat reminders for ${dog.name}:`, error);
          }
        }
        
        // Generate vaccination reminders for all dogs
        try {
          const vaccinationReminders = this.generateVaccinationReminders(dog);
          reminders.push(...vaccinationReminders);
        } catch (error) {
          console.error(`[DOG_REMINDER_GEN] Error generating vaccination reminders for ${dog.name}:`, error);
        }
      });
      
      console.log(`[DOG_REMINDER_GEN] Generated ${reminders.length} total reminders`);
      
      // Log summary information for debugging
      const heatReminders = reminders.filter(r => r.type === 'heat');
      console.log(`[DOG_REMINDER_GEN] Generated ${heatReminders.length} heat reminders`);
      
      const vaccinationReminders = reminders.filter(r => r.type === 'vaccination');
      console.log(`[DOG_REMINDER_GEN] Generated ${vaccinationReminders.length} vaccination reminders`);
      
      return reminders;
    } catch (error) {
      console.error('[DOG_REMINDER_GEN] Error in generateReminders:', error);
      return [];
    }
  }
  
  /**
   * Generate heat reminders for a female dog
   */
  private generateHeatReminders(dog: Dog): Reminder[] {
    const reminders: Reminder[] = [];
    
    // Only process female dogs with heat history
    if (dog.gender !== 'female' || !dog.heatHistory || !Array.isArray(dog.heatHistory) || dog.heatHistory.length === 0) {
      if (dog.gender === 'female') {
        console.log(`[DOG_REMINDER_GEN] No valid heat history for female dog: ${dog.name}`);
      }
      return reminders;
    }
    
    console.log(`[DOG_REMINDER_GEN] Processing heat reminders for dog: ${dog.name}`);
    console.log(`[DOG_REMINDER_GEN] Heat history:`, dog.heatHistory);
    
    try {
      // Find the last heat date, ensuring it's an object with a date property
      const validHeatEntries = dog.heatHistory
        .filter(entry => 
          typeof entry === 'object' && 
          entry !== null && 
          'date' in entry && 
          entry.date
        )
        .map(entry => ({ 
          ...entry, 
          parsedDate: safelyParseDate(entry.date) 
        }))
        .filter(entry => entry.parsedDate !== null);
      
      if (validHeatEntries.length === 0) {
        console.log(`[DOG_REMINDER_GEN] No valid heat entries found for ${dog.name}`);
        return reminders;
      }
      
      // Sort by date descending
      const sortedHeatDates = validHeatEntries.sort((a, b) => 
        b.parsedDate!.getTime() - a.parsedDate!.getTime()
      );
      
      const lastHeatEntry = sortedHeatDates[0];
      const lastHeatDate = lastHeatEntry.parsedDate!;
      
      console.log(`[DOG_REMINDER_GEN] Last heat date for ${dog.name}: ${format(lastHeatDate, 'yyyy-MM-dd')}`);
      
      // Use heat interval if available, otherwise default to 180 days (6 months)
      const intervalDays = dog.heatInterval || 180;
      
      // Calculate the next heat date by adding the interval to the last heat date
      const nextHeatDate = addDays(lastHeatDate, intervalDays);
      
      console.log(`[DOG_REMINDER_GEN] Next heat: ${format(nextHeatDate, 'yyyy-MM-dd')}, Interval: ${intervalDays} days`);
      
      // Show reminder for upcoming heat 30 days in advance
      const daysUntilHeat = differenceInDays(nextHeatDate, this.today);
      console.log(`[DOG_REMINDER_GEN] Days until heat for ${dog.name}: ${daysUntilHeat}`);
      
      if (daysUntilHeat <= 30 && daysUntilHeat >= -5) { // Show reminder even if up to 5 days past
        const reminder: Reminder = {
          id: `heat-${dog.id}-${Date.now()}`, // Add timestamp for uniqueness
          title: `${dog.name}'s Heat ${daysUntilHeat < 0 ? 'Started' : 'Approaching'}`,
          description: daysUntilHeat < 0 
            ? `Heat started ${Math.abs(daysUntilHeat)} days ago` 
            : `Expected heat cycle in ${daysUntilHeat} days`,
          icon: createPawPrintIcon("rose-500"),
          dueDate: nextHeatDate,
          priority: daysUntilHeat <= 7 ? 'high' : 'medium',
          type: 'heat',
          relatedId: dog.id
        };
        
        // Validate the reminder before adding it
        if (isValid(reminder.dueDate)) {
          reminders.push(reminder);
          console.log(`[DOG_REMINDER_GEN] Created heat reminder for dog ${dog.name}: ${reminder.title} due on ${format(reminder.dueDate, 'yyyy-MM-dd')}`);
        } else {
          console.error(`[DOG_REMINDER_GEN] Invalid due date for generated reminder: ${reminder.title}`);
        }
      } else {
        console.log(`[DOG_REMINDER_GEN] No heat reminder created for ${dog.name}, outside window: ${daysUntilHeat} days until heat`);
      }
    } catch (error) {
      console.error(`[DOG_REMINDER_GEN] Error processing heat reminders for ${dog.name}:`, error);
    }
    
    return reminders;
  }
  
  /**
   * Generate vaccination reminders for a dog
   */
  private generateVaccinationReminders(dog: Dog): Reminder[] {
    const reminders: Reminder[] = [];
    
    // Skip if no vaccination date
    if (!dog.vaccinationDate) {
      return reminders;
    }
    
    try {
      console.log(`[DOG_REMINDER_GEN] Processing vaccination reminder for dog: ${dog.name}, vaccination date: ${dog.vaccinationDate}`);
      
      // Parse the vaccination date
      const vaccinationDate = safelyParseDate(dog.vaccinationDate);
      
      if (!vaccinationDate) {
        console.error(`[DOG_REMINDER_GEN] Invalid vaccination date for ${dog.name}: ${dog.vaccinationDate}`);
        return reminders;
      }
      
      console.log(`[DOG_REMINDER_GEN] Parsed vaccination date: ${format(vaccinationDate, 'yyyy-MM-dd')}`);
      
      // For yearly vaccinations, calculate next date
      const nextVaccinationDate = new Date(vaccinationDate);
      nextVaccinationDate.setFullYear(nextVaccinationDate.getFullYear() + 1);
      
      // Calculate days until next vaccination
      const daysUntilVaccination = differenceInDays(nextVaccinationDate, this.today);
      console.log(`[DOG_REMINDER_GEN] Days until vaccination for ${dog.name}: ${daysUntilVaccination}`);
      
      // Create reminder if vaccination is due within 30 days
      if (daysUntilVaccination <= 30 && daysUntilVaccination >= -10) {
        const isOverdue = daysUntilVaccination < 0;
        
        const reminder: Reminder = {
          id: `vaccination-${dog.id}-${Date.now()}`,
          title: `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due Soon'}`,
          description: isOverdue 
            ? `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days` 
            : `Vaccination due in ${daysUntilVaccination} days`,
          icon: createCalendarClockIcon(isOverdue ? "red-500" : "blue-500"),
          dueDate: nextVaccinationDate,
          priority: isOverdue ? 'high' : (daysUntilVaccination <= 7 ? 'medium' : 'low'),
          type: 'vaccination',
          relatedId: dog.id
        };
        
        // Validate the reminder before adding it
        if (isValid(reminder.dueDate)) {
          reminders.push(reminder);
          console.log(`[DOG_REMINDER_GEN] Created vaccination reminder for dog ${dog.name}: ${reminder.title} due on ${format(reminder.dueDate, 'yyyy-MM-dd')}`);
        } else {
          console.error(`[DOG_REMINDER_GEN] Invalid due date for generated reminder: ${reminder.title}`);
        }
      }
    } catch (error) {
      console.error(`[DOG_REMINDER_GEN] Error generating vaccination reminder for ${dog.name}:`, error);
    }
    
    return reminders;
  }
}
