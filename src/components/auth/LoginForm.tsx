
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-brown-800">Email</FormLabel>
              <FormControl>
                <Input placeholder="your@email.com" {...field} className="border-greige-200 focus:border-greige-300" />
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
              <FormLabel className="text-brown-800">Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} className="border-greige-200 focus:border-greige-300" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Add empty space with FormItem to match registration form height */}
        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-greige-100/50 border-greige-200 invisible">
          <div className="h-4 w-4"></div>
          <div className="space-y-1 leading-none">
            <div className="text-brown-800">Placeholder</div>
            <div className="text-brown-600">
              This hidden element ensures the login form has the same height as the registration form.
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-[#296b26] hover:bg-[#296b26]/90 text-white" 
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
