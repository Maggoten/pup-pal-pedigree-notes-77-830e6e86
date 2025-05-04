
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import DatePicker from '@/components/common/DatePicker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { addDays } from 'date-fns';
import { createPregnancy } from '@/services/PregnancyService';

interface AddPregnancyDialogProps {
  onClose: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddPregnancyDialog: React.FC<AddPregnancyDialogProps> = ({ 
  onClose, 
  open,
  onOpenChange
}) => {
  const { dogs } = useDogs();
  const [loading, setLoading] = useState(false);
  const [femaleDogId, setFemaleDogId] = useState<string>('');
  const [matingDate, setMatingDate] = useState<Date>(new Date());
  const [useExternalMale, setUseExternalMale] = useState(false);
  const [maleDogId, setMaleDogId] = useState<string>('');
  const [externalMaleName, setExternalMaleName] = useState('');
  
  // Get dogs by gender
  const femaleDogs = dogs.filter(dog => dog.gender === 'female');
  const maleDogs = dogs.filter(dog => dog.gender === 'male');
  
  // Calculate expected due date (63 days from mating)
  const expectedDueDate = addDays(matingDate, 63);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!femaleDogId) {
      toast({
        title: "Missing information",
        description: "Please select a female dog",
        variant: "destructive"
      });
      return;
    }
    
    if (!useExternalMale && !maleDogId) {
      toast({
        title: "Missing information",
        description: "Please select a male dog",
        variant: "destructive"
      });
      return;
    }
    
    if (useExternalMale && !externalMaleName) {
      toast({
        title: "Missing information",
        description: "Please enter a name for the external male",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      await createPregnancy({
        femaleDogId,
        maleDogId: useExternalMale ? null : maleDogId,
        externalMaleName: useExternalMale ? externalMaleName : null,
        matingDate,
        expectedDueDate
      });
      
      toast({
        title: "Pregnancy added",
        description: "The pregnancy has been successfully added",
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding pregnancy:', error);
      toast({
        title: "Error",
        description: "There was a problem adding the pregnancy",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Pregnancy</DialogTitle>
            <DialogDescription>
              Create a new pregnancy record for a dog that has already been mated.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Female Dog Selection */}
            <div className="grid gap-2">
              <Label htmlFor="female-dog">Female Dog (Dam)</Label>
              <Select value={femaleDogId} onValueChange={setFemaleDogId}>
                <SelectTrigger id="female-dog" className="bg-white">
                  <SelectValue placeholder="Select female dog" />
                </SelectTrigger>
                <SelectContent>
                  {femaleDogs.length > 0 ? (
                    femaleDogs.map(dog => (
                      <SelectItem key={dog.id} value={dog.id}>
                        {dog.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-dogs" disabled>
                      No female dogs found
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {/* External Male Toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="external-male" 
                checked={useExternalMale} 
                onCheckedChange={setUseExternalMale} 
              />
              <Label htmlFor="external-male">External Male Dog</Label>
            </div>
            
            {/* Male Dog Selection (if not external) */}
            {!useExternalMale && (
              <div className="grid gap-2">
                <Label htmlFor="male-dog">Male Dog (Sire)</Label>
                <Select value={maleDogId} onValueChange={setMaleDogId}>
                  <SelectTrigger id="male-dog" className="bg-white">
                    <SelectValue placeholder="Select male dog" />
                  </SelectTrigger>
                  <SelectContent>
                    {maleDogs.length > 0 ? (
                      maleDogs.map(dog => (
                        <SelectItem key={dog.id} value={dog.id}>
                          {dog.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-dogs" disabled>
                        No male dogs found
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {/* External Male Name (if external) */}
            {useExternalMale && (
              <div className="grid gap-2">
                <Label htmlFor="external-male-name">External Male Name</Label>
                <Input 
                  id="external-male-name" 
                  value={externalMaleName} 
                  onChange={(e) => setExternalMaleName(e.target.value)} 
                  placeholder="Enter external male name"
                  className="bg-white"
                />
              </div>
            )}
            
            {/* Mating Date */}
            <div className="grid gap-2">
              <Label>Mating Date</Label>
              <DatePicker date={matingDate} setDate={setMatingDate} />
            </div>
            
            {/* Expected Due Date (Read-only) */}
            <div className="grid gap-2">
              <Label>Expected Due Date (63 days from mating)</Label>
              <div className="p-2 border rounded-md bg-muted/20">
                {expectedDueDate.toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Pregnancy"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddPregnancyDialog;
