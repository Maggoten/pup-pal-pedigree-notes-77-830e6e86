
import { PregnancyWeek } from "@/types/pregnancyJourney";
import { weeklyDevelopments } from "./weeklyDevelopmentData";
import { 
  getWeek1Items,
  getWeek2Items,
  getWeek3Items,
  getWeek4Items,
  getWeek5Items,
  getWeek6Items,
  getWeek7Items,
  getWeek8Items,
  getWeek9Items
} from "./pregnancyChecklistItems";

// Generate pregnancy weeks with both development info and checklist items
export const generatePregnancyJourneyData = (): PregnancyWeek[] => {
  // Create week by week data
  return weeklyDevelopments.map((development) => {
    // Find checklist items for this week
    let weekItems = [];
    
    switch(development.week) {
      case 1:
        weekItems = getWeek1Items();
        break;
      case 2:
        weekItems = getWeek2Items();
        break;
      case 3:
        weekItems = getWeek3Items();
        break;
      case 4:
        weekItems = getWeek4Items();
        break;
      case 5:
        weekItems = getWeek5Items();
        break;
      case 6:
        weekItems = getWeek6Items();
        break;
      case 7:
        weekItems = getWeek7Items();
        break;
      case 8:
        weekItems = getWeek8Items();
        break;
      case 9:
        weekItems = getWeek9Items();
        break;
      default:
        weekItems = [];
    }
    
    return {
      weekNumber: development.week,
      development,
      checklistItems: weekItems
    };
  });
};
