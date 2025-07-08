
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ActivePregnancy } from '@/components/pregnancy/ActivePregnanciesList';
import { Badge } from '@/components/ui/badge';
import { Heart, Baby } from 'lucide-react';

interface PregnancyDropdownSelectorProps {
  activePregnancies: ActivePregnancy[];
  completedPregnancies: ActivePregnancy[];
  currentPregnancyId?: string;
  fullWidth?: boolean;
}

const PregnancyDropdownSelector: React.FC<PregnancyDropdownSelectorProps> = ({ 
  activePregnancies, 
  completedPregnancies,
  currentPregnancyId,
  fullWidth = false
}) => {
  const navigate = useNavigate();
  
  const allPregnancies = [...activePregnancies, ...completedPregnancies];
  
  if (allPregnancies.length === 0) {
    return null;
  }

  console.log("Active pregnancies in dropdown:", activePregnancies.length);
  console.log("Completed pregnancies in dropdown:", completedPregnancies.length);
  console.log("Current pregnancy ID:", currentPregnancyId);

  const currentPregnancy = currentPregnancyId 
    ? allPregnancies.find(p => p.id === currentPregnancyId)
    : activePregnancies[0] || completedPregnancies[0];
  
  const isCurrentPregnancyCompleted = completedPregnancies.some(p => p.id === currentPregnancyId);
    
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
            <div className="flex items-center gap-2">
              {currentPregnancy && (
                <>
                  {isCurrentPregnancyCompleted ? (
                    <Baby className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Heart className="h-4 w-4 text-primary" />
                  )}
                  <span className={isCurrentPregnancyCompleted ? 'text-muted-foreground' : ''}>
                    {currentPregnancy.femaleName}'s Pregnancy
                  </span>
                  {isCurrentPregnancyCompleted && (
                    <Badge variant="secondary" className="text-xs">Completed</Badge>
                  )}
                </>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white">
          {activePregnancies.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-primary">
                <Heart className="h-4 w-4" />
                Active Pregnancies
              </SelectLabel>
              {activePregnancies.map(pregnancy => (
                <SelectItem 
                  key={pregnancy.id} 
                  value={pregnancy.id}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    {pregnancy.femaleName}'s Pregnancy
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {activePregnancies.length > 0 && completedPregnancies.length > 0 && (
            <SelectSeparator />
          )}
          
          {completedPregnancies.length > 0 && (
            <SelectGroup>
              <SelectLabel className="flex items-center gap-2 text-muted-foreground">
                <Baby className="h-4 w-4" />
                Completed Pregnancies
              </SelectLabel>
              {completedPregnancies.map(pregnancy => (
                <SelectItem 
                  key={pregnancy.id} 
                  value={pregnancy.id}
                  className="cursor-pointer text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <Baby className="h-4 w-4 text-muted-foreground" />
                    {pregnancy.femaleName}'s Pregnancy
                    <Badge variant="secondary" className="text-xs ml-auto">Completed</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PregnancyDropdownSelector;
