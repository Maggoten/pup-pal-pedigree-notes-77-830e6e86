
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { Dog } from '@/context/DogsContext';
import { supabase } from '@/integrations/supabase/client';

interface UpcomingHeatCardProps {
  dog: Dog;
  heatDate: Date;
  onDeleted: () => void;
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ dog, heatDate, onDeleted }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Format the heat date for display
  const formattedDate = format(heatDate, 'MMM dd, yyyy');
  
  // Function to delete the heat event
  const deleteHeatEvent = async () => {
    try {
      setIsDeleting(true);
      
      // Find the calendar event that corresponds to this dog's heat
      const { data, error } = await supabase
        .from('calendar_events')
        .select('id')
        .eq('dog_id', dog.id as any)
        .eq('type', 'heat' as any)
        .eq('date', heatDate.toISOString() as any)
        .limit(1);
      
      if (error) {
        console.error('Error finding heat event:', error);
        throw error;
      }
      
      // If we found the event, delete it
      if (data && data.length > 0) {
        const { error: deleteError } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          throw deleteError;
        }
      }
      
      // Call the onDeleted callback
      onDeleted();
      setShowConfirm(false);
    } catch (error) {
      console.error('Error deleting heat event:', error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="relative hover:shadow-md transition-shadow">
      <CardContent className="pt-6 pb-0">
        <h3 className="font-medium text-lg">{dog.name}</h3>
        <p className="text-muted-foreground text-sm">Expected heat: {formattedDate}</p>
        <p className="text-sm mt-1.5">Breed: {dog.breed || 'Not specified'}</p>
      </CardContent>
      
      <CardFooter className="flex justify-end p-4">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-destructive/10" 
          onClick={() => setShowConfirm(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Heat Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this heat event for {dog.name}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteHeatEvent}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default UpcomingHeatCard;
