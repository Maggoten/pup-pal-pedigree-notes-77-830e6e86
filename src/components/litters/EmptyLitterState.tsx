
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DogIllustration from '../illustrations/DogIllustration';

interface EmptyLitterStateProps {
  onAddLitter: () => void;
}

const EmptyLitterState: React.FC<EmptyLitterStateProps> = ({ onAddLitter }) => {
  return (
    <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
      <CardContent className="text-center py-12 px-6 relative">
        <div className="mx-auto w-24 h-24 relative mb-4">
          <div className="absolute inset-0 bg-primary/10 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <DogIllustration 
              breed="border-collie" 
              size={80} 
              color="var(--primary)"
              withBackground 
            />
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2">No Litters Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Add your first litter to start tracking puppies and their development journey
        </p>
        <div className="relative">
          <Button 
            onClick={onAddLitter} 
            size="lg"
            className="bg-primary hover:bg-primary/90 relative z-10"
          >
            Add Your First Litter
          </Button>
          
          {/* Decorative illustrations */}
          <div className="absolute -top-10 -left-10 opacity-10">
            <DogIllustration 
              breed="shetland-sheepdog" 
              size={60} 
              color="var(--primary)" 
            />
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <DogIllustration 
              breed="generic" 
              size={50} 
              color="var(--primary)" 
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyLitterState;
