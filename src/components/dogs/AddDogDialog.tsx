
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import DogFormFields from './DogFormFields';
import { dogFormSchema, DogFormValues } from './schema/dogFormSchema';
import DogImageField from './DogImageField';
import { format } from 'date-fns';
import { useDogs } from '@/hooks/useDogs';
import { uploadDogImageFromBase64 } from '@/services/dogs';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

interface AddDogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDogDialog: React.FC<AddDogDialogProps> = ({ open, onOpenChange }) => {
  const [imageChanged, setImageChanged] = useState(false);
  const { addDog, isAddingDog, refreshDogs } = useDogs();
  
  const form = useForm<DogFormValues>({
    resolver: zodResolver(dogFormSchema),
    defaultValues: {
      name: '',
      breed: '',
      dateOfBirth: new Date(),
      gender: 'male',
      color: '',
      registrationNumber: '',
      dewormingDate: undefined,
      vaccinationDate: undefined,
      notes: '',
      image: '',
      heatHistory: [],
      heatInterval: undefined,
    },
  });

  const handleImageChange = (imageBase64: string) => {
    form.setValue('image', imageBase64);
    setImageChanged(true);
  };

  const onSubmit = async (values: DogFormValues) => {
    try {
      // Format dates
      const formattedValues = {
        ...values,
        dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
        dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : undefined,
        vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : undefined,
      };
      
      // Generate temporary dog ID for image upload
      const tempDogId = uuidv4();
      
      // Handle image upload if an image was provided
      let imageUrl = null;
      if (values.image) {
        try {
          imageUrl = await uploadDogImageFromBase64(values.image, tempDogId);
        } catch (error) {
          console.error("Error uploading image:", error);
          toast({
            title: "Image Upload Failed",
            description: "Could not upload the image, but we'll continue saving other data.",
            variant: "destructive",
          });
        }
      }
      
      // Add the dog
      await addDog({
        ...formattedValues,
        image_url: imageUrl,
      });
      
      // Close the dialog and reset the form
      onOpenChange(false);
      form.reset();
      
      // Refresh the dogs list
      refreshDogs();
      
    } catch (error) {
      console.error("Error adding dog:", error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!isAddingDog) {
        onOpenChange(newOpen);
        if (!newOpen) {
          form.reset();
        }
      }
    }}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Dog</DialogTitle>
          <DialogDescription>
            Fill in the information below to add a new dog to your breeding program.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
              <DogImageField 
                form={form} 
                handleImageChange={handleImageChange} 
              />
              <div>
                <DogFormFields form={form} />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isAddingDog}>
                {isAddingDog ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : "Add Dog"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDogDialog;
