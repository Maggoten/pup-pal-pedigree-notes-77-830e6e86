
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
import { toast } from '@/components/ui/use-toast';
import { useDogs } from '@/context/DogsContext';
import { Dog } from '@/types/dogs';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ 
  open, 
  onOpenChange
}) => {
  const { addDog, loading } = useDogs();
  
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
    // Convert form data to Dog model
    const newDog = {
      name: data.name,
      breed: data.breed,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth.toISOString().split('T')[0],
      color: data.color,
      registrationNumber: data.registrationNumber,
      notes: data.notes || '',
      image: '/placeholder.svg', // Default image
      heatHistory: data.heatHistory?.map(heat => ({ 
        date: heat.date.toISOString().split('T')[0] 
      })) || [],
      heatInterval: data.heatInterval,
      // Fields not in form but required by Dog type
      owner_id: '', // Will be set by useDogs hook
      breedingHistory: { litters: [], breedings: [] }
    };

    const result = await addDog(newDog);
    
    if (result) {
      onOpenChange(false);
      form.reset();
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
