
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyPuppiesStateProps {
  onAddLitter: () => void;
}

const EmptyPuppiesState: React.FC<EmptyPuppiesStateProps> = ({ onAddLitter }) => {
  return (
    <Card>
      <CardContent className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No Litters Yet</h3>
        <p className="text-muted-foreground mb-4">Add your first litter to start tracking puppies</p>
        <Button onClick={onAddLitter}>Add Your First Litter</Button>
      </CardContent>
    </Card>
  );
};

export default EmptyPuppiesState;
