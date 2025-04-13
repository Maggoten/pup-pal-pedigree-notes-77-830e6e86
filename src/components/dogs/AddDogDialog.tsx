
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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
import { Dog } from '@/types/dogs';
import { useSupabaseDogs } from '@/context/SupabaseDogContext';
import DogImageField from './DogImageField';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddDog: (dog: Dog) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ 
  open, 
  onOpenChange,
  onAddDog 
}) => {
  const { addDog, uploadImage } = useSupabaseDogs();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      heatInterval: undefined,
      image: ''
    }
  });

  const handleImageChange = (imageBase64: string) => {
    form.setValue('image', imageBase64);
  };

  const handleSubmit = async (data: z.infer<typeof dogFormSchema>) => {
    setIsSubmitting(true);
    try {
      // Prepare the dog data
      const newDog: Omit<Dog, "id"> = {
        name: data.name,
        breed: data.breed,
        gender: data.gender,
        dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
        color: data.color,
        registrationNumber: data.registrationNumber || undefined,
        notes: data.notes || undefined,
        dewormingDate: data.dewormingDate ? format(data.dewormingDate, 'yyyy-MM-dd') : undefined,
        vaccinationDate: data.vaccinationDate ? format(data.vaccinationDate, 'yyyy-MM-dd') : undefined,
        heatInterval: data.heatInterval,
        // We'll update the image after the dog is created
      };

      // Add the dog to the database
      const createdDog = await addDog(newDog);
      
      if (createdDog) {
        // Handle image upload if there's a base64 image
        if (data.image && data.image.startsWith('data:image')) {
          // Convert base64 to File object
          const base64Response = await fetch(data.image);
          const blob = await base64Response.blob();
          const file = new File([blob], `${createdDog.name}-image.jpg`, { type: 'image/jpeg' });
          
          // Upload image
          const imageUrl = await uploadImage(file, createdDog.id);
          
          if (imageUrl) {
            // Update dog with image URL
            await addDog({
              ...newDog,
              image_url: imageUrl
            });
          }
        }
        
        onAddDog(createdDog);
        onOpenChange(false);
        form.reset();
      }
    } catch (error) {
      console.error('Error adding dog:', error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
              <DogImageField
                form={form}
                handleImageChange={handleImageChange}
              />
              <div className="space-y-6">
                <DogFormFields form={form} />
                
                {form.watch('gender') === 'female' && (
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Heat Cycle Information</h3>
                    <HeatRecordsField form={form} />
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Adding Dog...' : 'Add Dog'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
