import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, RefreshCw, AlertCircle } from 'lucide-react';
import { BillingInterval } from './PricingSelection';

interface PricingOption {
  interval: BillingInterval;
  name: string;
  price: string;
  yearlyPrice?: string;
  features: string[];
  recommended?: boolean;
}

interface PricingSelectionWithRetryProps {
  onSelectPlan: (interval: BillingInterval) => Promise<void>;
  isLoading: boolean;
  showRetry?: boolean;
  lastError?: string;
}

const PricingSelectionWithRetry: React.FC<PricingSelectionWithRetryProps> = ({ 
  onSelectPlan, 
  isLoading,
  showRetry = false,
  lastError
}) => {
  const [selectedPlan, setSelectedPlan] = useState<BillingInterval>('yearly');

  const pricingOptions: PricingOption[] = [
    {
      interval: 'monthly',
      name: 'Monthly Plan',
      price: '$7.99',
      features: [
        'Unlimited dog profiles',
        'Health record tracking',
        'Breeding history management',
        'Photo storage',
        'Calendar integration',
        'Export capabilities'
      ]
    },
    {
      interval: 'yearly',
      name: 'Yearly Plan',
      price: '$79.99',
      yearlyPrice: '$6.67/month',
      features: [
        'Everything in Monthly Plan',
        '2 months free (save 17%)',
        'Priority customer support',
        'Advanced reporting features',
        'Data backup & sync',
        'Early access to new features'
      ],
      recommended: true
    }
  ];

  const handleContinue = async () => {
    try {
      await onSelectPlan(selectedPlan);
    } catch (error) {
      console.error('PricingSelection: Error during plan selection:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl bg-white border-warmbeige-200">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold text-brown-800 font-playfair">
          Choose Your Plan
        </CardTitle>
        <CardDescription className="text-brown-600">
          Start your 30-day free trial today. No charges until your trial ends.
        </CardDescription>
        
        {showRetry && lastError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Payment setup failed</span>
            </div>
            <p className="text-red-600 text-sm mt-1">{lastError}</p>
            <p className="text-red-600 text-sm">Please try again or contact support if the issue persists.</p>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {pricingOptions.map((option) => (
            <div
              key={option.interval}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPlan === option.interval
                  ? 'border-warmgreen-500 bg-warmgreen-50'
                  : 'border-warmbeige-200 hover:border-warmbeige-300'
              }`}
              onClick={() => setSelectedPlan(option.interval)}
            >
              {option.recommended && (
                <Badge className="absolute -top-2 left-4 bg-warmgreen-600 text-white">
                  Recommended
                </Badge>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-brown-800">{option.name}</h3>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    selectedPlan === option.interval
                      ? 'border-warmgreen-500 bg-warmgreen-500'
                      : 'border-warmbeige-300'
                  }`}>
                    {selectedPlan === option.interval && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-brown-800">{option.price}</span>
                    <span className="text-brown-600 text-sm">/{option.interval}</span>
                  </div>
                  {option.yearlyPrice && (
                    <div className="text-warmgreen-600 text-sm font-medium">
                      {option.yearlyPrice} billed annually
                    </div>
                  )}
                </div>
                
                <ul className="space-y-1">
                  {option.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-brown-700">
                      <Check className="w-4 h-4 text-warmgreen-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <Button 
              onClick={handleContinue}
              disabled={isLoading}
              size="lg"
              className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white font-semibold py-3"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Setting up payment...
                </div>
              ) : showRetry ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </div>
              ) : (
                `Start Free Trial - ${pricingOptions.find(o => o.interval === selectedPlan)?.price}/${selectedPlan}`
              )}
            </Button>
            
            {!isLoading && (
              <p className="text-xs text-brown-600">
                By continuing, you agree to be charged {pricingOptions.find(o => o.interval === selectedPlan)?.price} {selectedPlan} after your 30-day trial ends. Cancel anytime.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingSelectionWithRetry;