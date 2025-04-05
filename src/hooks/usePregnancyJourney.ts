
import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { generatePregnancyJourneyData } from '@/data/pregnancyJourneyData';
import { PregnancyJourneyState, PregnancyWeek } from '@/types/pregnancyJourney';
import { ChecklistItem } from '@/types/checklist';

export const usePregnancyJourney = (
  pregnancyId: string,
  matingDate: Date,
  expectedDueDate: Date
) => {
  const [journeyState, setJourneyState] = useState<PregnancyJourneyState>({
    currentWeek: 1,
    totalWeeks: 9,
    allWeeks: []
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
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        
        // If we have saved data but want to update the current week
        // based on the actual pregnancy progress
        const calculatedWeek = calculateCurrentWeek();
        
        // Update current week in saved data
        const updatedData = {
          ...parsedData,
          currentWeek: calculatedWeek
        };
        
        setJourneyState(updatedData);
        
        // Save the updated current week
        localStorage.setItem(
          `pregnancy_journey_${pregnancyId}`,
          JSON.stringify(updatedData)
        );
      } else {
        // Initialize new journey data
        const allWeeks = generatePregnancyJourneyData();
        const currentWeek = calculateCurrentWeek();
        
        const newJourneyState = {
          currentWeek,
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

  // Toggle checklist item
  const toggleChecklistItem = (itemId: string) => {
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

  // Calculate progress for current week
  const calculateWeekProgress = (weekNumber: number): number => {
    const week = journeyState.allWeeks.find(w => w.weekNumber === weekNumber);
    
    if (!week || week.checklistItems.length === 0) return 0;
    
    const completedItems = week.checklistItems.filter(item => item.isCompleted).length;
    return Math.round((completedItems / week.checklistItems.length) * 100);
  };

  // Calculate overall pregnancy progress
  const calculateOverallProgress = (): number => {
    const allItems = journeyState.allWeeks.flatMap(week => week.checklistItems);
    
    if (allItems.length === 0) return 0;
    
    const completedItems = allItems.filter(item => item.isCompleted).length;
    return Math.round((completedItems / allItems.length) * 100);
  };

  return {
    currentWeek: journeyState.currentWeek,
    totalWeeks: journeyState.totalWeeks,
    allWeeks: journeyState.allWeeks,
    currentWeekData: journeyState.allWeeks.find(week => week.weekNumber === journeyState.currentWeek) || null,
    changeWeek,
    toggleChecklistItem,
    calculateWeekProgress,
    calculateOverallProgress
  };
};
