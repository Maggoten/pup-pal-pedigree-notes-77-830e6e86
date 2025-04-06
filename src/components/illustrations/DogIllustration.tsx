
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
  // Line art path data based on breed
  const illustrationData = {
    'border-collie': {
      viewBox: '0 0 100 100',
      paths: [
        // Main head and body outline - more defined dog shape
        <path key="outline" d="M30,45 C27,38 28,30 35,25 C42,20 52,18 60,25 C65,20 75,25 73,35 C78,40 75,50 70,55 C75,65 70,80 60,85 C45,90 35,85 30,75 C25,65 25,55 30,45 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        // Border collie distinctive ears - pointy and alert
        <path key="ear-left" d="M35,25 C32,20 30,15 25,15" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M60,25 C63,20 65,15 70,15" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Face features
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M60,40 C62,40 64,38 64,36 C64,34 62,32 60,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,48 C48,50 52,50 52,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M44,55 C48,58 52,58 56,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Border collie face marking - characteristic stripe down face
        <path key="blaze" d="M50,32 L50,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Collar suggestion
        <path key="collar" d="M35,60 C40,63 50,63 65,60" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      ]
    },
    'shetland-sheepdog': {
      viewBox: '0 0 100 100',
      paths: [
        // Main outline with fluffier appearance for Sheltie
        <path key="outline" d="M25,45 C22,38 23,30 30,25 C37,20 50,18 60,25 C65,20 75,25 73,35 C78,40 75,50 70,55 C75,65 70,80 60,85 C45,90 35,85 30,75 C25,65 25,55 25,45 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        // Sheltie's smaller, more forward-folding ears
        <path key="ear-left" d="M35,25 C33,22 30,20 28,22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M60,25 C62,22 65,20 67,22" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Face details
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M60,40 C62,40 64,38 64,36 C64,34 62,32 60,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,48 C48,50 52,50 52,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M44,55 C48,58 52,58 56,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Sheltie's distinctive mane and fluffy fur
        <path key="mane" d="M30,60 C25,68 35,75 50,75 C65,75 75,68 70,60" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,3" />,
        // Sheltie facial markings
        <path key="markings" d="M50,32 L50,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      ]
    },
    'generic': {
      viewBox: '0 0 100 100',
      paths: [
        // Simple dog outline - more defined
        <path key="outline" d="M30,45 C25,38 28,28 40,25 C52,22 62,25 65,35 C70,40 70,50 65,55 C70,65 65,80 55,85 C45,90 35,85 30,75 C25,65 25,55 30,45 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        // Generic floppy ears - like a beagle
        <path key="ear-left" d="M35,30 C32,28 25,32 25,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="ear-right" d="M65,30 C68,28 75,32 75,40" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Face details
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M60,40 C62,40 64,38 64,36 C64,34 62,32 60,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,48 C48,50 52,50 52,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M44,55 C48,58 52,58 56,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Snout definition to make it more dog-like
        <path key="snout" d="M40,48 C43,55 57,55 60,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Collar suggestion
        <path key="collar" d="M35,65 C45,68 55,68 65,65" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
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
        <circle cx="50" cy="50" r="40" fill={secondaryColor} opacity="0.8" />
      )}
      {paths}
    </svg>
  );
};

export default DogIllustration;
