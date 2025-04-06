
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, PawPrint, ArrowRight } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import DogIllustration from './illustrations/DogIllustration';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const BreedingReminders: React.FC = () => {
  const { reminders, handleMarkComplete } = useBreedingReminders();
  const navigate = useNavigate();
  
  // Take the top 5 reminders, prioritizing by high priority first
  const sortedReminders = [...reminders]
    .sort((a, b) => {
      // First sort by priority
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by due date (if priority is the same)
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    .slice(0, 5);
  
  const handleViewAllReminders = () => {
    navigate('/reminders');
  };
  
  return (
    <Card className="border-primary/20 shadow-md overflow-hidden transition-shadow hover:shadow-lg h-full relative">
      {/* Decorative background elements */}
      <div className="absolute top-1 right-1 opacity-5">
        <DogIllustration 
          breed="border-collie"
          size={120}
          color="var(--primary)"
        />
      </div>
      
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent border-b border-primary/10 pb-3 relative">
        <div className="absolute top-6 right-6">
          <div className="relative">
            <div className="absolute animate-ping w-3 h-3 rounded-full bg-primary/30"></div>
            <div className="w-3 h-3 rounded-full bg-primary/60"></div>
          </div>
        </div>
        
        <CardTitle className="flex items-center gap-2 text-primary">
          <BellRing className="h-5 w-5" />
          Breeding Reminders
        </CardTitle>
        <CardDescription>
          Important tasks and upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <RemindersList 
          reminders={sortedReminders} 
          onComplete={handleMarkComplete} 
          compact={false} 
        />
        
        {reminders.length > sortedReminders.length && (
          <div className="p-3 flex justify-center">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full flex items-center justify-center gap-1"
              onClick={handleViewAllReminders}
            >
              View All Reminders
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingReminders;
