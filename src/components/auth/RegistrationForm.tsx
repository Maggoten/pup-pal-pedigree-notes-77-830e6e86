
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export type RegistrationFormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agreeToTerms: boolean;
};

interface RegistrationFormProps {
  onSubmit: (values: RegistrationFormValues) => void;
  isLoading: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation('auth');

  const registrationSchema = z.object({
    firstName: z.string().min(2, t('validation.firstNameMin')),
    lastName: z.string().min(2, t('validation.lastNameMin')),
    email: z.string().email(t('validation.emailRequired')),
    password: z.string().min(6, t('validation.passwordMin')),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t('validation.termsRequired')
    })
  });

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      agreeToTerms: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-brown-800">{t('firstName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.firstName')} {...field} className="border-warmbeige-300 focus:border-warmgreen-600 bg-white" />
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
                <FormLabel className="text-brown-800">{t('lastName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('placeholders.lastName')} {...field} className="border-warmbeige-300 focus:border-warmgreen-600 bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-brown-800">{t('email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.email')} {...field} className="border-warmbeige-300 focus:border-warmgreen-600 bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-brown-800">{t('password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} className="border-warmbeige-300 focus:border-warmgreen-600 bg-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="bg-warmbeige-100/50 border border-warmbeige-300 rounded-md p-4 mb-4">
          <h4 className="text-brown-800 font-semibold mb-2">{t('whatHappensNext')}</h4>
          <div className="text-brown-600 text-sm space-y-1">
            <p>• {t('accountCreatedInstantly')}</p>
            <p>• {t('redirectToPayment')}</p>
            <p>• {t('trialStarts')}</p>
            <p>• {t('noCharges')}</p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-greige-100/50 border-warmbeige-300">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-warmbeige-300 text-warmgreen-600 focus:ring-warmgreen-500"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-brown-800">{t('agreeToTerms')}</FormLabel>
                <FormDescription className="text-brown-600">
                  {t('termsDescription')}
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? t('processing') : t('createAccount')}
          <UserPlus className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;
