
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { Plus } from 'lucide-react';
import { SymptomRecord } from './types';
import DatePicker from '@/components/common/DatePicker';

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
    <div className="grid gap-4 py-4 border rounded-lg p-4 bg-greige-50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <DatePicker 
            date={date} 
            setDate={setDate} 
            label="" 
          />
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
        className="w-full md:w-auto justify-center bg-sage-600 hover:bg-sage-700 text-white"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Observation
      </Button>
    </div>
  );
};

export default SymptomLogForm;
