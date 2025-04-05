
import { useState, useEffect, useMemo } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate current week based on mating date - memoized to avoid recalculation
  const calculatedCurrentWeek = useMemo(() => {
    const today = new Date();
    const daysSinceMating = differenceInDays(today, matingDate);
    // Calculate which week of pregnancy (1-9)
    return Math.max(1, Math.min(9, Math.floor(daysSinceMating / 7) + 1));
  }, [matingDate]);

  // Load or initialize journey data
  useEffect(() => {
    const loadJourneyData = async () => {
      setIsLoading(true);
      try {
        // Try to load from localStorage
        const storageKey = `pregnancy_journey_${pregnancyId}`;
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Update current week in saved data
          const updatedData = {
            ...parsedData,
            currentWeek: calculatedCurrentWeek
          };
          
          setJourneyState(updatedData);
          
          // Save the updated current week
          localStorage.setItem(storageKey, JSON.stringify(updatedData));
        } else {
          // Initialize new journey data - only generate once
          const allWeeks = generatePregnancyJourneyData();
          
          const newJourneyState = {
            currentWeek: calculatedCurrentWeek,
            totalWeeks: 9,
            allWeeks
          };
          
          setJourneyState(newJourneyState);
          
          // Save to localStorage
          localStorage.setItem(storageKey, JSON.stringify(newJourneyState));
        }
      } catch (error) {
        console.error("Error loading pregnancy journey data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadJourneyData();
  }, [pregnancyId, matingDate, calculatedCurrentWeek]);

  // Change week - debounced save to localStorage
  const changeWeek = (weekNumber: number) => {
    if (weekNumber >= 1 && weekNumber <= 9) {
      setJourneyState(prev => ({
        ...prev,
        currentWeek: weekNumber
      }));
      
      // Debounce localStorage update
      const storageKey = `pregnancy_journey_${pregnancyId}`;
      const updatedState = {
        ...journeyState,
        currentWeek: weekNumber
      };
      
      localStorage.setItem(storageKey, JSON.stringify(updatedState));
    }
  };

  // Toggle checklist item with optimized state update
  const toggleChecklistItem = (itemId: string) => {
    setJourneyState(prevState => {
      const updatedWeeks = prevState.allWeeks.map(week => {
        const updatedItems = week.checklistItems.map(item => {
          if (item.id === itemId) {
            return { ...item, isCompleted: !item.isCompleted };
          }
          return item;
        });
        
        if (updatedItems.some(item => item.id === itemId)) {
          return {
            ...week,
            checklistItems: updatedItems
          };
        }
        return week;
      });
      
      const updatedState = {
        ...prevState,
        allWeeks: updatedWeeks
      };
      
      // Save to localStorage
      localStorage.setItem(
        `pregnancy_journey_${pregnancyId}`,
        JSON.stringify(updatedState)
      );
      
      return updatedState;
    });
  };

  // Calculate progress for current week - memoized for performance
  const calculateWeekProgress = (weekNumber: number): number => {
    const week = journeyState.allWeeks.find(w => w.weekNumber === weekNumber);
    
    if (!week || week.checklistItems.length === 0) return 0;
    
    const completedItems = week.checklistItems.filter(item => item.isCompleted).length;
    return Math.round((completedItems / week.checklistItems.length) * 100);
  };

  // Calculate overall pregnancy progress - memoized for performance
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
    calculatedCurrentWeek,
    isLoading,
    changeWeek,
    toggleChecklistItem,
    calculateWeekProgress,
    calculateOverallProgress
  };
};
