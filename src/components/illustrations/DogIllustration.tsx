
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
        // Main outline - continuous line art
        <path key="outline" d="M30,45 C28,35 32,25 42,20 C52,15 62,20 65,25 C68,20 75,25 75,35 C75,45 70,55 65,60 C70,70 65,85 50,85 C35,85 30,70 35,60 C30,55 25,45 30,45 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        // Face details - minimalist style
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M60,40 C62,40 64,38 64,36 C64,34 62,32 60,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,48 C48,50 52,50 52,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M46,55 C48,57 52,57 54,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Border collie distinctive feature - simple ear accent
        <path key="ear-accent" d="M35,30 C38,25 42,22 48,25" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,3" />
      ]
    },
    'shetland-sheepdog': {
      viewBox: '0 0 100 100',
      paths: [
        // Main outline with fluffier, pointier ears
        <path key="outline" d="M25,45 C22,35 25,22 35,18 C45,14 55,15 58,20 C62,15 75,20 70,30 C75,40 80,50 75,60 C80,70 70,85 50,85 C30,85 20,70 25,60 C20,50 22,45 25,45 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        // Face details
        <path key="eye-left" d="M38,40 C36,40 34,38 34,36 C34,34 36,32 38,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M62,40 C64,40 66,38 66,36 C66,34 64,32 62,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,50 C48,52 52,52 52,50" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M46,55 C48,57 52,57 54,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Shetland sheepdog distinctive feature - fluffy mane suggestion
        <path key="mane" d="M35,55 C30,65 40,68 50,68 C60,68 70,65 65,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2,3" />
      ]
    },
    'generic': {
      viewBox: '0 0 100 100',
      paths: [
        // Simple dog outline
        <path key="outline" d="M30,45 C25,35 30,20 45,20 C60,20 70,30 70,40 C70,50 65,55 60,60 C65,70 60,85 50,85 C40,85 35,70 40,60 C35,55 30,50 30,45 Z" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />,
        // Face details
        <path key="eye-left" d="M40,40 C38,40 36,38 36,36 C36,34 38,32 40,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="eye-right" d="M60,40 C62,40 64,38 64,36 C64,34 62,32 60,32" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="nose" d="M48,48 C48,50 52,50 52,48" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        <path key="mouth" d="M46,55 C48,57 52,57 54,55" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />,
        // Generic dog feature - floppy ear suggestion
        <path key="ear" d="M35,25 C30,30 25,40 30,45" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
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
