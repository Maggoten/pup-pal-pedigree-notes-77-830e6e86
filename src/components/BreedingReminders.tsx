
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CalendarClock, PawPrint, Scale, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { useDogs } from '@/context/DogsContext';
import { differenceInDays, parseISO, addDays } from 'date-fns';

interface Reminder {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  type: 'heat' | 'mating' | 'vaccination' | 'deworming' | 'weighing' | 'other';
}

const BreedingReminders: React.FC = () => {
  const { dogs } = useDogs();
  const today = new Date();
  
  // Generate reminders based on dogs data
  const generateReminders = (): Reminder[] => {
    const reminders: Reminder[] = [];
    
    // Check each dog for upcoming events
    dogs.forEach((dog) => {
      // If female, add heat cycle reminders (assuming a 6-month cycle)
      if (dog.gender === 'female' && dog.breedingHistory?.matings) {
        // Find the last heat date (using the last mating date as an approximation)
        const lastMating = dog.breedingHistory.matings.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )[0];
        
        if (lastMating) {
          const lastHeatDate = parseISO(lastMating.date);
          const nextHeatDate = addDays(lastHeatDate, 180); // Approximately 6 months
          
          if (differenceInDays(nextHeatDate, today) <= 30) {
            reminders.push({
              id: `heat-${dog.id}`,
              title: `${dog.name}'s Heat Approaching`,
              description: `Expected heat cycle in ${differenceInDays(nextHeatDate, today)} days`,
              icon: <PawPrint className="h-5 w-5 text-rose-500" />,
              dueDate: nextHeatDate,
              priority: 'high',
              type: 'heat'
            });
          }
        }
      }
      
      // Check for upcoming vaccinations
      if (dog.vaccinationDate) {
        const lastVaccination = parseISO(dog.vaccinationDate);
        const nextVaccination = addDays(lastVaccination, 365); // Yearly vaccinations
        
        if (differenceInDays(nextVaccination, today) <= 30) {
          reminders.push({
            id: `vaccine-${dog.id}`,
            title: `${dog.name}'s Vaccination Due`,
            description: `Vaccination due in ${differenceInDays(nextVaccination, today)} days`,
            icon: <CalendarClock className="h-5 w-5 text-amber-500" />,
            dueDate: nextVaccination,
            priority: 'medium',
            type: 'vaccination'
          });
        }
      }
      
      // Check for upcoming deworming
      if (dog.dewormingDate) {
        const lastDeworming = parseISO(dog.dewormingDate);
        const nextDeworming = addDays(lastDeworming, 90); // Quarterly deworming
        
        if (differenceInDays(nextDeworming, today) <= 14) {
          reminders.push({
            id: `deworm-${dog.id}`,
            title: `${dog.name}'s Deworming Due`,
            description: `Deworming due in ${differenceInDays(nextDeworming, today)} days`,
            icon: <CalendarClock className="h-5 w-5 text-green-500" />,
            dueDate: nextDeworming,
            priority: 'medium',
            type: 'deworming'
          });
        }
      }
    });
    
    // Add a few general reminders
    if (dogs.length > 0 && dogs.filter(dog => dog.gender === 'female').length === 0) {
      reminders.push({
        id: 'add-female',
        title: 'Add Female Dogs',
        description: 'Add your female dogs to start tracking heat cycles',
        icon: <PawPrint className="h-5 w-5 text-primary" />,
        dueDate: today,
        priority: 'low',
        type: 'other'
      });
    }
    
    // Check if there are any puppies that need weighing
    const hasActiveLitters = dogs.some(dog => 
      dog.gender === 'female' && 
      dog.breedingHistory?.litters && 
      dog.breedingHistory.litters.some(litter => {
        const litterDate = parseISO(litter.date);
        return differenceInDays(today, litterDate) <= 56; // Puppies less than 8 weeks old
      })
    );
    
    if (hasActiveLitters) {
      reminders.push({
        id: 'weigh-puppies',
        title: 'Weigh Puppies',
        description: 'Regular weight tracking is important for puppy development',
        icon: <Scale className="h-5 w-5 text-blue-500" />,
        dueDate: today,
        priority: 'high',
        type: 'weighing'
      });
    }
    
    return reminders;
  };
  
  const reminders = generateReminders();
  
  const handleMarkComplete = (id: string) => {
    toast({
      title: "Reminder Completed",
      description: "This task has been marked as completed."
    });
    // In a real app, this would update the backend
  };
  
  // Sort reminders by priority (high first)
  const sortedReminders = [...reminders].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Breeding Reminders
        </CardTitle>
        <CardDescription>
          Important tasks and upcoming events
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedReminders.length > 0 ? (
          <div className="space-y-4">
            {sortedReminders.map((reminder) => (
              <div 
                key={reminder.id} 
                className={`p-4 rounded-lg border flex items-start justify-between ${
                  reminder.priority === 'high' ? 'bg-rose-50 border-rose-200' :
                  reminder.priority === 'medium' ? 'bg-amber-50 border-amber-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{reminder.icon}</div>
                  <div>
                    <h4 className="font-medium">{reminder.title}</h4>
                    <p className="text-sm text-muted-foreground">{reminder.description}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => handleMarkComplete(reminder.id)}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as complete</span>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No Reminders</h3>
            <p className="text-sm text-muted-foreground">
              You're all caught up! Add more breeding data to generate reminders.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BreedingReminders;
