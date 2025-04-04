
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PaymentFormProps {
  onSubmit: () => void;
  onBack: () => void;
  isLoading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onBack, isLoading }) => {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Payment Information</CardTitle>
        <CardDescription>
          Complete your subscription - $2.99/month
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiration Date</Label>
              <Input id="expiry" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" type="password" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nameOnCard">Name on Card</Label>
            <Input id="nameOnCard" placeholder="John Doe" />
          </div>
          
          <div className="rounded-md bg-secondary p-4 text-sm">
            <p className="font-medium">Subscription Summary:</p>
            <p>Monthly Membership: $2.99</p>
            <p>Your card will be charged monthly until you cancel.</p>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-2">
        <Button 
          className="w-full" 
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Processing payment..." : "Pay $2.99 and Complete Registration"}
        </Button>
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={onBack}
          disabled={isLoading}
        >
          Back to Registration
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PaymentForm;
