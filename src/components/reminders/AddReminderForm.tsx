
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from '@/components/common/DatePicker';
import { toast } from '@/components/ui/use-toast';
import { CustomReminderInput } from '@/types/reminders';

interface AddReminderFormProps {
  onSubmit: (values: CustomReminderInput) => void;
}

const AddReminderForm: React.FC<AddReminderFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const handleAddReminder = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reminder title",
        variant: "destructive"
      });
      return;
    }
    
    onSubmit({
      title,
      description,
      priority,
      dueDate, // For UI components
      due_date: dueDate // For API compatibility
    });
    
    // Reset form
    setTitle('');
    setDescription('');
    setDueDate(new Date());
    setPriority('medium');
    
    toast({
      title: "Reminder Added",
      description: "Your reminder has been added successfully."
    });
  };
  
  return (
    <div className="space-y-4 border p-4 rounded-md">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Reminder title" 
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Details about this reminder" 
        />
      </div>
      
      <div className="space-y-2">
        <Label>Due Date</Label>
        <DatePicker date={dueDate} setDate={setDueDate} />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select 
          value={priority} 
          onValueChange={(value) => setPriority(value as 'high' | 'medium' | 'low')}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        onClick={handleAddReminder} 
        className="w-full"
      >
        Add Reminder
      </Button>
    </div>
  );
};

export default AddReminderForm;
