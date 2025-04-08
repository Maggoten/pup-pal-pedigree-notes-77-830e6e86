
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BellRing, PawPrint } from 'lucide-react';
import RemindersList from './reminders/RemindersList';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import RemindersDialog from './reminders/RemindersDialog';

const BreedingReminders: React.FC = () => {
  const { reminders, handleMarkComplete } = useBreedingReminders();
  const [remindersDialogOpen, setRemindersDialogOpen] = useState(false);
  
  // Take only the top 3 high priority reminders for compact view
  const highPriorityReminders = reminders
    .filter(r => r.priority === 'high')
    .slice(0, 3);
  
  return (
    <>
      <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md h-full relative bg-greige-50">
        {/* Decorative background elements */}
        <div className="absolute top-1 right-1 opacity-5">
          <PawPrint className="h-40 w-40 text-primary transform rotate-12" />
        </div>
        
        <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3 relative">
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
        <CardContent className="p-0 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
          <RemindersList 
            reminders={highPriorityReminders.length > 0 ? highPriorityReminders : reminders.slice(0, 3)} 
            onComplete={handleMarkComplete} 
            compact={true} 
            enableDelete={true}
          />
          
          <div className="p-3 text-center">
            <button 
              onClick={() => setRemindersDialogOpen(true)}
              className="text-xs text-primary hover:text-primary/70 font-medium"
            >
              View All Reminders
            </button>
          </div>
        </CardContent>
        
        {/* Paw print indicator at the bottom */}
        <div className="absolute bottom-2 right-2 opacity-30">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{ opacity: 0.5 + (i * 0.25) }}
              ></div>
            ))}
          </div>
        </div>
      </Card>
      
      <RemindersDialog 
        open={remindersDialogOpen} 
        onOpenChange={setRemindersDialogOpen} 
        enableDelete={true}
      />
    </>
  );
};

export default BreedingReminders;
