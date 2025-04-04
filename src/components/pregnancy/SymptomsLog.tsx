
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { MessageSquare, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SymptomsLogProps {
  pregnancyId: string;
  femaleName: string;
}

interface SymptomRecord {
  id: string;
  date: Date;
  title: string;
  description: string;
}

const SymptomsLog: React.FC<SymptomsLogProps> = ({ pregnancyId, femaleName }) => {
  const [symptoms, setSymptoms] = useState<SymptomRecord[]>([]);
  const [date, setDate] = useState<Date>(new Date());
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  
  useEffect(() => {
    // Load symptoms from localStorage
    const loadSymptoms = () => {
      const storedSymptoms = localStorage.getItem(`symptoms_${pregnancyId}`);
      if (storedSymptoms) {
        const parsedSymptoms = JSON.parse(storedSymptoms);
        // Convert string dates to Date objects
        const processedSymptoms = parsedSymptoms.map((symptom: any) => ({
          ...symptom,
          date: new Date(symptom.date)
        }));
        setSymptoms(processedSymptoms);
      }
    };
    
    loadSymptoms();
  }, [pregnancyId]);
  
  const saveSymptoms = (updatedSymptoms: SymptomRecord[]) => {
    localStorage.setItem(`symptoms_${pregnancyId}`, JSON.stringify(updatedSymptoms));
    setSymptoms(updatedSymptoms);
  };
  
  const handleAddSymptom = () => {
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
    
    const newRecord: SymptomRecord = {
      id: Date.now().toString(),
      date: date,
      title: title.trim(),
      description: description.trim()
    };
    
    const updatedSymptoms = [...symptoms, newRecord];
    // Sort by date, newest first
    updatedSymptoms.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    saveSymptoms(updatedSymptoms);
    
    // Reset form
    setTitle('');
    setDescription('');
    setDate(new Date());
    
    toast({
      title: "Observation recorded",
      description: `"${title}" has been added to ${femaleName}'s pregnancy log.`
    });
  };
  
  const handleDeleteSymptom = (id: string) => {
    const updatedSymptoms = symptoms.filter(symptom => symptom.id !== id);
    saveSymptoms(updatedSymptoms);
    
    toast({
      title: "Record deleted",
      description: "The observation has been deleted from the log."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes & Symptoms</CardTitle>
        <CardDescription>Record observations during {femaleName}'s pregnancy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
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
              onClick={handleAddSymptom} 
              className="w-full md:w-auto justify-center"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Observation
            </Button>
          </div>
          
          {symptoms.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">Observation History</h3>
              <div className="space-y-3">
                {symptoms.map((record) => (
                  <div key={record.id} className="rounded-lg border p-4 bg-white">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <MessageSquare className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-medium">{record.title}</span>
                            <span className="text-sm text-muted-foreground">
                              {format(record.date, 'PPP')}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            {record.description}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSymptom(record.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Observations</h3>
              <p className="text-muted-foreground mb-4">
                Start recording observations to track {femaleName}'s pregnancy
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SymptomsLog;
