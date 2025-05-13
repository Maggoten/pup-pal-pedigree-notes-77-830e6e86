
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import DogFormFields, { dogFormSchema } from './DogFormFields';
import HeatRecordsField from './HeatRecordsField';
import { toast } from '@/hooks/use-toast';
import { useDogs } from '@/context/DogsContext';
import { Dog } from '@/types/dogs';
import { useAuth } from '@/hooks/useAuth';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ 
  open, 
  onOpenChange
}) => {
  const { addDog, loading } = useDogs();
  const { isAuthReady, user, supabaseUser } = useAuth();
  
  const form = useForm<z.infer<typeof dogFormSchema>>({
    resolver: zodResolver(dogFormSchema),
    defaultValues: {
      name: '',
      breed: '',
      gender: 'female',
      dateOfBirth: new Date(),
      color: '',
      registrationNumber: '',
      notes: '',
      heatHistory: [],
      heatInterval: undefined
    }
  });

  const handleSubmit = async (data: z.infer<typeof dogFormSchema>) => {
    if (loading) {
      console.log('[AddDogDialog] Submit aborted - loading state is active');
      return;
    }
    
    // First check if auth is ready
    if (!isAuthReady) {
      console.log('[AddDogDialog] Auth not ready yet, delaying dog addition');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }

    // Check if user is authenticated
    const userId = user?.id || supabaseUser?.id;
    if (!userId) {
      console.error('[AddDogDialog] Cannot add dog: No authenticated user found');
      toast({
        title: "Authentication required",
        description: "You need to be logged in to add a dog",
        variant: "destructive"
      });
      return;
    }
    
    console.log('[AddDogDialog] Submitting form with data:', data);
    
    try {
      console.log('[AddDogDialog] Calling addDog with form data');
      const result = await addDog({
        name: data.name,
        breed: data.breed,
        gender: data.gender,
        dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
        color: data.color || '',
        registrationNumber: data.registrationNumber || '',
        notes: data.notes || '',
        image: '/placeholder.svg',
        heatHistory: data.heatHistory?.map(heat => ({ 
          date: heat.date.toISOString().split('T')[0] 
        })) || [],
        heatInterval: data.heatInterval,
        owner_id: userId, // Set the owner_id to the current user's ID
        breedingHistory: { litters: [], breedings: [] }
      });
      
      console.log('[AddDogDialog] Add dog result:', result);
      
      if (result) {
        toast({
          title: "Success",
          description: `${data.name} has been added to your dogs`
        });
        form.reset();
        onOpenChange(false);
      } else {
        console.error('[AddDogDialog] Add dog returned undefined or null');
        toast({
          title: "Error",
          description: "Failed to add dog. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[AddDogDialog] Error adding dog:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Dog</DialogTitle>
          <DialogDescription>
            Add a new dog to your breeding program.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <DogFormFields form={form} />
            
            {form.watch('gender') === 'female' && (
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Heat Cycle Information</h3>
                <HeatRecordsField form={form} />
              </div>
            )}
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading ? 'Adding...' : 'Add Dog'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
