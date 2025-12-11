
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import BreedDropdown from '@/components/dogs/breed-selector/BreedDropdown';
import { useTranslation } from 'react-i18next';

interface ExternalSireFieldsProps {
  externalSireName: string;
  setExternalSireName: (name: string) => void;
  externalSireBreed: string;
  setExternalSireBreed: (breed: string) => void;
  externalSireRegistration: string;
  setExternalSireRegistration: (reg: string) => void;
}

const ExternalSireFields: React.FC<ExternalSireFieldsProps> = ({
  externalSireName,
  setExternalSireName,
  externalSireBreed,
  setExternalSireBreed,
  externalSireRegistration,
  setExternalSireRegistration
}) => {
  const { t } = useTranslation('litters');
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="externalSireName">{t('external.labels.sireName')}</Label>
        <Input
          id="externalSireName"
          value={externalSireName}
          onChange={(e) => setExternalSireName(e.target.value)}
          placeholder={t('external.placeholders.enterSireName')}
          className="bg-white border-greige-300"
        />
      </div>
      
      <div>
        <Label htmlFor="externalSireBreed">{t('external.labels.sireBreed')}</Label>
        <BreedDropdown
          value={externalSireBreed}
          onChange={setExternalSireBreed}
          className="bg-white border-greige-300"
        />
      </div>
      
      <div>
        <Label htmlFor="externalSireRegistration">{t('external.labels.registrationNumber')} ({t('puppies.placeholders.registrationNumber').toLowerCase()})</Label>
        <Input
          id="externalSireRegistration"
          value={externalSireRegistration}
          onChange={(e) => setExternalSireRegistration(e.target.value)}
          placeholder={t('external.placeholders.enterRegistrationNumber')}
          className="bg-white border-greige-300"
        />
      </div>
    </div>
  );
};

export default ExternalSireFields;
