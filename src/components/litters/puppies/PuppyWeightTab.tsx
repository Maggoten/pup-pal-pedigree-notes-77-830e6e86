
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface PuppyWeightTabProps {
  puppy: Puppy;
  weight: string;
  setWeight: (value: string) => void;
  selectedDate: Date;
  selectedTime: string;
  onAddWeight: () => void;
  onDeleteWeight: (index: number) => void;
}

const PuppyWeightTab: React.FC<PuppyWeightTabProps> = ({
  puppy,
  weight,
  setWeight,
  selectedDate,
  selectedTime,
  onAddWeight,
  onDeleteWeight
}) => {
  const { t } = useTranslation('litters');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number | null>(null);

  console.log(`PuppyWeightTab: Rendering for ${puppy.name} (${puppy.id})`, {
    puppyId: puppy.id,
    currentWeight: puppy.currentWeight,
    weightLogLength: puppy.weightLog?.length || 0
  });
  
  const weightLogEntries = puppy.weightLog ? [...puppy.weightLog] : [];
  
  console.log(`PuppyWeightTab: Weight log entries for ${puppy.name} (${puppy.id})`, 
    weightLogEntries.map(entry => ({ date: entry.date, weight: entry.weight }))
  );

  const handleDeleteClick = (index: number) => {
    setSelectedWeightIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedWeightIndex !== null) {
      onDeleteWeight(selectedWeightIndex);
      toast({
        title: "Weight Record Deleted",
        description: "The weight measurement has been removed."
      });
    }
    setDeleteDialogOpen(false);
    setSelectedWeightIndex(null);
  };

  const selectedWeightEntry = selectedWeightIndex !== null ? weightLogEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[selectedWeightIndex] : null;
  
  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="weight">{t('puppies.labels.weightKg')}</Label>
        <div className="flex space-x-2">
          <Input
            id="weight"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            type="number"
            step="0.01"
            placeholder="Enter weight"
            className="flex-1"
          />
          <Button onClick={onAddWeight}>Add</Button>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">{t('puppies.titles.recentWeightRecords')}</h3>
        {weightLogEntries.length > 0 ? (
          <div className="max-h-40 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weightLogEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log, index) => (
                    <TableRow key={`${puppy.id}-weight-${log.date}-${log.weight}-${index}`}>
                      <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                      <TableCell>{log.weight}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(index)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md text-muted-foreground">
            No weight records yet
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Weight Measurement"
        description="Are you sure you want to delete this weight measurement? This action cannot be undone."
        itemDetails={selectedWeightEntry ? `${selectedWeightEntry.weight} kg recorded on ${format(new Date(selectedWeightEntry.date), "PPP p")}` : undefined}
      />
    </div>
  );
};

export default PuppyWeightTab;
