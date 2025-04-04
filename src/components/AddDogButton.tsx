
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AddDogButtonProps {
  onClick: () => void;
}

const AddDogButton: React.FC<AddDogButtonProps> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onClick}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Dog</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add New Dog</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AddDogButton;
