
import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSettings } from '@/types/settings';
import { useSettings } from '@/hooks/useSettings';

const personalFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  kennelName: z.string().min(1, 'Kennel name is required'),
  address: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  phone: z.string().optional(),
});

type PersonalFormValues = z.infer<typeof personalFormSchema>;

interface PersonalSettingsProps {
  settings: UserSettings;
}

const PersonalSettings: React.FC<PersonalSettingsProps> = ({ settings }) => {
  const { updatePersonalInfo, updateKennelInfo, isUpdatingPersonal, isUpdatingKennel } = useSettings();
  
  const defaultValues: PersonalFormValues = {
    firstName: settings.profile.first_name || '',
    lastName: settings.profile.last_name || '',
    kennelName: settings.profile.kennel_name || '',
    address: settings.profile.address || '',
    // These fields might need proper initialization if they are added to the profile
    website: '', // Add to profile if needed
    phone: settings.profile.phone || '',
  };
  
  const form = useForm<PersonalFormValues>({
    resolver: zodResolver(personalFormSchema),
    defaultValues,
  });
  
  const onSubmit = (data: PersonalFormValues) => {
    // Update personal info
    updatePersonalInfo({
      firstName: data.firstName,
      lastName: data.lastName,
    });
    
    // Update kennel info
    updateKennelInfo({
      kennelName: data.kennelName,
      address: data.address,
      website: data.website,
      phone: data.phone,
    });
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal information and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input placeholder="First name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Last name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Kennel Information</CardTitle>
            <CardDescription>
              Set your kennel name and other business details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kennelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kennel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Kennel name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isUpdatingPersonal || isUpdatingKennel}
            className="min-w-[120px]"
          >
            {(isUpdatingPersonal || isUpdatingKennel) ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                Saving...
              </span>
            ) : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PersonalSettings;
