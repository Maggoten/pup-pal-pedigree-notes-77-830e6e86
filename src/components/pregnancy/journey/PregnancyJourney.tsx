
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePregnancyJourney } from '@/hooks/usePregnancyJourney';
import WeekSelector from './WeekSelector';
import WeeklyDevelopmentCard from './WeeklyDevelopmentCard';
import WeeklyChecklist from './WeeklyChecklist';
import JourneyProgress from './JourneyProgress';

interface PregnancyJourneyProps {
  pregnancyId: string;
  femaleName: string;
  matingDate: Date;
  expectedDueDate: Date;
}

const PregnancyJourney: React.FC<PregnancyJourneyProps> = ({
  pregnancyId,
  femaleName,
  matingDate,
  expectedDueDate
}) => {
  const {
    currentWeek,
    totalWeeks,
    allWeeks,
    currentWeekData,
    calculatedCurrentWeek,
    changeWeek,
    toggleChecklistItem,
    calculateWeekProgress,
    calculateOverallProgress
  } = usePregnancyJourney(pregnancyId, matingDate, expectedDueDate);

  const overallProgress = calculateOverallProgress();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {femaleName}'s Pregnancy Journey
        </CardTitle>
        <CardDescription>
          Track development and symptoms week by week
        </CardDescription>
        
        <JourneyProgress 
          currentWeek={currentWeek} 
          totalWeeks={totalWeeks}
          overallProgress={overallProgress}
          calculatedCurrentWeek={calculatedCurrentWeek}
        />
      </CardHeader>
      
      <CardContent>
        <WeekSelector 
          currentWeek={currentWeek} 
          totalWeeks={totalWeeks} 
          onSelectWeek={changeWeek} 
        />
        
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          {currentWeekData && (
            <>
              <WeeklyDevelopmentCard 
                development={currentWeekData.development}
                weekProgress={calculateWeekProgress(currentWeek)}
              />
              
              <WeeklyChecklist 
                checklistItems={currentWeekData.checklistItems}
                onToggleItem={toggleChecklistItem}
                weekNumber={currentWeek}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancyJourney;
