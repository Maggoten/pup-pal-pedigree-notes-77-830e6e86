import React, { useState } from 'react';
import { DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import NewLitterTabContent from './NewLitterTabContent';
import PregnancyTabContent from './PregnancyTabContent';
import { Litter } from '@/types/breeding';
import { useTranslation } from 'react-i18next';

interface AddLitterDialogContentProps {
  onClose: () => void;
  onLitterAdded: (litter: Litter) => void;
}

const AddLitterDialogContent: React.FC<AddLitterDialogContentProps> = ({ 
  onClose, 
  onLitterAdded
}) => {
  const [activeTab, setActiveTab] = useState('newLitter');
  const { t } = useTranslation('litters');

  return (
    <>
      <DialogDescription>
        {t('dialog.addLitter.description')}
      </DialogDescription>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
        <TabsList className="grid grid-cols-2 bg-greige-200">
          <TabsTrigger value="newLitter">{t('dialog.addLitter.tabs.newLitter')}</TabsTrigger>
          <TabsTrigger value="pregnancy">{t('dialog.addLitter.tabs.fromPregnancy', 'Från dräktighet')}</TabsTrigger>
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
      </Tabs>
    </>
  );
};

export default AddLitterDialogContent;
