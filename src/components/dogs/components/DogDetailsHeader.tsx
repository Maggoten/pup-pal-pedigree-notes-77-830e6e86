
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface DogDetailsHeaderProps {
  onBack: () => void;
  isEditing: boolean;
}

const DogDetailsHeader: React.FC<DogDetailsHeaderProps> = ({ onBack, isEditing }) => {
  const handleBack = () => {
    if (isEditing) {
      // Confirm before navigating away from unsaved changes
      if (window.confirm("You have unsaved changes. Are you sure you want to go back?")) {
        onBack();
      }
    } else {
      onBack();
    }
  };

  return (
    <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
      <ArrowLeft className="h-4 w-4" />
      Back to list
    </Button>
  );
};

export default DogDetailsHeader;
