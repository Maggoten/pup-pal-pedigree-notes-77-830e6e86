
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useDogs } from '@/context/DogsContext';
import { useToast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import NewLitterForm from './NewLitterForm';

interface NewLitterTabContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
}

const NewLitterTabContent: React.FC<NewLitterTabContentProps> = ({ onClose, onLitterAdded }) => {
  const { dogs } = useDogs();
  const { toast } = useToast();
  
  // New litter form state
  const [sireName, setSireName] = useState('');
  const [sireId, setSireId] = useState('');
  const [damName, setDamName] = useState('');
  const [damId, setDamId] = useState('');
  const [litterName, setLitterName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(new Date());
  
  // External sire state
  const [isExternalSire, setIsExternalSire] = useState(false);
  const [externalSireName, setExternalSireName] = useState('');
  const [externalSireBreed, setExternalSireBreed] = useState('');
  const [externalSireRegistration, setExternalSireRegistration] = useState('');

  const handleNewLitterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!litterName || (!sireId && !isExternalSire) || !damId) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newLitterId = Date.now().toString();
      const newLitter: Litter = {
        id: newLitterId,
        name: litterName,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        sireId: isExternalSire ? `external-${Date.now()}` : sireId,
        damId,
        sireName: isExternalSire ? externalSireName : sireName,
        damName,
        puppies: []
      };
      
      if (isExternalSire) {
        (newLitter as any).externalSire = true;
        (newLitter as any).externalSireBreed = externalSireBreed;
        (newLitter as any).externalSireRegistration = externalSireRegistration;
      }
      
      onLitterAdded(newLitter);
      onClose();
      
      toast({
        title: "Success",
        description: `Litter "${litterName}" has been created`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create litter",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <NewLitterForm 
        dogs={dogs}
        sireName={sireName}
        setSireName={setSireName}
        sireId={sireId}
        setSireId={setSireId}
        damName={damName}
        setDamName={setDamName}
        damId={damId}
        setDamId={setDamId}
        litterName={litterName}
        setLitterName={setLitterName}
        dateOfBirth={dateOfBirth}
        setDateOfBirth={setDateOfBirth}
        isExternalSire={isExternalSire}
        setIsExternalSire={setIsExternalSire}
        externalSireName={externalSireName}
        setExternalSireName={setExternalSireName}
        externalSireBreed={externalSireBreed}
        setExternalSireBreed={setExternalSireBreed}
        externalSireRegistration={externalSireRegistration}
        setExternalSireRegistration={setExternalSireRegistration}
      />
      
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" onClick={handleNewLitterSubmit}>
          Create Litter
        </Button>
      </DialogFooter>
    </>
  );
};

export default NewLitterTabContent;
