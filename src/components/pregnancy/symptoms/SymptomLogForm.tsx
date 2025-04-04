
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SymptomRecord } from './types';

interface SymptomLogFormProps {
  onAddSymptom: (record: Omit<SymptomRecord, 'id'>) => void;
}

const SymptomLogForm: React.FC<SymptomLogFormProps> = ({ onAddSymptom }) => {
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = () => {
    if (!title) {
      toast({
        title: "Title required",
        description: "Please enter a title for the observation.",
        variant: "destructive"
      });
      return;
    }
    
    if (!description) {
      toast({
        title: "Description required",
        description: "Please enter a description of what you observed.",
        variant: "destructive"
      });
      return;
    }
    
    onAddSymptom({
      date,
      title: title.trim(),
      description: description.trim()
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate(new Date());
  };

  return (
    <div className="grid gap-4 py-4 border rounded-lg p-4 bg-slate-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Nesting behavior, Appetite change"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Detailed description of the observation..."
          rows={3}
        />
      </div>
      
      <Button 
        onClick={handleSubmit} 
        className="w-full md:w-auto justify-center"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Observation
      </Button>
    </div>
  );
};

export default SymptomLogForm;
