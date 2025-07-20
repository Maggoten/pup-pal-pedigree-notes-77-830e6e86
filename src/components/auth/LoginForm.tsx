
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export type LoginFormValues = {
  email: string;
  password: string;
};

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation('auth');

  const loginSchema = z.object({
    email: z.string().email(t('validation.emailRequired')),
    password: z.string().min(6, t('validation.passwordMin')),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-warmgreen-800">{t('email')}</FormLabel>
              <FormControl>
                <Input placeholder={t('placeholders.email')} {...field} className="border-warmbeige-200 focus:border-warmgreen-300" />
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
              <FormLabel className="text-warmgreen-800">{t('password')}</FormLabel>
              <FormControl>
                <Input type="password" {...field} className="border-warmbeige-200 focus:border-warmgreen-300" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? t('loggingIn') : t('login')}
          <LogIn className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
