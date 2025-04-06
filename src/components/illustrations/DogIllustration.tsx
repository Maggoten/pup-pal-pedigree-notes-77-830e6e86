
import React from 'react';

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
  // Viewbox and path data based on breed
  const illustrationData = {
    'border-collie': {
      viewBox: '0 0 100 100',
      paths: [
        // Body and head shape
        <path key="body" d="M30,60 C25,72 35,85 50,85 C65,85 75,72 70,60 C70,60 75,50 75,40 C75,28 65,20 50,20 C35,20 25,28 25,40 C25,50 30,60 30,60 Z" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        // Face details
        <path key="nose" d="M50,55 C47,55 45,53 45,50 C45,47 47,45 50,45 C53,45 55,47 55,50 C55,53 53,55 50,55 Z" fill={color} />,
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32 C42,32 44,34 44,36 C44,38 42,40 40,40 Z" fill={color} />,
        <path key="eye-right" d="M60,40 C58,40 56,38 56,36 C56,34 58,32 60,32 C62,32 64,34 64,36 C64,38 62,40 60,40 Z" fill={color} />,
        // Ears
        <path key="ear-left" d="M30,30 C25,20 28,10 35,15 C40,18 40,28 38,32" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        <path key="ear-right" d="M70,30 C75,20 72,10 65,15 C60,18 60,28 62,32" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        // Border collie color patch
        <path key="patch" d="M35,36 C35,36 40,45 50,45 C60,45 65,36 65,36 C65,36 60,25 50,25 C40,25 35,36 35,36 Z" fill={color} />
      ]
    },
    'shetland-sheepdog': {
      viewBox: '0 0 100 100',
      paths: [
        // Fluffier body
        <path key="body" d="M25,60 C20,75 35,90 50,90 C65,90 80,75 75,60 C75,60 80,50 80,40 C80,25 65,15 50,15 C35,15 20,25 20,40 C20,50 25,60 25,60 Z" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        // Face details
        <path key="nose" d="M50,60 C47,60 45,58 45,55 C45,52 47,50 50,50 C53,50 55,52 55,55 C55,58 53,60 50,60 Z" fill={color} />,
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32 C42,32 44,34 44,36 C44,38 42,40 40,40 Z" fill={color} />,
        <path key="eye-right" d="M60,40 C58,40 56,38 56,36 C56,34 58,32 60,32 C62,32 64,34 64,36 C64,38 62,40 60,40 Z" fill={color} />,
        // Fluffier pointy ears
        <path key="ear-left" d="M30,25 C25,15 25,5 32,10 C38,14 42,22 40,30" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        <path key="ear-right" d="M70,25 C75,15 75,5 68,10 C62,14 58,22 60,30" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        // Shetland color markings
        <path key="markings" d="M35,45 C35,45 40,55 50,55 C60,55 65,45 65,45 C65,45 60,32 50,32 C40,32 35,45 35,45 Z" fill={color} />,
        // Fluffy mane
        <ellipse key="mane" cx="50" cy="50" rx="25" ry="15" fill="none" stroke={color} strokeWidth="1" strokeDasharray="2,2" />
      ]
    },
    'generic': {
      viewBox: '0 0 100 100',
      paths: [
        // Simple dog shape
        <path key="body" d="M30,60 C25,72 35,85 50,85 C65,85 75,72 70,60 C75,55 80,45 75,35 C70,25 60,20 50,20 C40,20 30,25 25,35 C20,45 25,55 30,60 Z" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        // Face details
        <path key="nose" d="M50,60 C47,60 45,58 45,55 C45,52 47,50 50,50 C53,50 55,52 55,55 C55,58 53,60 50,60 Z" fill={color} />,
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32 C42,32 44,34 44,36 C44,38 42,40 40,40 Z" fill={color} />,
        <path key="eye-right" d="M60,40 C58,40 56,38 56,36 C56,34 58,32 60,32 C62,32 64,34 64,36 C64,38 62,40 60,40 Z" fill={color} />,
        // Floppy ears
        <path key="ear-left" d="M30,30 C25,25 20,30 25,40 C28,45 32,42 35,38" fill={secondaryColor} stroke={color} strokeWidth="2" />,
        <path key="ear-right" d="M70,30 C75,25 80,30 75,40 C72,45 68,42 65,38" fill={secondaryColor} stroke={color} strokeWidth="2" />
      ]
    }
  };

  const { viewBox, paths } = illustrationData[breed];
  
  return (
    <svg 
      className={className} 
      viewBox={viewBox} 
      width={size} 
      height={size} 
      xmlns="http://www.w3.org/2000/svg"
    >
      {withBackground && (
        <circle cx="50" cy="50" r="40" fill="#F5F7F3" opacity="0.8" />
      )}
      {paths}
    </svg>
  );
};

export default DogIllustration;
