
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { useNavigate } from 'react-router-dom';

interface PregnancyDropdownSelectorProps {
  pregnancies: ActivePregnancy[];
  currentPregnancyId?: string;
}

const PregnancyDropdownSelector: React.FC<PregnancyDropdownSelectorProps> = ({ 
  pregnancies, 
  currentPregnancyId 
}) => {
  const navigate = useNavigate();
  
  if (pregnancies.length === 0) {
    return null;
  }

  // Log pregnancies being passed to the dropdown for debugging
  console.log("Pregnancies in dropdown:", pregnancies.map(p => ({id: p.id, femaleName: p.femaleName, maleName: p.maleName})));
  console.log("Current pregnancy ID:", currentPregnancyId);

  const currentPregnancy = currentPregnancyId 
    ? pregnancies.find(p => p.id === currentPregnancyId)
    : pregnancies[0];
    
  const handlePregnancyChange = (pregnancyId: string) => {
    console.log(`Selecting pregnancy: ${pregnancyId}`);
    navigate(`/pregnancy/${pregnancyId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span className="font-medium">
            {currentPregnancy ? `${currentPregnancy.femaleName} × ${currentPregnancy.maleName}` : 'Select Pregnancy'}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-white">
        {pregnancies.map(pregnancy => (
          <DropdownMenuItem 
            key={pregnancy.id}
            onClick={() => handlePregnancyChange(pregnancy.id)}
            className="cursor-pointer"
          >
            {pregnancy.femaleName} × {pregnancy.maleName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default PregnancyDropdownSelector;
