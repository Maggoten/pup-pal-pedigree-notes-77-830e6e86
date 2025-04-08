
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Calendar, PawPrint, Trash } from 'lucide-react';
import { Reminder, useBreedingReminders } from '@/hooks/useBreedingReminders';
import RemindersList from './RemindersList';
import DatePicker from '@/components/common/DatePicker';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/components/ui/use-toast';

interface RemindersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const RemindersDialog: React.FC<RemindersDialogProps> = ({ open, onOpenChange }) => {
  const { reminders, handleMarkComplete, addCustomReminder, deleteReminder } = useBreedingReminders();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date>(new Date());
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  
  const highPriorityReminders = reminders.filter(r => r.priority === 'high');
  const mediumPriorityReminders = reminders.filter(r => r.priority === 'medium');
  const lowPriorityReminders = reminders.filter(r => r.priority === 'low');
  
  const handleAddReminder = () => {
    if (!title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reminder title",
        variant: "destructive"
      });
      return;
    }
    
    addCustomReminder({
      title,
      description,
      dueDate,
      priority
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-primary" />
            Breeding Reminders
          </DialogTitle>
          <DialogDescription>
            Manage your breeding program tasks and reminders
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left side - Add new reminder */}
          <div className="space-y-4">
            <div className="font-medium text-sm flex items-center gap-2 text-primary">
              Add New Reminder
            </div>
            
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
          </div>
          
          {/* Right side - Tabs with reminders lists */}
          <div className="md:col-span-2">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high" className="text-rose-600">High Priority</TabsTrigger>
                <TabsTrigger value="medium" className="text-amber-600">Medium</TabsTrigger>
                <TabsTrigger value="low" className="text-green-600">Low</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                <RemindersList 
                  reminders={reminders} 
                  onComplete={handleMarkComplete}
                  onDelete={deleteReminder}
                  showDelete={true}
                />
              </TabsContent>
              
              <TabsContent value="high" className="space-y-4">
                <RemindersList 
                  reminders={highPriorityReminders} 
                  onComplete={handleMarkComplete}
                  onDelete={deleteReminder}
                  showDelete={true}
                />
              </TabsContent>
              
              <TabsContent value="medium" className="space-y-4">
                <RemindersList 
                  reminders={mediumPriorityReminders} 
                  onComplete={handleMarkComplete}
                  onDelete={deleteReminder}
                  showDelete={true}
                />
              </TabsContent>
              
              <TabsContent value="low" className="space-y-4">
                <RemindersList 
                  reminders={lowPriorityReminders} 
                  onComplete={handleMarkComplete}
                  onDelete={deleteReminder}
                  showDelete={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RemindersDialog;
