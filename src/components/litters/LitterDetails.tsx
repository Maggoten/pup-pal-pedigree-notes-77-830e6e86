
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
  
  return (
    <Card className="shadow-sm bg-white">
      <CardHeader className="bg-primary/5 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold flex items-center gap-2">
              {litter.name}
              {litter.archived && (
                <Badge variant="outline" className="ml-2 text-xs font-normal">Archived</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              Born: {new Date(litter.dateOfBirth).toLocaleDateString()}
            </CardDescription>
          </div>
          
          <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            
            <LitterEditDialog
              litter={litter}
              onClose={() => setShowEditLitterDialog(false)}
              onUpdate={onUpdateLitter}
              onDelete={onDeleteLitter}
              onArchive={onArchiveLitter}
            />
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Sire</h3>
            <p className="mt-1">{litter.sireName || 'Unknown'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Dam</h3>
            <p className="mt-1">{litter.damName || 'Unknown'}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Breed</h3>
            <p className="mt-1">{getBreeds()}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Puppies</h3>
            <p className="mt-1">{litter.puppies?.length || 0}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LitterDetails;
