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
import { useTranslation } from 'react-i18next';

// Validation schema - will be created with translations
const createPersonalFormSchema = (t: (key: string) => string) => z.object({
  firstName: z.string().min(1, t('validation.firstNameRequired')),
  lastName: z.string().min(1, t('validation.lastNameRequired')),
  kennelName: z.string().min(1, t('validation.kennelNameRequired')),
  address: z.string().optional(),
  website: z.string().url(t('validation.websiteInvalid')).optional().or(z.literal('')),
  phone: z.string().optional(),
});

type PersonalFormValues = z.infer<ReturnType<typeof createPersonalFormSchema>>;

interface PersonalSettingsProps {
  settings: UserSettings;
}

const PersonalSettings: React.FC<PersonalSettingsProps> = ({ settings }) => {
  const { updatePersonalInfo, updateKennelInfo, isUpdatingPersonal, isUpdatingKennel } = useSettings();
  const { t } = useTranslation('settings');
  
  const personalFormSchema = createPersonalFormSchema(t);
  
  const defaultValues: PersonalFormValues = {
    firstName: settings.profile.first_name || '',
    lastName: settings.profile.last_name || '',
    kennelName: settings.profile.kennel_name || '',
    address: settings.profile.address || '',
    website: '', // This would need to be added to the profile model
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
            <CardTitle>{t('personal.title')}</CardTitle>
            <CardDescription>
              {t('personal.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('personal.fields.firstName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personal.fields.firstNamePlaceholder')} {...field} />
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
                    <FormLabel>{t('personal.fields.lastName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personal.fields.lastNamePlaceholder')} {...field} />
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
            <CardTitle>{t('personal.kennel.title')}</CardTitle>
            <CardDescription>
              {t('personal.kennel.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="kennelName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('personal.fields.kennelName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('personal.fields.kennelNamePlaceholder')} {...field} />
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
                  <FormLabel>{t('personal.fields.address')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('personal.fields.addressPlaceholder')} {...field} />
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
                    <FormLabel>{t('personal.fields.website')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personal.fields.websitePlaceholder')} {...field} />
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
                    <FormLabel>{t('personal.fields.phone')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('personal.fields.phonePlaceholder')} {...field} />
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
                {t('personal.actions.saving')}
              </span>
            ) : t('personal.actions.saveChanges')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PersonalSettings;