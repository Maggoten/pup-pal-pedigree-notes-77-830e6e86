
import React from 'react';
import { format, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';
import { UpcomingHeat } from '@/types/reminders';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeatService } from '@/services/HeatService';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';
import { supabase } from '@/integrations/supabase/client';
import { handleSupabaseError } from '@/utils/supabaseProfileUtils';

interface UpcomingHeatCardProps {
  heat: UpcomingHeat;
  onDelete?: () => void;
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ heat, onDelete }) => {
  const navigate = useNavigate();
  
  // Create calculated properties needed by ReminderCalendarSyncService
  const dogId = heat.dog.id;
  const dogName = heat.dog.name;
  const date = heat.expectedDate;
  const heatWithAdditionalProps = { ...heat, dogId, dogName, date };
  
  // Function to navigate to dog details
  const handleViewDog = () => {
    navigate(`/dogs/${heat.dog.id}`);
  };
  
  // Function to add a heat record for a dog
  const handleRecordHeat = async () => {
    if (!heat.dog.id) return;
    
    try {
      // Step 1: Add the heat date to the dog's heat history
      const success = await HeatService.addHeatDate(heat.dog.id, new Date());
      
      if (success) {
        // Step 2: Update calendar events
        await ReminderCalendarSyncService.syncHeatCycleEvents(heatWithAdditionalProps);
        
        // Step 3: Add a calendar event for the actual heat
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const heatEvent = {
            title: `${heat.dog.name} - Heat cycle recorded`,
            date: new Date(),
            type: 'heat',
            dog_id: heat.dog.id,
            dog_name: heat.dog.name,
            notes: `Heat cycle recorded for ${heat.dog.name}`,
            user_id: user.id
          };
          
          await supabase.from('calendar_events').insert(heatEvent);
        }
        
        toast({
          title: "Heat Recorded",
          description: `Heat cycle recorded for ${heat.dog.name}`,
        });
        
        if (onDelete) onDelete();
      } else {
        toast({
          title: "Error",
          description: "Failed to record heat cycle",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error recording heat cycle:", error);
      toast({
        title: "Error",
        description: handleSupabaseError(error),
        variant: "destructive"
      });
    }
  };
  
  // Format the date nicely
  const formattedDate = format(heat.expectedDate, 'MMM d, yyyy');
  
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-gray-100">{heat.dog.name}</h3>
          <div className="flex items-center mt-1">
            <Calendar className="h-4 w-4 mr-1 text-indigo-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">{formattedDate}</span>
          </div>
        </div>
        
        <Badge 
          variant={heat.daysTillHeat <= 7 ? "destructive" : "outline"}
          className="ml-2"
        >
          {heat.daysTillHeat > 0 
            ? `in ${heat.daysTillHeat} days` 
            : heat.daysTillHeat < 0 
              ? `${Math.abs(heat.daysTillHeat)} days ago` 
              : 'Today!'}
        </Badge>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        <Button 
          size="sm" 
          variant="outline"
          onClick={handleViewDog}
        >
          View Dog
        </Button>
        <Button 
          size="sm" 
          onClick={handleRecordHeat}
        >
          Record Heat
        </Button>
      </div>
    </div>
  );
};

export default UpcomingHeatCard;
