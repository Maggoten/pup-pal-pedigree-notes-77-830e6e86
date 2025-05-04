
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, format, addDays, isValid } from 'date-fns';
import { createPawPrintIcon } from '@/utils/iconUtils';
import { parseISODate, isValidDate } from '@/utils/dateUtils';

/**
 * Generate heat cycle reminders for female dogs
 */
export const generateHeatReminders = (dog: Dog, today: Date): Reminder[] => {
  const reminders: Reminder[] = [];
  
  // Only process female dogs with heat history
  if (dog.gender !== 'female' || !dog.heatHistory || dog.heatHistory.length === 0) {
    if (dog.gender === 'female') {
      console.log(`[Heat Reminders] No heat history for female dog: ${dog.name}`);
    }
    return reminders;
  }
  
  console.log(`[Heat Reminders] Processing heat reminders for dog: ${dog.name}`);
  console.log(`[Heat Reminders] Heat history: ${JSON.stringify(dog.heatHistory)}`);
  
  // Find the last heat date
  const sortedHeatDates = [...dog.heatHistory].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const lastHeatDateString = sortedHeatDates[0].date;
  console.log(`[Heat Reminders] Last heat date string for ${dog.name}: ${lastHeatDateString}`);
  
  // Parse the date string using our utility
  let lastHeatDate = parseISODate(lastHeatDateString);
  
  if (!lastHeatDate || !isValidDate(lastHeatDate)) {
    console.error(`[Heat Reminders] Failed to parse last heat date for ${dog.name}: ${lastHeatDateString}`);
    // Try alternative parsing approach
    try {
      const fallbackDate = new Date(lastHeatDateString);
      if (isValid(fallbackDate)) {
        lastHeatDate = fallbackDate;
        console.log(`[Heat Reminders] Used fallback parsing for ${dog.name}'s heat date: ${fallbackDate.toISOString()}`);
      } else {
        return reminders;
      }
    } catch (e) {
      console.error(`[Heat Reminders] Fallback parsing also failed for ${dog.name}'s heat date`, e);
      return reminders;
    }
  }
  
  // Use heat interval if available, otherwise default to 180 days (6 months)
  const intervalDays = dog.heatInterval || 180;
  
  // Calculate the next heat date by adding the interval to the last heat date
  const nextHeatDate = addDays(lastHeatDate, intervalDays);
  
  console.log(`[Heat Reminders] Dog ${dog.name}: Last heat date: ${format(lastHeatDate, 'yyyy-MM-dd')}, Next heat: ${format(nextHeatDate, 'yyyy-MM-dd')}`);
  console.log(`[Heat Reminders] Days until next heat: ${differenceInDays(nextHeatDate, today)}, Interval: ${intervalDays} days`);
  
  // Show reminder for upcoming heat 30 days in advance
  const daysUntilHeat = differenceInDays(nextHeatDate, today);
  console.log(`[Heat Reminders] Days until heat for ${dog.name}: ${daysUntilHeat}`);
  
  if (daysUntilHeat <= 30 && daysUntilHeat >= -5) { // Show reminder even if up to 5 days past
    reminders.push({
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
    });
    console.log(`[Heat Reminders] Created heat reminder for dog ${dog.name}`);
  } else {
    console.log(`[Heat Reminders] No heat reminder created for ${dog.name}, outside window: ${daysUntilHeat} days until heat`);
  }
  
  return reminders;
};
