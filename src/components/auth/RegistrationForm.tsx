
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const registrationSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
});

export type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSubmit: (values: RegistrationFormValues) => void;
  isLoading: boolean;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
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
                <FormLabel className="text-brown-800">First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} className="border-greige-200 focus:border-greige-300" />
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
                <FormLabel className="text-brown-800">Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} className="border-greige-200 focus:border-greige-300" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-brown-800">Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St, City" {...field} className="border-greige-200 focus:border-greige-300" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
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
        
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-greige-100/50 border-greige-200">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded border-greige-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-brown-800">Accept terms and conditions</FormLabel>
                <FormDescription className="text-brown-600">
                  By creating an account, you agree to our Terms of Service and Privacy Policy. 
                  Your membership will be charged $2.99 monthly. 
                  You can end your subscription at any time.
                </FormDescription>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          className="w-full bg-greige-300 hover:bg-greige-400 text-brown-900" 
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Continue to Payment"}
          <UserPlus className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </Form>
  );
};

export default RegistrationForm;
