
import { PregnancyWeek } from "@/types/pregnancyJourney";
import { weeklyDevelopments } from "./weeklyDevelopmentData";
import { getEarlyPregnancyItems, getMidPregnancyItems, getLatePregnancyItems } from "./pregnancyChecklistItems";

// Generate pregnancy weeks with both development info and checklist items
export const generatePregnancyJourneyData = (): PregnancyWeek[] => {
  // Get all checklist items
  const earlyPregnancyItems = getEarlyPregnancyItems();
  const midPregnancyItems = getMidPregnancyItems();
  const latePregnancyItems = getLatePregnancyItems();
  
  // Create week by week data
  return weeklyDevelopments.map((development) => {
    // Find checklist items for this week
    const weekItems = [
      ...earlyPregnancyItems.filter(item => item.weekNumber === development.week),
      ...midPregnancyItems.filter(item => item.weekNumber === development.week),
      ...latePregnancyItems.filter(item => item.weekNumber === development.week)
    ];
    
    return {
      weekNumber: development.week,
      development,
      checklistItems: weekItems
    };
  });
};
