
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

interface LitterFormValues {
  litterName: string;
  dateOfBirth: Date;
  sireId: string;
  damId: string;
  isExternalSire: boolean;
  externalSireName: string;
  externalSireBreed: string;
  externalSireRegistration: string;
}

const NewLitterTabContent: React.FC<NewLitterTabContentProps> = ({ onClose, onLitterAdded }) => {
  const { dogs } = useDogs();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Set up React Hook Form with typed form values
  const methods = useForm<LitterFormValues>({
    defaultValues: {
      litterName: '',
      dateOfBirth: new Date(),
      sireId: '',
      damId: '',
      isExternalSire: false,
      externalSireName: '',
      externalSireBreed: '',
      externalSireRegistration: '',
    }
  });
  
  const handleNewLitterSubmit = async (values: LitterFormValues) => {
    try {
      console.log("Form submission started with values:", values);
      
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

      // Get current session to ensure user is logged in
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          title: "Authentication Error",
          description: "Could not verify your login session",
          variant: "destructive"
        });
        return;
      }
      
      if (!sessionData.session || !sessionData.session.user) {
        console.error("No active user session found");
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create a litter",
          variant: "destructive"
        });
        return;
      }

      // Get actual sire info
      const actualSireId = values.isExternalSire ? `external-${Date.now()}` : values.sireId;
      let actualSireName = '';
      
      if (values.isExternalSire) {
        actualSireName = values.externalSireName;
      } else {
        const selectedSire = dogs.find(dog => dog.id === values.sireId);
        actualSireName = selectedSire?.name || '';
        console.log("Selected sire:", selectedSire);
      }
      
      const selectedDam = dogs.find(dog => dog.id === values.damId);
      const damName = selectedDam?.name || '';
      console.log("Selected dam:", selectedDam);

      // Create unique ID for new litter
      const newLitterId = `litter-${Date.now()}`;
      
      // Format the date properly
      const formattedDate = values.dateOfBirth.toISOString();
      
      const newLitter: Litter = {
        id: newLitterId,
        name: values.litterName,
        dateOfBirth: formattedDate,
        sireId: actualSireId,
        damId: values.damId,
        sireName: actualSireName,
        damName,
        puppies: [],
        user_id: sessionData.session.user.id
      };

      console.log("Creating new litter with data:", newLitter);
      
      // Add external sire information if applicable
      if (values.isExternalSire) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = values.externalSireBreed;
        (newLitter as any).externalSireRegistration = values.externalSireRegistration;
      }
      
      // Use the litterService to add the litter to Supabase
      await litterService.addLitter(newLitter);
      console.log("Litter successfully created");
      
      // Call the onLitterAdded callback with the new litter
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
        description: `Failed to create litter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <NewLitterForm dogs={dogs} />
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
          Cancel
        </Button>
        <Button type="button" onClick={methods.handleSubmit(handleNewLitterSubmit)}>
          Create Litter
        </Button>
      </DialogFooter>
    </FormProvider>
  );
};

export default NewLitterTabContent;
