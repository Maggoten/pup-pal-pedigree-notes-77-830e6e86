
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Litter } from '@/types/breeding';

interface LitterListViewProps {
  litters: Litter[];
  selectedLitterId: string | null;
  onLitterSelect: (litterId: string) => void;
}

const LitterListView: React.FC<LitterListViewProps> = ({
  litters,
  selectedLitterId,
  onLitterSelect
}) => {
  return (
    <div className="space-y-2">
      <Tabs 
        value={selectedLitterId || ''} 
        onValueChange={onLitterSelect} 
        className="space-y-4"
      >
        <TabsList className="w-full justify-start overflow-auto border p-2 rounded-lg bg-muted/50">
          {litters.map(litter => (
            <TabsTrigger 
              key={litter.id} 
              value={litter.id} 
              className="px-6 py-2 font-medium rounded-md relative"
            >
              <span className={litter.archived ? "font-semibold" : "text-primary font-semibold"}>
                {litter.name}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default LitterListView;
