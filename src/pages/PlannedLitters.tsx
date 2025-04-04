
import React, { useState } from 'react';
import PageLayout from '@/components/PageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Calendar, Dog } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DogsProvider, useDogs } from '@/context/DogsContext';

interface PlannedLitter {
  id: string;
  maleId: string;
  femaleId: string;
  maleName: string;
  femaleName: string;
  expectedHeatDate: string;
  matingDates?: string[];
  notes: string;
}

// Sample data
const samplePlannedLitters: PlannedLitter[] = [
  {
    id: '1',
    maleId: '3',
    femaleId: '2',
    maleName: 'Rocky',
    femaleName: 'Bella',
    expectedHeatDate: '2025-05-15',
    notes: 'First planned breeding, watching for genetic diversity'
  }
];

const formSchema = z.object({
  maleId: z.string({ required_error: "Sire is required" }),
  femaleId: z.string({ required_error: "Dam is required" }),
  expectedHeatDate: z.date({
    required_error: "Expected heat date is required",
  }),
  notes: z.string().optional(),
});

const PlannedLittersContent: React.FC = () => {
  const { dogs } = useDogs();
  const [plannedLitters, setPlannedLitters] = useState<PlannedLitter[]>(samplePlannedLitters);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedLitter, setSelectedLitter] = useState<PlannedLitter | null>(null);
  const [matingDates, setMatingDates] = useState<{ [litterId: string]: string[] }>({});
  
  const males = dogs.filter(dog => dog.gender === 'male');
  const females = dogs.filter(dog => dog.gender === 'female');
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      maleId: "",
      femaleId: "",
      notes: "",
    }
  });
  
  const handleAddPlannedLitter = (values: z.infer<typeof formSchema>) => {
    const male = dogs.find(dog => dog.id === values.maleId);
    const female = dogs.find(dog => dog.id === values.femaleId);
    
    if (!male || !female) {
      toast({
        title: "Error",
        description: "Selected dogs not found.",
        variant: "destructive"
      });
      return;
    }
    
    const newLitter: PlannedLitter = {
      id: Date.now().toString(),
      maleId: values.maleId,
      femaleId: values.femaleId,
      maleName: male.name,
      femaleName: female.name,
      expectedHeatDate: format(values.expectedHeatDate, 'yyyy-MM-dd'),
      notes: values.notes || ''
    };
    
    setPlannedLitters([...plannedLitters, newLitter]);
    form.reset();
    setOpenDialog(false);
    
    toast({
      title: "Planned Litter Added",
      description: `${male.name} × ${female.name} planned breeding added successfully.`
    });
  };
  
  const handleViewDetails = (litter: PlannedLitter) => {
    setSelectedLitter(litter);
  };
  
  const handleAddMatingDate = (litterId: string, date: Date) => {
    const newMatingDates = { 
      ...matingDates,
      [litterId]: [...(matingDates[litterId] || []), format(date, 'yyyy-MM-dd')]
    };
    
    setMatingDates(newMatingDates);
    
    // Update the planned litter with mating dates
    setPlannedLitters(plannedLitters.map(litter => 
      litter.id === litterId 
        ? { ...litter, matingDates: newMatingDates[litterId] } 
        : litter
    ));
    
    toast({
      title: "Mating Date Added",
      description: `Mating date ${format(date, 'PPP')} added successfully.`
    });
  };

  return (
    <PageLayout 
      title="Planned Litters" 
      description="Plan your future litters and track breeding combinations"
    >
      <div className="flex justify-end">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Planned Litter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Planned Litter</DialogTitle>
              <DialogDescription>
                Plan a future breeding between two of your dogs
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddPlannedLitter)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="maleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sire (Male)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select male dog" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {males.map(dog => (
                            <SelectItem key={dog.id} value={dog.id}>
                              {dog.name} ({dog.breed})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="femaleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dam (Female)</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select female dog" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {females.map(dog => (
                            <SelectItem key={dog.id} value={dog.id}>
                              {dog.name} ({dog.breed})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="expectedHeatDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Expected Heat Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <Calendar className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Add Litter</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plannedLitters.map(litter => (
          <Card key={litter.id}>
            <CardHeader>
              <CardTitle>{litter.maleName} × {litter.femaleName}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Expected heat: {new Date(litter.expectedHeatDate).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{litter.notes}</p>
              
              {litter.matingDates && litter.matingDates.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium">Mating Dates:</h4>
                  <ul className="mt-1 space-y-1">
                    {litter.matingDates.map((date, index) => (
                      <li key={index} className="text-sm">
                        {new Date(date).toLocaleDateString()}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" onClick={() => handleViewDetails(litter)}>
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Litter Details</DialogTitle>
                    <DialogDescription>
                      {litter.maleName} × {litter.femaleName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Expected Heat</h3>
                      <p>{new Date(litter.expectedHeatDate).toLocaleDateString()}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                      <p>{litter.notes || 'No notes'}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Mating Dates</h3>
                      
                      {litter.matingDates && litter.matingDates.length > 0 ? (
                        <ul className="space-y-1">
                          {litter.matingDates.map((date, index) => (
                            <li key={index}>{new Date(date).toLocaleDateString()}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No mating dates recorded</p>
                      )}
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium">Add Mating Date:</h4>
                        <div className="mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Calendar className="mr-2 h-4 w-4" />
                                <span>Select Date</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                onSelect={(date) => date && handleAddMatingDate(litter.id, date)}
                                initialFocus
                                className="p-3 pointer-events-auto"
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>

      {plannedLitters.length === 0 && (
        <div className="text-center py-12">
          <Dog className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium mt-4 mb-2">No Planned Litters</h3>
          <p className="text-muted-foreground">Create your first planned breeding combination</p>
          <Button onClick={() => setOpenDialog(true)} className="mt-4">
            Add Your First Planned Litter
          </Button>
        </div>
      )}
    </PageLayout>
  );
};

const PlannedLitters: React.FC = () => {
  return (
    <DogsProvider>
      <PlannedLittersContent />
    </DogsProvider>
  );
};

export default PlannedLitters;
