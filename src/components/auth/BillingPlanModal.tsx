import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface BillingPlanModalProps {
  onSelectPlan: (interval: 'monthly' | 'yearly') => void;
  isLoading?: boolean;
}

const BillingPlanModal: React.FC<BillingPlanModalProps> = ({ onSelectPlan, isLoading = false }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl shadow-lg bg-white border-warmbeige-200">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-brown-800 font-playfair">
            Choose Your Plan
          </CardTitle>
          <CardDescription className="text-brown-600">
            Start your 30-day free trial - no charge until after the trial period
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Monthly Plan */}
          <Card className="border-2 border-warmbeige-200 hover:border-warmgreen-300 transition-colors">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold text-brown-800">
                Monthly Plan
              </CardTitle>
              <div className="text-3xl font-bold text-warmgreen-600">
                $7.99<span className="text-base font-normal text-brown-600">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  30-day free trial
                </li>
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  All breeding management features
                </li>
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  Unlimited dogs and litters
                </li>
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  Cancel anytime
                </li>
              </ul>
              <Button 
                onClick={() => onSelectPlan('monthly')}
                disabled={isLoading}
                className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
              >
                {isLoading ? "Processing..." : "Start Monthly Trial"}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="border-2 border-warmgreen-300 hover:border-warmgreen-400 transition-colors relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-warmgreen-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                SAVE 17%
              </span>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold text-brown-800">
                Yearly Plan
              </CardTitle>
              <div className="text-3xl font-bold text-warmgreen-600">
                $79.99<span className="text-base font-normal text-brown-600">/year</span>
              </div>
              <div className="text-sm text-brown-600">
                Just $6.67/month when paid annually
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  30-day free trial
                </li>
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  All breeding management features
                </li>
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  Unlimited dogs and litters
                </li>
                <li className="flex items-center gap-2 text-sm text-brown-700">
                  <Check className="h-4 w-4 text-warmgreen-600" />
                  Save $16 per year
                </li>
              </ul>
              <Button 
                onClick={() => onSelectPlan('yearly')}
                disabled={isLoading}
                className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white"
              >
                {isLoading ? "Processing..." : "Start Yearly Trial"}
              </Button>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPlanModal;