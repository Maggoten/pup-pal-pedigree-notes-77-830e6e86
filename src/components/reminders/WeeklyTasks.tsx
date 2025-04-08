
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Clock } from 'lucide-react';
import { format, isWithinInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { Reminder } from '@/hooks/useBreedingReminders';
import ReminderItem from './ReminderItem';
import { Button } from '@/components/ui/button';

interface WeeklyTasksProps {
  reminders: Reminder[];
  onComplete: (id: string) => void;
}

const WeeklyTasks: React.FC<WeeklyTasksProps> = ({ reminders, onComplete }) => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Start on Monday
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // End on Sunday
  
  // Filter reminders for this week
  const weeklyReminders = reminders.filter(reminder => 
    isWithinInterval(reminder.dueDate, { start: weekStart, end: weekEnd })
  );
  
  // Generate the weekday labels
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(weekStart, i);
    return {
      date: day,
      name: format(day, 'EEE'),
      isToday: format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
    };
  });

  return (
    <Card className="border-greige-300 shadow-sm overflow-hidden transition-shadow hover:shadow-md beige-gradient">
      <CardHeader className="bg-gradient-to-r from-greige-100 to-transparent border-b border-greige-200 pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <CheckCircle className="h-5 w-5" />
          This Week's Tasks
        </CardTitle>
        <CardDescription>
          Tasks and reminders for the current week
        </CardDescription>
      </CardHeader>
      
      <div className="px-4 py-2 border-b border-greige-200 bg-greige-50/50">
        <div className="flex justify-between">
          {weekDays.map(day => (
            <div 
              key={day.name} 
              className={`flex flex-col items-center py-1 px-2 rounded-md ${
                day.isToday ? 'bg-primary/20 text-primary font-medium' : ''
              }`}
            >
              <span className="text-xs">{day.name}</span>
              <span className="text-sm font-semibold">{format(day.date, 'd')}</span>
            </div>
          ))}
        </div>
      </div>
      
      <CardContent className="p-0 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
        {weeklyReminders.length > 0 ? (
          <div className="divide-y divide-primary/5">
            {weeklyReminders.map(reminder => (
              <ReminderItem
                key={reminder.id}
                id={reminder.id}
                title={reminder.title}
                description={reminder.description}
                icon={reminder.icon}
                priority={reminder.priority}
                dueDate={reminder.dueDate}
                type={reminder.type}
                relatedId={reminder.relatedId}
                onComplete={onComplete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="bg-primary/5 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-primary opacity-70" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Tasks This Week</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              You're all caught up for this week! Enjoy some free time.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => {
                // This would open a dialog to add a custom task
                // For now, we'll just log this intention
                console.log('Add a custom task');
              }}
            >
              Add Custom Task
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyTasks;
