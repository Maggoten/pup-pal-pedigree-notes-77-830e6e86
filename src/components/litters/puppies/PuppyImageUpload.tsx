
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';

interface PuppyImageUploadProps {
  name: string;
  imageUrl: string;
}

const PuppyImageUpload: React.FC<PuppyImageUploadProps> = ({ name, imageUrl }) => {
  const handleImageUpload = () => {
    toast({
      title: "Upload Feature Coming Soon",
      description: "Image upload will be available in the next update."
    });
  };

  return (
    <div className="flex justify-center mb-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={name} />
          ) : (
            <AvatarFallback className="bg-primary/10">
              {name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        <Button 
          size="sm" 
          variant="secondary" 
          className="absolute -bottom-2 -right-2 rounded-full p-1" 
          onClick={handleImageUpload}
        >
          <Camera className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PuppyImageUpload;
