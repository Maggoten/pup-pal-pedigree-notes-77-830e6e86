
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { useDogs } from '@/context/DogsContext';
import { useToast } from '@/hooks/use-toast';
import { Litter } from '@/types/breeding';
import NewLitterForm from './NewLitterForm';
import { useAuth } from '@/context/AuthContext';

interface NewLitterTabContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
}

const NewLitterTabContent: React.FC<NewLitterTabContentProps> = ({ onClose, onLitterAdded }) => {
  const { dogs } = useDogs();
  const { toast } = useToast();
  const { user } = useAuth();
  
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
    
    // Validation checks
    if (!litterName) {
      toast({
        title: "Missing Information",
        description: "Please enter a litter name",
        variant: "destructive"
      });
      return;
    }
    
    if (!isExternalSire && !sireId) {
      toast({
        title: "Missing Information",
        description: "Please select a sire or enable external sire",
        variant: "destructive"
      });
      return;
    }
    
    if (isExternalSire && !externalSireName) {
      toast({
        title: "Missing Information",
        description: "Please enter the external sire's name",
        variant: "destructive"
      });
      return;
    }
    
    if (!damId) {
      toast({
        title: "Missing Information",
        description: "Please select a dam",
        variant: "destructive"
      });
      return;
    }

    const actualSireId = isExternalSire ? `external-${Date.now()}` : sireId;
    const actualSireName = isExternalSire ? externalSireName : sireName;
    
    try {
      const newLitterId = Date.now().toString();
      const newLitter: Litter = {
        id: newLitterId,
        name: litterName,
        dateOfBirth: dateOfBirth.toISOString().split('T')[0],
        sireId: actualSireId,
        damId,
        sireName: actualSireName,
        damName,
        puppies: [],
        user_id: user?.id || '' // Add user_id field with fallback
      };

      console.log("Creating new litter with data:", newLitter);
      
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
      console.error("Error creating litter:", error);
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
      
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} className="border-greige-300">
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
