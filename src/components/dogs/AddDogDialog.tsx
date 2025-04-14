
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { v4 as uuidv4 } from 'uuid';
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
import { Dog } from '@/context/DogsContext';
import { useAuth } from '@/hooks/useAuth';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDog: (dog: Omit<Dog, 'id' | 'user_id'>) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ 
  open, 
  onOpenChange,
  onAddDog 
}) => {
  const { user } = useAuth();
  
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

  const handleSubmit = (data: z.infer<typeof dogFormSchema>) => {
    // Convert dates to ISO strings for storage
    const newDog: Omit<Dog, 'id' | 'user_id'> = {
      name: data.name,
      breed: data.breed,
      gender: data.gender,
      dateOfBirth: data.dateOfBirth.toISOString(),
      color: data.color,
      registrationNumber: data.registrationNumber,
      notes: data.notes || '',
      image: '/placeholder.svg', // Default image
      heatHistory: data.heatHistory?.map(heat => ({ 
        date: heat.date.toISOString() 
      })) || [],
      heatInterval: data.heatInterval,
      breedingHistory: { litters: [] }
    };

    onAddDog(newDog);
    onOpenChange(false);
    form.reset();
    
    toast({
      title: "Dog Added",
      description: `${data.name} has been added to your dogs.`
    });
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
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Add Dog</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
