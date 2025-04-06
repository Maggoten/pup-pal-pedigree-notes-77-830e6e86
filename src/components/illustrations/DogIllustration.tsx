
import React from 'react';
import { Dog } from 'lucide-react';

export type DogBreed = 'border-collie' | 'shetland-sheepdog' | 'generic';

interface DogIllustrationProps {
  breed?: DogBreed;
  className?: string;
  size?: number;
  color?: string;
  secondaryColor?: string;
  withBackground?: boolean;
}

const DogIllustration: React.FC<DogIllustrationProps> = ({
  breed = 'generic',
  className = '',
  size = 120,
  color = 'currentColor',
  secondaryColor = '#F0EDE5', // greige-100
  withBackground = false
}) => {
  // Use the actual dog icon for the illustrations
  const iconSize = Math.floor(size * 0.9);
  
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {withBackground && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: secondaryColor, opacity: 0.8 }}
        />
      )}
      
      <Dog 
        size={iconSize} 
        color={color}
        className={`transform ${breed === 'border-collie' ? 'rotate-12' : breed === 'shetland-sheepdog' ? '-rotate-12' : ''}`}
        strokeWidth={breed === 'generic' ? 2 : 1.5}
      />
    </div>
  );
};

export default DogIllustration;
