
import React from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import DogIllustration from '../illustrations/DogIllustration';

interface EmptyPlannedLittersProps {
  onAddClick: () => void;
}

const EmptyPlannedLitters: React.FC<EmptyPlannedLittersProps> = ({ onAddClick }) => {
  return (
    <div className="border-2 border-dashed border-primary/30 rounded-lg text-center py-12 px-6 bg-primary/5 relative">
      <div className="mx-auto w-24 h-24 relative mb-4">
        <div className="bg-primary/10 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
          <div className="relative">
            <DogIllustration 
              breed="shetland-sheepdog" 
              size={60}
              color="var(--primary)"
            />
            <div className="absolute -top-1 -right-2">
              <Heart className="h-5 w-5 text-accent animate-pulse" />
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-xl font-medium mt-4 mb-2">No Planned Litters</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Start planning your future litters by creating your first breeding combination
      </p>
      <Button onClick={onAddClick} size="lg" className="bg-primary hover:bg-primary/90">
        Add Your First Planned Litter
      </Button>
      
      {/* Decorative elements with illustrations */}
      <div className="absolute -bottom-4 -left-2 opacity-20 transform -rotate-12">
        <DogIllustration breed="border-collie" size={60} color="var(--primary)" />
      </div>
      <div className="absolute -top-4 -right-2 opacity-20 transform rotate-12">
        <DogIllustration breed="generic" size={60} color="var(--primary)" />
      </div>
      
      {/* Decorative dots */}
      <div className="mt-8 flex justify-center space-x-4 opacity-30">
        <div className="w-4 h-4 rounded-full bg-sage-300"></div>
        <div className="w-4 h-4 rounded-full bg-sage-400"></div>
        <div className="w-4 h-4 rounded-full bg-sage-500"></div>
        <div className="w-4 h-4 rounded-full bg-sage-400"></div>
        <div className="w-4 h-4 rounded-full bg-sage-300"></div>
      </div>
    </div>
  );
};

export default EmptyPlannedLitters;
