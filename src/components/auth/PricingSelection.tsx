import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type BillingInterval = 'monthly' | 'yearly';

interface PricingOption {
  interval: BillingInterval;
  price: string;
  displayPrice: string;
  savings?: string;
  description: string;
}

interface PricingSelectionProps {
  onSelectPlan: (interval: BillingInterval) => void;
  isLoading: boolean;
}

const PricingSelection: React.FC<PricingSelectionProps> = ({ onSelectPlan, isLoading }) => {
  const { t, ready } = useTranslation('litters');
  const [selectedPlan, setSelectedPlan] = useState<BillingInterval>('monthly');

  if (!ready) return null;

  const pricingOptions: PricingOption[] = [
    {
      interval: 'monthly',
      price: '39 SEK',
      displayPrice: '39 SEK/month',
      description: t('pricing.monthly.description', { defaultValue: 'Perfect for getting started' })
    },
    {
      interval: 'yearly',
      price: '299 SEK',
      displayPrice: '299 SEK/year',
      savings: t('pricing.yearly.savings', { defaultValue: 'Save 36%' }),
      description: t('pricing.yearly.description', { defaultValue: 'Best value for serious breeders' })
    }
  ];

  const handleContinue = () => {
    onSelectPlan(selectedPlan);
  };

  return (
    <Card className="w-full max-w-2xl shadow-lg bg-white border-warmbeige-200">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold text-warmgreen-600 font-playfair">
          {t('pricing.title', { defaultValue: 'Choose Your Plan' })}
        </CardTitle>
        <CardDescription className="text-warmgreen-800">
          {t('pricing.subtitle', { defaultValue: 'Start your 30-day free trial with either plan' })}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {pricingOptions.map((option) => (
            <div
              key={option.interval}
              className={`relative rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedPlan === option.interval
                  ? 'border-warmgreen-500 bg-warmgreen-50 shadow-md'
                  : 'border-warmbeige-200 hover:border-warmgreen-300'
              }`}
              onClick={() => setSelectedPlan(option.interval)}
            >
              {option.savings && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-warmgreen-500 to-warmgreen-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {option.savings}
                </div>
              )}

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-warmgreen-800 capitalize">
                    {t(`pricing.${option.interval}.title`, { defaultValue: option.interval })}
                  </h3>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedPlan === option.interval
                      ? 'border-warmgreen-500 bg-warmgreen-500'
                      : 'border-warmbeige-300'
                  }`}>
                    {selectedPlan === option.interval && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-3xl font-bold text-warmgreen-600">
                    {option.price}
                  </div>
                  <div className="text-sm text-warmgreen-700">
                    {option.displayPrice}
                  </div>
                </div>

                <p className="text-warmgreen-700 text-sm mb-4">
                  {option.description}
                </p>

                <div className="space-y-2 text-sm text-warmgreen-600">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-warmgreen-500" />
                    <span>{t('pricing.features.trial', { defaultValue: '30-day free trial' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-warmgreen-500" />
                    <span>{t('pricing.features.unlimited', { defaultValue: 'Unlimited dogs & litters' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-warmgreen-500" />
                    <span>{t('pricing.features.support', { defaultValue: 'Premium support' })}</span>
                  </div>
                  {option.interval === 'yearly' && (
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-warmgreen-500" />
                      <span className="font-medium">{t('pricing.features.yearlyBonus', { defaultValue: 'Priority feature updates' })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-warmbeige-50 rounded-lg border border-warmbeige-200">
          <p className="text-sm text-warmgreen-700 text-center">
            <strong>{t('pricing.trialInfo.title', { defaultValue: 'Free Trial Details:' })}</strong>{' '}
            {t('pricing.trialInfo.description', { 
              defaultValue: 'Start your 30-day free trial immediately. No charges until the trial ends. Cancel anytime during the trial period.' 
            })}
          </p>
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleContinue}
          disabled={isLoading}
          className="w-full bg-warmgreen-600 hover:bg-warmgreen-700 text-white text-lg py-3"
        >
          {isLoading 
            ? t('pricing.loading', { defaultValue: 'Processing...' })
            : t('pricing.continue', { defaultValue: 'Continue with {{plan}} Plan', plan: selectedPlan })
          }
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PricingSelection;