
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Litter, PlannedLitter } from '@/types/breeding';
import PlannedLitterForm from './PlannedLitterForm';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';

interface PlannedLitterTabContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
  plannedLitters: PlannedLitter[];
}

const PlannedLitterTabContent: React.FC<PlannedLitterTabContentProps> = ({ 
  onClose, 
  onLitterAdded,
  plannedLitters
}) => {
  const { toast } = useToast();
  const { user, isAuthReady } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation('litters');
  
  // Planned litter form state
  const [selectedPlannedLitterId, setSelectedPlannedLitterId] = useState('');
  const [plannedLitterName, setPlannedLitterName] = useState('');
  const [plannedDateOfBirth, setPlannedDateOfBirth] = useState<Date>(new Date());
  
  // External sire state (needed for planned litters that might have external males)
  const [isExternalSire, setIsExternalSire] = useState(false);
  const [externalSireName, setExternalSireName] = useState('');
  const [externalSireBreed, setExternalSireBreed] = useState('');
  const [externalSireRegistration, setExternalSireRegistration] = useState('');

  // Set defaults when planned litters are loaded
  useEffect(() => {
    // When planned litters change, attempt to set defaults
    if (plannedLitters && plannedLitters.length > 0) {
      console.log("Setting default values from planned litters:", plannedLitters.length);
      
      // Only set if not already selected
      if (!selectedPlannedLitterId) {
        const firstLitter = plannedLitters[0];
        setSelectedPlannedLitterId(firstLitter.id);
        
        // Set default litter name if none is set
        if (!plannedLitterName) {
          setPlannedLitterName(`${firstLitter.femaleName}'s litter`);
        }
        
        // Set external sire flag based on selected litter
        setIsExternalSire(firstLitter.externalMale || false);
      }
    }
  }, [plannedLitters, selectedPlannedLitterId, plannedLitterName]);

  // Update form when selected planned litter changes
  useEffect(() => {
    if (selectedPlannedLitterId) {
      const selectedLitter = plannedLitters.find(litter => litter.id === selectedPlannedLitterId);
      if (selectedLitter) {
        console.log("Selected planned litter changed:", selectedLitter.id);
        
        // Update external sire info based on selection
        setIsExternalSire(selectedLitter.externalMale || false);
        
        if (selectedLitter.externalMale) {
          setExternalSireName(selectedLitter.maleName || '');
          setExternalSireBreed(selectedLitter.externalMaleBreed || '');
          setExternalSireRegistration(selectedLitter.externalMaleRegistration || '');
        }
        
        // Update litter name if not manually changed
        setPlannedLitterName(`${selectedLitter.femaleName}'s litter`);
      }
    }
  }, [selectedPlannedLitterId, plannedLitters]);

  const handlePlannedLitterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation checks
      if (!selectedPlannedLitterId) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.plannedLitter'),
          variant: "destructive"
        });
        return;
      }
      
      if (!plannedLitterName) {
        toast({
          title: t('dialog.toasts.missingInfo.title'),
          description: t('dialog.toasts.missingInfo.plannedLitterName'),
          variant: "destructive"
        });
        return;
      }
      
      // First check if auth is ready
      if (!isAuthReady || !user) {
        console.log('[PlannedLitter] Auth not ready yet, delaying litter creation');
        toast({
          title: t('dialog.toasts.auth.pleaseWait'),
          description: t('dialog.toasts.auth.preparing'),
        });
        return;
      }
      
      const selectedLitter = plannedLitters.find(
        litter => litter.id === selectedPlannedLitterId
      );
      
      if (!selectedLitter) {
        throw new Error("Selected litter not found");
      }
      
      console.log("Creating litter from planned litter:", selectedLitter);
      
      // Try to automatically link to pregnancy via mating_dates
      let pregnancyId: string | undefined;
      try {
        const { data: matingDates, error: matingError } = await supabase
          .from('mating_dates')
          .select('pregnancy_id, pregnancies!inner(status)')
          .eq('planned_litter_id', selectedPlannedLitterId)
          .limit(1);

        if (!matingError && matingDates && matingDates.length > 0) {
          const matingDate = matingDates[0];
          // Verify pregnancy is completed
          if (matingDate.pregnancy_id && matingDate.pregnancies?.status === 'completed') {
            pregnancyId = matingDate.pregnancy_id;
            console.log('Automatically linked to pregnancy:', pregnancyId);
          }
        }
      } catch (linkError) {
        console.warn('Could not automatically link to pregnancy:', linkError);
        // Continue without pregnancy link
      }
      
      // Generate a proper UUID for the new litter ID
      const newLitterId = crypto.randomUUID();
      console.log("Generated new litter ID:", newLitterId);
      
      const newLitter: Litter = {
        id: newLitterId,
        name: plannedLitterName,
        dateOfBirth: plannedDateOfBirth.toISOString(),
        sireId: selectedLitter.externalMale ? `external-${selectedLitter.id}` : selectedLitter.maleId,
        damId: selectedLitter.femaleId,
        sireName: selectedLitter.maleName,
        damName: selectedLitter.femaleName,
        puppies: [],
        user_id: user.id,
        pregnancyId
      };
      
      // Add external sire information if needed
      if (selectedLitter.externalMale) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = selectedLitter.externalMaleBreed;
        (newLitter as any).externalSireRegistration = selectedLitter.externalMaleRegistration;
      }
      
      console.log("Submitting new litter:", newLitter);
      onLitterAdded(newLitter);
      
      toast({
        title: t('dialog.toasts.success.title'),
        description: t('dialog.toasts.success.createdFromPlanned', { name: plannedLitterName })
      });
      
      onClose();
    } catch (error) {
      console.error("Error creating litter from planned litter:", error);
      
      let errorMessage = "Failed to create litter from planned litter";
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      }
      
      toast({
        title: t('dialog.toasts.error.title'),
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show empty state if no planned litters
  if (!plannedLitters || plannedLitters.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-lg font-medium mb-2">{t('dialog.plannedLitterForm.empty.title')}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {t('dialog.plannedLitterForm.empty.description')}
        </p>
        <DialogFooter className="mt-6 justify-center">
          <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
            {t('dialog.buttons.close')}
          </Button>
        </DialogFooter>
      </div>
    );
  }

  console.log("Rendering PlannedLitterForm with", plannedLitters.length, "planned litters");

  return (
    <>
      <PlannedLitterForm 
        plannedLitters={plannedLitters}
        litterName={plannedLitterName}
        setLitterName={setPlannedLitterName}
        selectedPlannedLitterId={selectedPlannedLitterId}
        setSelectedPlannedLitterId={setSelectedPlannedLitterId}
        dateOfBirth={plannedDateOfBirth}
        setDateOfBirth={setPlannedDateOfBirth}
        isExternalSire={isExternalSire}
        setIsExternalSire={setIsExternalSire}
        externalSireName={externalSireName}
        setExternalSireName={setExternalSireName}
        externalSireBreed={externalSireBreed}
        setExternalSireBreed={setExternalSireBreed}
        externalSireRegistration={externalSireRegistration}
        setExternalSireRegistration={setExternalSireRegistration}
        onSubmit={handlePlannedLitterSubmit}
      />
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
          {t('dialog.buttons.cancel')}
        </Button>
        <Button 
          type="button" 
          onClick={handlePlannedLitterSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('dialog.buttons.creating')}
            </>
          ) : (
            t('dialog.buttons.createFromPlanned')
          )}
        </Button>
      </DialogFooter>
    </>
  );
};

export default PlannedLitterTabContent;
