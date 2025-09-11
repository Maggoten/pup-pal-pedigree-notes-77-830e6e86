import React from 'react';
import { Puppy, Litter } from '@/types/breeding';
import PuppyMeasurementsChart from '../PuppyMeasurementsChart';
import WeeklyPhotosSection from '../weekly-photos/WeeklyPhotosSection';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface PuppyDevelopmentTabProps {
  puppy: Puppy;
  litter?: Litter;
  onUpdatePuppy: (puppy: Puppy) => void;
}

const PuppyDevelopmentTab: React.FC<PuppyDevelopmentTabProps> = ({ 
  puppy, 
  litter, 
  onUpdatePuppy 
}) => {
  const { t } = useTranslation('litters');

  return (
    <div className="space-y-4">
      <Accordion type="multiple" defaultValue={["growth-charts"]} className="w-full">
        <AccordionItem value="growth-charts">
          <AccordionTrigger className="text-lg font-semibold">
            {t('puppies.titles.growthCharts')}
          </AccordionTrigger>
          <AccordionContent>
            <PuppyMeasurementsChart puppy={puppy} />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="weekly-photos">
          <AccordionTrigger className="text-lg font-semibold">
            {t('puppies.titles.weeklyPhotos')}
          </AccordionTrigger>
          <AccordionContent>
            <WeeklyPhotosSection 
              puppy={puppy} 
              litter={litter}
              onUpdate={onUpdatePuppy}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default PuppyDevelopmentTab;