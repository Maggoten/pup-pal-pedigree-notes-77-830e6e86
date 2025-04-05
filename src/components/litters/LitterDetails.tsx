
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Edit, Grid2X2, Calendar, Users } from 'lucide-react';
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

  // Calculate litter age in weeks
  const birthDate = new Date(litter.dateOfBirth);
  const ageInWeeks = Math.floor((new Date().getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
  const isRecent = ageInWeeks < 12;

  return (
    <Card className="shadow-md hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-2">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CardTitle>{litter.name}</CardTitle>
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
            {isRecent && <Badge variant="success">Active</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(litter.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <span>•</span>
            <span>Sire: {litter.sireName}</span>
            <span>•</span>
            <span>Dam: {litter.damName}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              <Users className="h-4 w-4 text-primary" />
              Puppy Count
            </h3>
            <div className="flex gap-3">
              <div className="bg-muted rounded-md p-2 text-center flex-1">
                <div className="text-xl font-bold">{litter.puppies.length}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="bg-muted rounded-md p-2 text-center flex-1">
                <div className="text-xl font-bold">
                  {litter.puppies.filter(p => p.gender === 'male').length}
                </div>
                <div className="text-xs text-muted-foreground">Males</div>
              </div>
              <div className="bg-muted rounded-md p-2 text-center flex-1">
                <div className="text-xl font-bold">
                  {litter.puppies.filter(p => p.gender === 'female').length}
                </div>
                <div className="text-xs text-muted-foreground">Females</div>
              </div>
            </div>
          </div>
          
          {litter.puppies.length > 0 && (
            <div className="pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="text-sm font-medium mr-1 flex items-center gap-1">
                  <Grid2X2 className="h-3.5 w-3.5 text-primary" />
                  <span>Breed:</span>
                </h3>
                <span className="text-sm">{getBreeds()}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {[...new Set(litter.puppies.map(p => p.color))].map(color => (
                  <Badge key={color} variant="outline" className="text-xs">
                    {color}
                  </Badge>
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
