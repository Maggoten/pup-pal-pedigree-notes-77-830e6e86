import React from 'react';
import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface PuppyGenderSelectorProps {
  gender: 'male' | 'female';
  onGenderChange: (value: 'male' | 'female') => void;
}

const PuppyGenderSelector: React.FC<PuppyGenderSelectorProps> = ({ 
  gender, 
  onGenderChange 
}) => {
  const { t } = useTranslation('litters');
  
  return (
    <div className="space-y-2">
      <Label>{t('puppies.labels.gender')}</Label>
      <RadioGroup 
        value={gender} 
        onValueChange={(value) => onGenderChange(value as 'male' | 'female')} 
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="male" id="male" />
          <Label htmlFor="male">{t('puppies.labels.male')}</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="female" id="female" />
          <Label htmlFor="female">{t('puppies.labels.female')}</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default PuppyGenderSelector;
