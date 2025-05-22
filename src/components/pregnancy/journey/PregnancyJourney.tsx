
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePregnancyJourney } from '@/hooks/usePregnancyJourney';
import WeekSelector from './WeekSelector';
import WeeklyDevelopmentCard from './WeeklyDevelopmentCard';
import WeeklyChecklist from './WeeklyChecklist';
import JourneyProgress from './JourneyProgress';
import { PawPrint, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const {
    currentWeek,
    totalWeeks,
    allWeeks,
    currentWeekData,
    calculatedCurrentWeek,
    changeWeek,
    toggleChecklistItem,
    calculateWeekProgress,
    calculateOverallProgress,
    isChecklistLoading
  } = usePregnancyJourney(pregnancyId, matingDate, expectedDueDate);

  console.log("✅ PregnancyJourney component rendered", { 
    pregnancyId, 
    currentWeek,
    isAuthenticated: !!user,
    hasCurrentWeekData: !!currentWeekData
  });

  const overallProgress = calculateOverallProgress();

  return (
    <Card className="overflow-hidden bg-greige-50 border-greige-200">
      <CardHeader className="bg-gradient-to-r from-greige-100 to-greige-50/80 border-b border-greige-200 pb-3 relative">
        {/* Decorative paw prints */}
        <div className="absolute top-2 right-2 opacity-10">
          <PawPrint className="h-32 w-32 text-greige-700 transform rotate-12" />
        </div>
        
        <CardTitle className="flex items-center gap-2 text-greige-800 relative z-10">
          <PawPrint className="h-5 w-5 text-greige-700" />
          {femaleName}'s Pregnancy Journey
        </CardTitle>
        <CardDescription className="relative z-10 text-greige-600">
          Track development and symptoms week by week
        </CardDescription>
        
        <JourneyProgress 
          currentWeek={currentWeek} 
          totalWeeks={totalWeeks}
          overallProgress={overallProgress}
          calculatedCurrentWeek={calculatedCurrentWeek}
        />
      </CardHeader>
      
      <CardContent className="bg-greige-50">
        {!user && (
          <Alert className="mb-4 bg-amber-50 border-amber-200 text-amber-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Sign in to save your checklist data across devices
            </AlertDescription>
          </Alert>
        )}
        
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
                isLoading={isChecklistLoading}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PregnancyJourney;
