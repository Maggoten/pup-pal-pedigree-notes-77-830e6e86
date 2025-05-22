import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { generatePregnancyJourneyData } from '@/data/pregnancyJourneyData';
import { PregnancyJourneyState, PregnancyWeek } from '@/types/pregnancyJourney';
import { ChecklistItem } from '@/types/checklist';
import { usePregnancyChecklist } from '@/hooks/usePregnancyChecklist';
import { useAuth } from '@/hooks/useAuth';

export const usePregnancyJourney = (
  pregnancyId: string,
  matingDate: Date,
  expectedDueDate: Date
) => {
  const { user } = useAuth();
  const [journeyState, setJourneyState] = useState<PregnancyJourneyState>({
    currentWeek: 1,
    totalWeeks: 9,
    allWeeks: []
  });
  const [calculatedCurrentWeek, setCalculatedCurrentWeek] = useState<number>(1);
  
  // Get checklist data from Supabase
  const { 
    checklist, 
    toggleItemCompletion, 
    isLoading: isChecklistLoading, 
    error: checklistError 
  } = usePregnancyChecklist(pregnancyId);

  console.log("🔍 usePregnancyJourney HOOK", { 
    pregnancyId,
    isAuthenticated: !!user,
    checklistData: checklist ? "loaded" : "not loaded",
    isChecklistLoading,
    checklistError: checklistError || "none"
  });

  // Calculate current week based on mating date
  const calculateCurrentWeek = () => {
    const today = new Date();
    const daysSinceMating = differenceInDays(today, matingDate);
    // Calculate which week of pregnancy (1-9)
    const currentWeek = Math.max(1, Math.min(9, Math.floor(daysSinceMating / 7) + 1));
    return currentWeek;
  };

  // Load or initialize journey data
  useEffect(() => {
    const loadJourneyData = () => {
      // Try to load from localStorage
      const savedData = localStorage.getItem(`pregnancy_journey_${pregnancyId}`);
      
      // Calculate the real current week
      const calculatedWeek = calculateCurrentWeek();
      setCalculatedCurrentWeek(calculatedWeek);
      
      // Generate base journey data with development info
      const allWeeks = generatePregnancyJourneyData();
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // Update current week in saved data
        const updatedData = {
          ...parsedData,
          currentWeek: calculatedWeek,
          // Keep the weeks data structure but update with latest development info
          allWeeks: allWeeks.map(week => ({
            ...week,
            // Keep the user's checklist item states if any
            checklistItems: week.checklistItems.map(item => {
              // Find if there's already saved state for this item
              const savedItem = parsedData.allWeeks
                .find((w: any) => w.weekNumber === week.weekNumber)?.checklistItems
                .find((i: any) => i.id === item.id);
              
              return savedItem ? savedItem : item;
            })
          }))
        };
        
        setJourneyState(updatedData);
      } else {
        // Initialize new journey data
        const newJourneyState = {
          currentWeek: calculatedWeek,
          totalWeeks: 9,
          allWeeks
        };
        
        setJourneyState(newJourneyState);
        
        // Save to localStorage
        localStorage.setItem(
          `pregnancy_journey_${pregnancyId}`,
          JSON.stringify(newJourneyState)
        );
      }
    };
    
    loadJourneyData();
  }, [pregnancyId, matingDate, expectedDueDate]);

  // Change week
  const changeWeek = (weekNumber: number) => {
    if (weekNumber >= 1 && weekNumber <= 9) {
      const updatedState = {
        ...journeyState,
        currentWeek: weekNumber
      };
      
      setJourneyState(updatedState);
      
      // Save to localStorage
      localStorage.setItem(
        `pregnancy_journey_${pregnancyId}`,
        JSON.stringify(updatedState)
      );
    }
  };

  // Toggle checklist item - now delegates to Supabase hook if available
  const toggleChecklistItem = (itemId: string) => {
    // If we have checklist data from Supabase and user is authenticated, use that
    if (checklist && user) {
      console.log(`🔄 Toggling Supabase checklist item: ${itemId} for week ${journeyState.currentWeek}`);
      toggleItemCompletion(`week${journeyState.currentWeek}`, itemId);
      return;
    }
    
    // Fall back to localStorage if Supabase isn't available
    console.log(`🔄 Toggling localStorage checklist item: ${itemId}`);
    const updatedWeeks = journeyState.allWeeks.map(week => {
      const updatedItems = week.checklistItems.map(item => {
        if (item.id === itemId) {
          return { ...item, isCompleted: !item.isCompleted };
        }
        return item;
      });
      
      return {
        ...week,
        checklistItems: updatedItems
      };
    });
    
    const updatedState = {
      ...journeyState,
      allWeeks: updatedWeeks
    };
    
    setJourneyState(updatedState);
    
    // Save to localStorage
    localStorage.setItem(
      `pregnancy_journey_${pregnancyId}`,
      JSON.stringify(updatedState)
    );
  };

  // Calculate progress for current week, integrating Supabase data if available
  const calculateWeekProgress = (weekNumber: number): number => {
    // If we have checklist data from Supabase, use that for calculations
    if (checklist && user) {
      const weekGroup = checklist.groups.find(g => g.id === `week${weekNumber}`);
      if (!weekGroup || weekGroup.items.length === 0) return 0;
      
      const completedItems = weekGroup.items.filter(item => item.isCompleted).length;
      return Math.round((completedItems / weekGroup.items.length) * 100);
    }
    
    // Otherwise use local data
    const week = journeyState.allWeeks.find(w => w.weekNumber === weekNumber);
    if (!week || week.checklistItems.length === 0) return 0;
    
    const completedItems = week.checklistItems.filter(item => item.isCompleted).length;
    return Math.round((completedItems / week.checklistItems.length) * 100);
  };

  // Calculate overall pregnancy progress, integrating Supabase data if available
  const calculateOverallProgress = (): number => {
    // If we have checklist data from Supabase, use that for calculations
    if (checklist && user) {
      const allItems = checklist.groups.flatMap(group => group.items);
      if (allItems.length === 0) return 0;
      
      const completedItems = allItems.filter(item => item.isCompleted).length;
      return Math.round((completedItems / allItems.length) * 100);
    }
    
    // Otherwise use local data
    const allItems = journeyState.allWeeks.flatMap(week => week.checklistItems);
    if (allItems.length === 0) return 0;
    
    const completedItems = allItems.filter(item => item.isCompleted).length;
    return Math.round((completedItems / allItems.length) * 100);
  };

  // Helper function to get current week's checklist items from either source
  const getCurrentWeekChecklistItems = (weekNumber: number): ChecklistItem[] => {
    // If we have checklist data from Supabase, use that
    if (checklist && user) {
      const weekGroup = checklist.groups.find(g => g.id === `week${weekNumber}`);
      return weekGroup?.items || [];
    }
    
    // Otherwise use local journey data
    const week = journeyState.allWeeks.find(w => w.weekNumber === weekNumber);
    return week?.checklistItems || [];
  };

  // Merge the journey state with potential Supabase checklist data
  const getCurrentWeekData = (weekNumber: number) => {
    const week = journeyState.allWeeks.find(w => w.weekNumber === weekNumber);
    
    if (!week) return null;
    
    return {
      ...week,
      // Replace checklist items with Supabase data if available
      checklistItems: getCurrentWeekChecklistItems(weekNumber)
    };
  };
  
  return {
    currentWeek: journeyState.currentWeek,
    totalWeeks: journeyState.totalWeeks,
    allWeeks: journeyState.allWeeks,
    currentWeekData: getCurrentWeekData(journeyState.currentWeek),
    calculatedCurrentWeek,
    changeWeek,
    toggleChecklistItem,
    calculateWeekProgress,
    calculateOverallProgress,
    isChecklistLoading
  };
};
