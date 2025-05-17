
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';

interface PuppyWeightTabProps {
  puppy: Puppy;
  weight: string;
  setWeight: (value: string) => void;
  selectedDate: Date;
  selectedTime: string;
  onAddWeight: () => void;
}

const PuppyWeightTab: React.FC<PuppyWeightTabProps> = ({
  puppy,
  weight,
  setWeight,
  selectedDate,
  selectedTime,
  onAddWeight
}) => {
  // Add more detailed console logs to better understand what's happening
  console.log(`PuppyWeightTab: Rendering for ${puppy.name} (${puppy.id})`, {
    puppyId: puppy.id,
    currentWeight: puppy.currentWeight,
    weightLogLength: puppy.weightLog?.length || 0
  });
  
  // Ensure we're using the correct weight log entries for this specific puppy
  // Make a safe copy of weight logs to avoid reference issues
  const weightLogEntries = puppy.weightLog ? [...puppy.weightLog] : [];
  
  // Log the actual entries we're showing
  console.log(`PuppyWeightTab: Weight log entries for ${puppy.name} (${puppy.id})`, 
    weightLogEntries.map(entry => ({ date: entry.date, weight: entry.weight }))
  );
  
  return (
    <div className="space-y-4">
      <div className="grid gap-1.5">
        <Label htmlFor="weight">Weight (kg)</Label>
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
        <h3 className="text-sm font-medium mb-2">Recent Weight Records</h3>
        {weightLogEntries.length > 0 ? (
          <div className="max-h-40 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Weight (kg)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {weightLogEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log, index) => (
                    <TableRow key={`${puppy.id}-weight-${index}-${log.date}`}>
                      <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                      <TableCell>{log.weight}</TableCell>
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
    </div>
  );
};

export default PuppyWeightTab;
