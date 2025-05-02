
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useDogs } from '@/context/DogsContext';
import { useToast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import NewLitterForm from './NewLitterForm';
import { useAuth } from '@/context/AuthContext';
import { useForm, FormProvider } from 'react-hook-form';
import { litterService } from '@/services/LitterService';
import { supabase } from '@/integrations/supabase/client';

interface NewLitterTabContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
}

const NewLitterTabContent: React.FC<NewLitterTabContentProps> = ({ onClose, onLitterAdded }) => {
  const { dogs } = useDogs();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Set up React Hook Form
  const form = useForm({
    defaultValues: {
      litterName: '',
      sireId: '',
      damId: '',
      dateOfBirth: new Date(),
      isExternalSire: false,
      externalSireName: '',
      externalSireBreed: '',
      externalSireRegistration: '',
    }
  });
  
  const handleNewLitterSubmit = async (values: any) => {
    try {
      // Validation checks
      if (!values.litterName) {
        toast({
          title: "Missing Information",
          description: "Please enter a litter name",
          variant: "destructive"
        });
        return;
      }
      
      if (!values.isExternalSire && !values.sireId) {
        toast({
          title: "Missing Information",
          description: "Please select a sire or enable external sire",
          variant: "destructive"
        });
        return;
      }
      
      if (values.isExternalSire && !values.externalSireName) {
        toast({
          title: "Missing Information",
          description: "Please enter the external sire's name",
          variant: "destructive"
        });
        return;
      }
      
      if (!values.damId) {
        toast({
          title: "Missing Information",
          description: "Please select a dam",
          variant: "destructive"
        });
        return;
      }

      // Get actual sire info
      const actualSireId = values.isExternalSire ? `external-${Date.now()}` : values.sireId;
      const actualSireName = values.isExternalSire ? values.externalSireName : 
                            dogs.find(dog => dog.id === values.sireId)?.name || '';
      const damName = dogs.find(dog => dog.id === values.damId)?.name || '';
      
      // Check if user session exists
      if (!user || !user.id) {
        console.error("No active user session found");
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a litter",
          variant: "destructive"
        });
        return;
      }

      const newLitterId = `litter-${Date.now()}`;
      const newLitter: Litter = {
        id: newLitterId,
        name: values.litterName,
        dateOfBirth: values.dateOfBirth.toISOString().split('T')[0],
        sireId: actualSireId,
        damId: values.damId,
        sireName: actualSireName,
        damName,
        puppies: [],
        user_id: user.id
      };

      console.log("Creating new litter with data:", newLitter);
      
      // Add external sire information if applicable
      if (values.isExternalSire) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = values.externalSireBreed;
        (newLitter as any).externalSireRegistration = values.externalSireRegistration;
      }
      
      // Use the litterService to add the litter to Supabase
      const result = await litterService.addLitter(newLitter);
      console.log("Litter creation result:", result);
      
      // Verify the litter was added successfully
      const { data: checkData, error: checkError } = await supabase
        .from('litters')
        .select('*')
        .eq('id', newLitterId);
        
      console.log("Verification check:", checkData, checkError);
      
      if (checkError || !checkData?.length) {
        throw new Error("Failed to verify litter creation");
      }
      
      onLitterAdded(newLitter);
      onClose();
      
      toast({
        title: "Success",
        description: `Litter "${values.litterName}" has been created`
      });
    } catch (error) {
      console.error("Error creating litter:", error);
      toast({
        title: "Error",
        description: "Failed to create litter. Please check console for details.",
        variant: "destructive"
      });
    }
  };

  return (
    <FormProvider {...form}>
      <NewLitterForm 
        form={form}
        dogs={dogs}
      />
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
          Cancel
        </Button>
        <Button type="button" onClick={form.handleSubmit(handleNewLitterSubmit)}>
          Create Litter
        </Button>
      </DialogFooter>
    </FormProvider>
  );
};

export default NewLitterTabContent;
