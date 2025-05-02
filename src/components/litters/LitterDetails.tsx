import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Grid2X2 } from 'lucide-react';
import { Litter, Puppy } from '@/types/breeding';
import LitterEditDialog from './LitterEditDialog';
interface LitterDetailsProps {
  litter: Litter;
  onAddPuppy: (puppy: Puppy) => void;
  onUpdatePuppy: (puppy: Puppy) => void;
  onDeletePuppy: (puppyId: string) => void;
  onUpdateLitter: (litter: Litter) => void;
  onDeleteLitter: (litterId: string) => void;
  onArchiveLitter: (litterId: string, archive: boolean) => void;
}
const LitterDetails: React.FC<LitterDetailsProps> = ({
  litter,
  onAddPuppy,
  onUpdatePuppy,
  onDeletePuppy,
  onUpdateLitter,
  onDeleteLitter,
  onArchiveLitter
}) => {
  const [showEditLitterDialog, setShowEditLitterDialog] = useState(false);
  const getBreeds = () => {
    if (!litter.puppies || litter.puppies.length === 0) return 'Unknown';
    const breeds = [...new Set(litter.puppies.filter(puppy => puppy.breed).map(puppy => puppy.breed))];
    if (breeds.length === 0) return 'Unknown';
    return breeds.join(', ');
  };
  return;
};
export default LitterDetails;