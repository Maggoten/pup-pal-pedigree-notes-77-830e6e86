
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
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
    
    const breeds = [...new Set(litter.puppies
      .filter(puppy => puppy.breed)
      .map(puppy => puppy.breed))];
    
    if (breeds.length === 0) return 'Unknown';
    return breeds.join(', ');
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div>
          <div className="flex items-center gap-1">
            <CardTitle>Litter Details</CardTitle>
            <Dialog open={showEditLitterDialog} onOpenChange={setShowEditLitterDialog}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 ml-1">
                  <Edit className="h-3.5 w-3.5" />
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
          <CardDescription>
            Born: {new Date(litter.dateOfBirth).toLocaleDateString()} | 
            Sire: {litter.sireName} | 
            Dam: {litter.damName}
          </CardDescription>
        </div>
        {litter.puppies.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Grid2X2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Breed: {getBreeds()}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Puppy Count</h3>
            <div className="flex gap-4">
              <div className="bg-muted rounded-md p-3 text-center flex-1">
                <div className="text-2xl font-bold">{litter.puppies.length}</div>
                <div className="text-xs text-muted-foreground">Total Puppies</div>
              </div>
              <div className="bg-muted rounded-md p-3 text-center flex-1">
                <div className="text-2xl font-bold">
                  {litter.puppies.filter(p => p.gender === 'male').length}
                </div>
                <div className="text-xs text-muted-foreground">Males</div>
              </div>
              <div className="bg-muted rounded-md p-3 text-center flex-1">
                <div className="text-2xl font-bold">
                  {litter.puppies.filter(p => p.gender === 'female').length}
                </div>
                <div className="text-xs text-muted-foreground">Females</div>
              </div>
            </div>
          </div>
          
          {litter.puppies.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Colors</h3>
              <div className="flex flex-wrap gap-2">
                {[...new Set(litter.puppies.map(p => p.color))].map(color => (
                  <span key={color} className="bg-muted text-xs px-2 py-1 rounded-full">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LitterDetails;
