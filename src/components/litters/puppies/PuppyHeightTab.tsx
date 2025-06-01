
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface PuppyHeightTabProps {
  puppy: Puppy;
  height: string;
  setHeight: (value: string) => void;
  selectedDate: Date;
  selectedTime: string;
  onAddHeight: () => void;
  onDeleteHeight: (index: number) => void;
}

const PuppyHeightTab: React.FC<PuppyHeightTabProps> = ({
  puppy,
  height,
  setHeight,
  selectedDate,
  selectedTime,
  onAddHeight,
  onDeleteHeight
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHeightIndex, setSelectedHeightIndex] = useState<number | null>(null);

  const handleDeleteClick = (index: number) => {
    setSelectedHeightIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedHeightIndex !== null) {
      onDeleteHeight(selectedHeightIndex);
      toast({
        title: "Height Record Deleted",
        description: "The height measurement has been removed."
      });
    }
    setDeleteDialogOpen(false);
    setSelectedHeightIndex(null);
  };

  const heightLogEntries = puppy.heightLog ? [...puppy.heightLog] : [];
  const selectedHeightEntry = selectedHeightIndex !== null ? heightLogEntries
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[selectedHeightIndex] : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="height">Height (cm)</Label>
        <div className="flex space-x-2">
          <Input
            id="height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            type="number"
            step="0.1"
            placeholder="Enter height"
            className="flex-1"
          />
          <Button onClick={onAddHeight}>Add</Button>
        </div>
      </div>
      
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Recent Height Records</h3>
        {heightLogEntries.length > 0 ? (
          <div className="max-h-40 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Height (cm)</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {heightLogEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log, index) => (
                    <TableRow key={index}>
                      <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                      <TableCell>{log.height}</TableCell>
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
            No height records yet
          </div>
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Height Measurement"
        description="Are you sure you want to delete this height measurement? This action cannot be undone."
        itemDetails={selectedHeightEntry ? `${selectedHeightEntry.height} cm recorded on ${format(new Date(selectedHeightEntry.date), "PPP p")}` : undefined}
      />
    </div>
  );
};

export default PuppyHeightTab;
