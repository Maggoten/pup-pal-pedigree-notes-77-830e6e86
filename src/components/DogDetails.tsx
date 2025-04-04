
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Dog as DogIcon, ArrowLeft, CalendarIcon } from 'lucide-react';
import { Dog as DogType, useDogs } from '@/context/DogsContext';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from '@/components/ui/use-toast';
import ImageUploader from './ImageUploader';

interface DogDetailsProps {
  dog: DogType;
}

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  breed: z.string().min(2, { message: 'Breed must be at least 2 characters' }),
  dateOfBirth: z.date({
    required_error: 'Date of birth is required',
  }),
  gender: z.enum(['male', 'female']),
  color: z.string().min(2, { message: 'Color must be at least 2 characters' }),
  registrationNumber: z.string().optional(),
  dewormingDate: z.date().optional(),
  vaccinationDate: z.date().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
});

const DogDetails: React.FC<DogDetailsProps> = ({ dog }) => {
  const { setActiveDog, updateDog } = useDogs();
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: dog.name,
      breed: dog.breed,
      dateOfBirth: new Date(dog.dateOfBirth),
      gender: dog.gender,
      color: dog.color,
      registrationNumber: dog.registrationNumber || '',
      dewormingDate: dog.dewormingDate ? new Date(dog.dewormingDate) : undefined,
      vaccinationDate: dog.vaccinationDate ? new Date(dog.vaccinationDate) : undefined,
      notes: dog.notes || '',
      image: dog.image || '',
    },
  });
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateDog(dog.id, {
      ...values,
      dewormingDate: values.dewormingDate ? format(values.dewormingDate, 'yyyy-MM-dd') : undefined,
      vaccinationDate: values.vaccinationDate ? format(values.vaccinationDate, 'yyyy-MM-dd') : undefined,
      dateOfBirth: format(values.dateOfBirth, 'yyyy-MM-dd'),
    });
    
    setIsEditing(false);
    toast({
      title: "Dog updated",
      description: `${values.name}'s information has been updated.`,
    });
  };
  
  const handleBack = () => {
    setActiveDog(null);
  };

  const handleImageChange = (imageBase64: string) => {
    form.setValue('image', imageBase64);
  };
  
  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to list
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DogIcon className="h-5 w-5" />
            {isEditing ? 'Edit Dog' : dog.name}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'Update dog information' : `${dog.breed} • ${dog.gender === 'male' ? 'Male' : 'Female'}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {isEditing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
                  <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dog Photo</FormLabel>
                        <FormControl>
                          <ImageUploader 
                            currentImage={field.value} 
                            onImageChange={handleImageChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="breed"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Breed</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Date of Birth</FormLabel>
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
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
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
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Color</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="registrationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Registration Number</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="dewormingDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Deworming Date</FormLabel>
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
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
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
                        name="vaccinationDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Vaccination Date</FormLabel>
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
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
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
                    </div>
                    
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
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-[200px_1fr]">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Photo</h3>
                <div className="aspect-square w-full overflow-hidden rounded-lg border border-border">
                  {dog.image ? (
                    <img 
                      src={dog.image} 
                      alt={dog.name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <DogIcon className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Breed</h3>
                    <p>{dog.breed}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                    <p>{dog.gender === 'male' ? 'Male' : 'Female'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                    <p>{format(new Date(dog.dateOfBirth), 'PPP')}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                    <p>{dog.color}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Registration Number</h3>
                    <p>{dog.registrationNumber || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Deworming Date</h3>
                    <p>{dog.dewormingDate ? format(new Date(dog.dewormingDate), 'PPP') : 'N/A'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Vaccination Date</h3>
                    <p>{dog.vaccinationDate ? format(new Date(dog.vaccinationDate), 'PPP') : 'N/A'}</p>
                  </div>
                </div>
                
                {dog.notes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                    <p>{dog.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-end">
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default DogDetails;
