
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Litter, Puppy } from '@/types/breeding';
import { useAuth } from '@/context/AuthContext';

export const usePuppyData = () => {
  const { user } = useAuth();
  
  // Sample data - in a real app, this would come from an API or context
  const initialLitters: Litter[] = [
    {
      id: '1',
      name: 'Spring Litter 2025',
      dateOfBirth: '2025-04-15',
      sireId: '1',
      damId: '2',
      sireName: 'Max',
      damName: 'Bella',
      user_id: user?.id || '', // Add user_id field with fallback
      puppies: [
        {
          id: '1',
          name: 'Puppy 1',
          gender: 'male',
          color: 'Golden',
          birthWeight: 0.45,
          birthDateTime: '2025-04-15T08:30:00',
          weightLog: [
            { date: '2025-04-15', weight: 0.45 },
            { date: '2025-04-16', weight: 0.48 },
            { date: '2025-04-17', weight: 0.52 },
          ],
          heightLog: [] // Add empty heightLog array
        },
        {
          id: '2',
          name: 'Puppy 2',
          gender: 'female',
          color: 'Light Golden',
          birthWeight: 0.42,
          birthDateTime: '2025-04-15T09:15:00',
          weightLog: [
            { date: '2025-04-15', weight: 0.42 },
            { date: '2025-04-16', weight: 0.46 },
            { date: '2025-04-17', weight: 0.49 },
          ],
          heightLog: [] // Add empty heightLog array
        }
      ]
    }
  ];

  const [litters, setLitters] = useState<Litter[]>(initialLitters);
  const [selectedLitterId, setSelectedLitterId] = useState<string | null>(
    litters.length > 0 ? litters[0].id : null
  );
  
  const selectedLitter = litters.find(litter => litter.id === selectedLitterId);
  
  const handleAddLitterClick = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Adding new litters will be available in the next update."
    });
  };
  
  const handleAddWeightLog = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Logging puppy weights will be available in the next update."
    });
  };

  return {
    litters,
    selectedLitterId,
    setSelectedLitterId,
    selectedLitter,
    handleAddLitterClick,
    handleAddWeightLog
  };
};
