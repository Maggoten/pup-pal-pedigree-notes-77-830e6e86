
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';

interface PregnancyDropdownSelectorProps {
  pregnancies: ActivePregnancy[];
  currentPregnancyId?: string;
  fullWidth?: boolean;
}

const PregnancyDropdownSelector: React.FC<PregnancyDropdownSelectorProps> = ({ 
  pregnancies, 
  currentPregnancyId,
  fullWidth = false
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
    <div className={`flex items-center ${fullWidth ? 'w-full' : ''}`}>
      <Select 
        value={currentPregnancy?.id} 
        onValueChange={handlePregnancyChange}
      >
        <SelectTrigger className={`min-w-[200px] bg-white ${fullWidth ? 'w-full' : ''}`}>
          <SelectValue placeholder="Select a pregnancy">
            {currentPregnancy 
              ? `${currentPregnancy.femaleName}'s Pregnancy` 
              : 'Select Pregnancy'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {pregnancies.map(pregnancy => (
            <SelectItem 
              key={pregnancy.id} 
              value={pregnancy.id}
              className="cursor-pointer"
            >
              {`${pregnancy.femaleName}'s Pregnancy`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PregnancyDropdownSelector;
