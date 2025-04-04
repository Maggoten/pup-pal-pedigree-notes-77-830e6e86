
import React, { useState } from 'react';
import { Puppy } from '@/types/breeding';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

interface PuppyGrowthLoggerProps {
  puppy: Puppy;
  onUpdatePuppy: (updatedPuppy: Puppy) => void;
}

const PuppyGrowthLogger: React.FC<PuppyGrowthLoggerProps> = ({ puppy, onUpdatePuppy }) => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [logType, setLogType] = useState<'weight' | 'height'>('weight');

  const handleAddLog = () => {
    if (logType === 'weight' && (!weight || isNaN(parseFloat(weight)))) {
      toast({
        title: "Invalid Weight",
        description: "Please enter a valid weight",
        variant: "destructive"
      });
      return;
    }

    if (logType === 'height' && (!height || isNaN(parseFloat(height)))) {
      toast({
        title: "Invalid Height",
        description: "Please enter a valid height",
        variant: "destructive"
      });
      return;
    }

    const now = new Date();
    const updatedPuppy = { ...puppy };

    if (logType === 'weight') {
      updatedPuppy.weightLog = [
        ...puppy.weightLog,
        { date: now.toISOString(), weight: parseFloat(weight) }
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setWeight('');
    } else {
      updatedPuppy.heightLog = [
        ...puppy.heightLog,
        { date: now.toISOString(), height: parseFloat(height) }
      ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setHeight('');
    }

    onUpdatePuppy(updatedPuppy);
    
    toast({
      title: `${logType === 'weight' ? 'Weight' : 'Height'} Recorded`,
      description: `${puppy.name}'s ${logType} has been recorded successfully.`
    });
  };

  const getLogData = () => {
    return logType === 'weight' ? puppy.weightLog : puppy.heightLog;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPP p'); // Format with date and time
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={logType === 'weight' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLogType('weight')}
          >
            Weight
          </Button>
          <Button 
            variant={logType === 'height' ? 'default' : 'outline'}
            size="sm" 
            onClick={() => setLogType('height')}
          >
            Height
          </Button>
        </div>
      </div>

      <div className="flex space-x-2 items-end">
        {logType === 'weight' ? (
          <>
            <div className="space-y-2 flex-1">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                type="number"
                step="0.01"
                placeholder="Enter weight"
              />
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2 flex-1">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                type="number"
                step="0.1"
                placeholder="Enter height"
              />
            </div>
          </>
        )}
        <Button onClick={handleAddLog}>Add Log</Button>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">
          {logType === 'weight' ? 'Weight History' : 'Height History'}
        </h3>
        
        {getLogData().length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>{logType === 'weight' ? 'Weight (kg)' : 'Height (cm)'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {getLogData().slice().reverse().map((log, index) => (
                  <TableRow key={index}>
                    <TableCell>{formatDate(log.date)}</TableCell>
                    <TableCell>
                      {logType === 'weight' 
                        ? (log as {date: string; weight: number}).weight 
                        : (log as {date: string; height: number}).height}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4 border rounded-md text-muted-foreground">
            No {logType} logs recorded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default PuppyGrowthLogger;
