
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Puppy } from '@/types/breeding';
import { format } from 'date-fns';

interface PuppyHeightTabProps {
  puppy: Puppy;
  height: string;
  setHeight: (value: string) => void;
  selectedDate: Date;
  selectedTime: string;
  onAddHeight: () => void;
}

const PuppyHeightTab: React.FC<PuppyHeightTabProps> = ({
  puppy,
  height,
  setHeight,
  selectedDate,
  selectedTime,
  onAddHeight
}) => {
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
        {puppy.heightLog.length > 0 ? (
          <div className="max-h-40 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Height (cm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {puppy.heightLog.slice().reverse().slice(0, 5).map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{format(new Date(log.date), "PPP p")}</TableCell>
                    <TableCell>{log.height}</TableCell>
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
    </div>
  );
};

export default PuppyHeightTab;
