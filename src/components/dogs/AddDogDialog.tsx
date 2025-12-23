
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { dateToISOString } from '@/utils/dateUtils';
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
import DogImageField from './image-upload/DogImageField';
import HeatRecordsField from './heat-records/HeatRecordsField';
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
  const { isAuthReady } = useAuth();
  const [imageUrl, setImageUrl] = useState<string>('/placeholder.svg');
  
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
      image: imageUrl
    }
  });

  const handleImageChange = (newImageUrl: string) => {
    console.log('AddDogDialog: Image URL updated:', newImageUrl);
    setImageUrl(newImageUrl);
    form.setValue('image', newImageUrl);
  };

  const handleSubmit = async (data: z.infer<typeof dogFormSchema>) => {
    if (loading) return;
    
    // First check if auth is ready
    if (!isAuthReady) {
      console.log('[AddDog] Auth not ready yet, delaying dog addition');
      toast({
        title: "Please wait",
        description: "Preparing your account. Please try again in a moment.",
      });
      return;
    }
    
    try {
      // Use the current image URL from state to ensure it's the latest
      const result = await addDog({
        name: data.name,
        breed: data.breed,
        gender: data.gender,
        dateOfBirth: dateToISOString(data.dateOfBirth),
        color: data.color,
        registrationNumber: data.registrationNumber,
        dewormingDate: data.dewormingDate ? dateToISOString(data.dewormingDate) : undefined,
        vaccinationDate: data.vaccinationDate ? dateToISOString(data.vaccinationDate) : undefined,
        sterilization_date: data.sterilizationDate ? dateToISOString(data.sterilizationDate) : undefined,
        notes: data.notes || '',
        image: imageUrl, // Use the image URL from state
        heatHistory: data.heatHistory?.map(heat => ({ 
          date: dateToISOString(heat.date)
        })) || [],
        owner_id: '', // Will be set by backend
        breedingHistory: { litters: [], breedings: [] }
      });
      
      if (result) {
        form.reset();
        setImageUrl('/placeholder.svg');
        onOpenChange(false);
        toast({
          title: "Dog added successfully",
          description: `${data.name} has been added to your dogs`,
        });
      }
    } catch (error) {
      console.error('Error adding dog:', error);
      toast({
        title: "Error",
        description: "Failed to add dog. Please try again.",
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
            {/* Add DogImageField at the top */}
            <DogImageField 
              form={form} 
              handleImageChange={handleImageChange} 
              disabled={loading} 
            />
            
            <DogFormFields form={form} />
            
            {/* Heat input removed - users should use Heat Journal instead */}
            
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
