
import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useDogs } from '@/context/DogsContext';
import { useToast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import NewLitterForm from './NewLitterForm';
import { useAuth } from '@/providers/AuthProvider';
import { useForm, FormProvider } from 'react-hook-form';
import { litterService } from '@/services/LitterService';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { littersQueryKey } from '@/hooks/litters/queries/useAddLitterMutation';
import { useTranslation } from 'react-i18next';

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
  const { user, isAuthReady } = useAuth();
  const queryClient = useQueryClient();
  const { t } = useTranslation('litters');
  
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
      console.log("Date of birth:", values.dateOfBirth);
      
      // First check if auth is ready
      if (!isAuthReady) {
        console.log('[NewLitter] Auth not ready yet, delaying litter creation');
        toast({
          title: "Please wait",
          description: "Preparing your account. Please try again in a moment.",
        });
        return;
      }
      
      // Validation checks
      if (!values.litterName) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.litterName'),
          variant: "destructive"
        });
        return;
      }
      
      if (!values.isExternalSire && !values.sireId) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.sire'),
          variant: "destructive"
        });
        return;
      }
      
      if (values.isExternalSire && !values.externalSireName) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.externalSireName'),
          variant: "destructive"
        });
        return;
      }
      
      if (!values.damId) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.dam'),
          variant: "destructive"
        });
        return;
      }

      // Get current session to ensure user is logged in
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          title: t('dialog.toasts.auth.title'),
          description: t('dialog.toasts.auth.sessionError'),
          variant: "destructive"
        });
        return;
      }
      
      if (!sessionData.session || !sessionData.session.user) {
        console.error("No active user session found");
        toast({
          title: t('dialog.toasts.auth.title'),
          description: t('dialog.toasts.auth.notLoggedIn'),
          variant: "destructive"
        });
        return;
      }

      console.log("Creating litter with authenticated user:", sessionData.session.user.id);

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

      // Create unique ID for new litter - use UUID format for Supabase
      const newLitterId = crypto.randomUUID();
      console.log("Generated litter ID:", newLitterId);
      
      // Format the date properly - ensure we're sending an ISO string to Supabase
      const formattedDate = values.dateOfBirth instanceof Date 
        ? values.dateOfBirth.toISOString() 
        : new Date(values.dateOfBirth).toISOString();
      
      console.log("Formatted date:", formattedDate);
      
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

      console.log("Creating new litter with data:", JSON.stringify(newLitter, null, 2));
      
      // Add external sire information if applicable
      if (values.isExternalSire) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = values.externalSireBreed;
        (newLitter as any).externalSireRegistration = values.externalSireRegistration;
      }
      
      // Use the litterService to add the litter to Supabase
      const result = await litterService.addLitter(newLitter);
      
      if (!result) {
        throw new Error("Failed to add litter - no result returned");
      }
      
      console.log("Litter successfully created:", result);
      
      // Invalidate React Query cache to force refresh
      queryClient.invalidateQueries({ queryKey: littersQueryKey });
      
      // Call the onLitterAdded callback with the new litter
      onLitterAdded(newLitter);
      onClose();
      
      toast({
        title: t('dialog.toasts.success.title'),
        description: t('dialog.toasts.success.created', { name: values.litterName })
      });
    } catch (error) {
      console.error("Error creating litter:", error);
      
      // More specific error message based on the error
      let errorMessage = "Failed to create litter";
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        
        // Check for Supabase specific error patterns
        if (error.message.includes("duplicate key")) {
          errorMessage = "A litter with this ID already exists";
        } else if (error.message.includes("violates row level security")) {
          errorMessage = "Permission denied. Please check your authentication";
        } else if (error.message.includes("JWT")) {
          errorMessage = "Your session has expired. Please log in again";
        }
      }
      
      toast({
        title: t('dialog.toasts.error.title'),
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <NewLitterForm dogs={dogs} />
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
          {t('dialog.buttons.cancel')}
        </Button>
        <Button type="button" onClick={methods.handleSubmit(handleNewLitterSubmit)}>
          {t('dialog.buttons.createLitter')}
        </Button>
      </DialogFooter>
    </FormProvider>
  );
};

export default NewLitterTabContent;
