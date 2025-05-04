
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { isMobileSafari } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  isLoading: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Prevent multiple submissions on mobile
  const handleSubmit = (e: React.FormEvent) => {
    // On iOS Safari, ensure form input is not focused to avoid keyboard issues
    if (isMobileSafari()) {
      // Blur active input fields to dismiss keyboard
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      
      // Small delay for mobile to ensure UI updates before submission
      setTimeout(() => {
        form.handleSubmit((values) => {
          console.log('Login form submission on mobile device', { email: values.email });
          onSubmit(values);
        })(e);
      }, 50);
    } else {
      // Normal submission for desktop
      form.handleSubmit(onSubmit)(e);
    }
  };
  
  React.useEffect(() => {
    // Add viewport meta tag for proper mobile scaling if not present
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.setAttribute('name', 'viewport');
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      document.head.appendChild(viewportMeta);
    }
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="your@email.com" 
                  {...field}
                  type="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="email"
                />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  {...field}
                  autoComplete="current-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          className="w-full" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
          <LogIn className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
