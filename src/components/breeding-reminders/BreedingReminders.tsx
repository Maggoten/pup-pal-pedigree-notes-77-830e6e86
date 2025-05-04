
import React, { useState, memo, Suspense, lazy, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Reminder } from '@/types/reminders';
import { BreedingRemindersProps } from './types';
import RemindersHeader from './RemindersHeader';
import RemindersContent from './RemindersContent';
import { BackgroundPawPrint, PawIndicator } from './DecorativeElements';
import { useDisplayReminders } from './useDisplayReminders';

// Lazy load the dialog component to improve initial page load
const RemindersDialog = lazy(() => import('../reminders/RemindersDialog'));

// Use memo to prevent unnecessary re-renders
const BreedingReminders: React.FC<BreedingRemindersProps> = memo(({ remindersData }) => {
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [forceReady, setForceReady] = useState(false);
  
  // Use provided data or empty defaults
  const { 
    reminders = [], 
    isLoading = false, 
    hasError = false, 
    handleMarkComplete = () => {} 
  } = remindersData || {};
  
  const { hasReminders } = useDisplayReminders(reminders);
  
  // Force show content after a timeout to prevent infinite loading
  useEffect(() => {
    // Short timeout to show loading state briefly
    const timer = setTimeout(() => {
      if (isLoading) {
        console.log("BreedingReminders: Setting loading state to false after timeout");
        setShowLoading(false);
      }
    }, 2000);
    
    // Longer timeout as fallback to make sure content appears
    const forceTimer = setTimeout(() => {
      console.log("BreedingReminders: Forcing ready state after longer timeout");
      setForceReady(true);
    }, 5000);
    
    // If not loading, immediately show content
    if (!isLoading) {
      setShowLoading(false);
    }
    
    return () => {
      clearTimeout(timer);
      clearTimeout(forceTimer);
    };
  }, [isLoading]);
  
  // Log all reminders for debugging
  useEffect(() => {
    console.log(`BreedingReminders component received ${reminders?.length || 0} reminders`);
    
    if (reminders && reminders.length > 0) {
      console.log("BreedingReminders - All Reminders:", reminders.map(r => 
        `${r.title} (${r.type}) - Due: ${r.dueDate?.toISOString()} - Priority: ${r.priority} - Completed: ${r.isCompleted}`
      ));
      
      // Specifically log vaccination reminders
      const vaccinationReminders = reminders.filter(r => r.type === 'vaccination');
      console.log(`BreedingReminders - Found ${vaccinationReminders.length} vaccination reminders:`, 
        vaccinationReminders.map(r => `${r.title} - Due: ${r.dueDate?.toISOString()} - RelatedId: ${r.relatedId}`)
      );
    } else {
      console.log("BreedingReminders - No reminders to display");
    }
  }, [reminders]);
  
  const showContent = !showLoading || forceReady;
  
  return (
    <>
      <Card className="border-warmbeige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md relative bg-warmbeige-50 flex flex-col">
        {/* Decorative background elements */}
        <BackgroundPawPrint />
        
        <RemindersHeader hasReminders={hasReminders} />
        <CardContent className="p-0 flex flex-col overflow-hidden">
          <RemindersContent 
            showContent={showContent}
            hasError={hasError}
            remindersData={{ reminders, isLoading, hasError, handleMarkComplete }}
            onOpenDialog={() => setRemindersDialogOpen(true)}
          />
        </CardContent>
        
        {/* Paw print indicator at the bottom */}
        <PawIndicator />
      </Card>
      
      {/* Only render dialog when it's open to save resources */}
      {remindersDialogOpen && (
        <Suspense fallback={null}>
          <RemindersDialog 
            open={remindersDialogOpen} 
            onOpenChange={setRemindersDialogOpen} 
          />
        </Suspense>
      )}
    </>
  );
});

BreedingReminders.displayName = 'BreedingReminders';

export default BreedingReminders;
