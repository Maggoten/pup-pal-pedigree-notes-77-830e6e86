
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePregnancyJourney } from '@/hooks/usePregnancyJourney';
import WeekSelector from './WeekSelector';
import WeeklyDevelopmentCard from './WeeklyDevelopmentCard';
import WeeklyChecklist from './WeeklyChecklist';
import JourneyProgress from './JourneyProgress';
import { PawPrint } from 'lucide-react';

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
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-3 relative">
        {/* Decorative paw prints */}
        <div className="absolute top-2 right-2 opacity-10">
          <PawPrint className="h-32 w-32 text-primary transform rotate-12" />
        </div>
        
        <CardTitle className="flex items-center gap-2 text-primary relative z-10">
          <PawPrint className="h-5 w-5" />
          {femaleName}'s Pregnancy Journey
        </CardTitle>
        <CardDescription className="relative z-10">
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
