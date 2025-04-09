
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Litter, PlannedLitter } from '@/types/breeding';
import PlannedLitterForm from './PlannedLitterForm';

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
  
  // Planned litter form state
  const [selectedPlannedLitterId, setSelectedPlannedLitterId] = useState('');
  const [plannedLitterName, setPlannedLitterName] = useState('');
  const [plannedDateOfBirth, setPlannedDateOfBirth] = useState<Date>(new Date());
  
  // External sire state (needed for planned litters that might have external males)
  const [isExternalSire, setIsExternalSire] = useState(false);
  const [externalSireName, setExternalSireName] = useState('');
  const [externalSireBreed, setExternalSireBreed] = useState('');
  const [externalSireRegistration, setExternalSireRegistration] = useState('');

  const handlePlannedLitterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlannedLitterId || !plannedLitterName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const selectedLitter = plannedLitters.find(
        litter => litter.id === selectedPlannedLitterId
      );
      
      if (!selectedLitter) {
        throw new Error("Selected litter not found");
      }
      
      const newLitterId = Date.now().toString();
      const newLitter: Litter = {
        id: newLitterId,
        name: plannedLitterName,
        dateOfBirth: plannedDateOfBirth.toISOString().split('T')[0],
        sireId: selectedLitter.externalMale ? `external-${selectedLitter.id}` : selectedLitter.maleId,
        damId: selectedLitter.femaleId,
        sireName: selectedLitter.maleName,
        damName: selectedLitter.femaleName,
        puppies: []
      };
      
      if (selectedLitter.externalMale) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = selectedLitter.externalMaleBreed;
        (newLitter as any).externalSireRegistration = selectedLitter.externalMaleRegistration;
      }
      
      onLitterAdded(newLitter);
      onClose();
      
      toast({
        title: "Success",
        description: `Litter "${plannedLitterName}" has been created from planned litter`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create litter from planned litter",
        variant: "destructive"
      });
    }
  };

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
          Cancel
        </Button>
        <Button type="button" onClick={handlePlannedLitterSubmit} className="bg-sage-500 hover:bg-sage-600 text-white">
          Create From Planned Litter
        </Button>
      </DialogFooter>
    </>
  );
};

export default PlannedLitterTabContent;
