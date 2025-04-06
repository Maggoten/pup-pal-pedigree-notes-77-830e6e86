
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DogIllustration from '../illustrations/DogIllustration';

interface EmptyPuppiesStateProps {
  onAddLitter: () => void;
}

const EmptyPuppiesState: React.FC<EmptyPuppiesStateProps> = ({ onAddLitter }) => {
  return (
    <Card className="border-dashed border-2 border-sage-300 bg-sage-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-sage-100 rounded-full -mr-8 -mt-8 z-0"></div>
      <div className="absolute bottom-0 left-0 w-16 h-16 bg-sage-100 rounded-full -ml-6 -mb-6 z-0"></div>
      
      <CardContent className="text-center py-16 px-6 relative z-10">
        <div className="flex items-center justify-center mb-6">
          <div className="relative mx-auto">
            <div className="absolute -right-8 -top-2">
              <DogIllustration 
                breed="generic" 
                size={40} 
                color="#88A684"
              />
            </div>
            <div className="bg-sage-200/50 w-24 h-24 rounded-full flex items-center justify-center">
              <DogIllustration 
                breed="border-collie" 
                size={60} 
                color="#4D684D"
              />
            </div>
            <div className="absolute -left-8 -bottom-2">
              <DogIllustration 
                breed="shetland-sheepdog" 
                size={40} 
                color="#88A684"
              />
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-medium mb-2 text-foreground">No Litters Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Add your first litter to start tracking puppies' growth, development milestones, and important dates
        </p>
        <Button 
          onClick={onAddLitter}
          size="lg"
          className="bg-sage-600 hover:bg-sage-700 text-white"
        >
          Add Your First Litter
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyPuppiesState;
