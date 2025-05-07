
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Info, X } from 'lucide-react';
import { UpcomingHeat } from '@/types/reminders';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/hooks/use-toast';
import { HeatService } from '@/services/HeatService';

interface UpcomingHeatCardProps {
  upcomingHeats?: UpcomingHeat[];
  heat?: UpcomingHeat; // Add this prop to match how it's used in MatingSection
  onHeatDeleted?: () => void;
}

const UpcomingHeatCard: React.FC<UpcomingHeatCardProps> = ({ upcomingHeats = [], heat, onHeatDeleted }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [heatToDelete, setHeatToDelete] = useState<{dogId: string, index: number} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // If a single heat is provided, use that, otherwise use upcomingHeats array
  const heatsToDisplay = heat ? [heat] : upcomingHeats;

  const handleDeleteClick = (dogId: string, heatIndex: number) => {
    setHeatToDelete({ dogId, index: heatIndex });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!heatToDelete) return;
    
    setIsDeleting(true);
    const { dogId, index } = heatToDelete;
    
    try {
      const success = await HeatService.deleteHeatEntry(dogId, index);
      
      if (success) {
        toast({
          title: "Heat entry deleted",
          description: "The heat entry has been successfully removed."
        });
        // Call the parent callback to refresh the list
        if (onHeatDeleted) {
          onHeatDeleted();
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete the heat entry. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error deleting heat entry:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setHeatToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Heat Cycles</CardTitle>
          <CardDescription>Track your bitches' heat cycles</CardDescription>
        </CardHeader>
        <CardContent>
          {heatsToDisplay.length > 0 ? (
            <div className="space-y-3">
              {heatsToDisplay.map((heat, index) => (
                <div
                  key={`${heat.dogId}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg border bg-warmbeige-100/80 border-warmbeige-200"
                >
                  <div className="mt-0.5">
                    <Calendar className="h-5 w-5 text-rustbrown-500" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium">{heat.dogName}'s Heat Cycle</h4>
                    <p className="text-sm text-muted-foreground">
                      Expected on {format(heat.date, 'PPP')}
                    </p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteClick(heat.dogId, heat.heatIndex)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Info className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Upcoming Heat Cycles</h3>
              <p className="text-muted-foreground mb-4">Add heat information to your female dogs to track cycles</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Heat Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this heat entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default UpcomingHeatCard;
