
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface PuppiesHeaderProps {
  onAddLitterClick: () => void;
}

const PuppiesHeader: React.FC<PuppiesHeaderProps> = ({ onAddLitterClick }) => {
  return (
    <div className="flex justify-end">
      <Button 
        onClick={onAddLitterClick} 
        className="flex items-center gap-2 mb-6 bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        <PlusCircle className="h-4 w-4" />
        Add New Litter
      </Button>
    </div>
  );
};

export default PuppiesHeader;
