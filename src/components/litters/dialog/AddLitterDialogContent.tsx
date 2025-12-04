import React, { useState } from 'react';
import { DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewLitterTabContent from './NewLitterTabContent';
import PlannedLitterTabContent from './PlannedLitterTabContent';
import PregnancyTabContent from './PregnancyTabContent';
import { Litter, PlannedLitter } from '@/types/breeding';
import { useTranslation } from 'react-i18next';

interface AddLitterDialogContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
  plannedLitters: PlannedLitter[];
}

const AddLitterDialogContent: React.FC<AddLitterDialogContentProps> = ({ 
  onClose, 
  onLitterAdded, 
  plannedLitters 
}) => {
  const [activeTab, setActiveTab] = useState('newLitter');
  const { t } = useTranslation('litters');

  return (
    <>
      <DialogDescription>
        {t('dialog.addLitter.description')}
      </DialogDescription>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid grid-cols-3 bg-greige-200">
          <TabsTrigger value="newLitter">{t('dialog.addLitter.tabs.newLitter')}</TabsTrigger>
          <TabsTrigger value="pregnancy">{t('dialog.addLitter.tabs.fromPregnancy', 'Från dräktighet')}</TabsTrigger>
          <TabsTrigger value="plannedLitter">{t('dialog.addLitter.tabs.fromPlanned')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="newLitter" className="space-y-4 mt-4">
          <NewLitterTabContent onClose={onClose} onLitterAdded={onLitterAdded} />
        </TabsContent>
        
        <TabsContent value="pregnancy" className="space-y-4 mt-4">
          <PregnancyTabContent 
            onClose={onClose} 
            onLitterAdded={onLitterAdded}
          />
        </TabsContent>
        
        <TabsContent value="plannedLitter" className="space-y-4 mt-4">
          <PlannedLitterTabContent 
            onClose={onClose} 
            onLitterAdded={onLitterAdded}
            plannedLitters={plannedLitters}
          />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default AddLitterDialogContent;
