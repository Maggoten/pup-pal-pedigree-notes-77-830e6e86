
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
import { Button } from '@/components/ui/button';
import { Heart, Baby, MoreHorizontal, PawPrint } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface PregnancyDropdownSelectorProps {
  activePregnancies: ActivePregnancy[];
  completedPregnancies: ActivePregnancy[];
  currentPregnancyId?: string;
  fullWidth?: boolean;
  onShowAllCompleted?: () => void;
}

const PregnancyDropdownSelector: React.FC<PregnancyDropdownSelectorProps> = ({ 
  activePregnancies, 
  completedPregnancies,
  currentPregnancyId,
  fullWidth = false,
  onShowAllCompleted
}) => {
  const navigate = useNavigate();
  const { t, ready } = useTranslation('pregnancy');
  
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
  
  const formatPregnancyDisplayName = (pregnancy: ActivePregnancy, isCompleted: boolean) => {
    if (!ready) return pregnancy.femaleName;
    
    if (isCompleted) {
      const monthYear = format(pregnancy.expectedDueDate, 'MMM yyyy');
      return `${t('dropdown.pregnancyName', { femaleName: pregnancy.femaleName })} (${monthYear})`;
    }
    return t('dropdown.pregnancyName', { femaleName: pregnancy.femaleName });
  };
    
  const handlePregnancyChange = (pregnancyId: string) => {
    if (pregnancyId === 'view-all-completed') {
      onShowAllCompleted?.();
      return;
    }
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
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Heart className="h-4 w-4 text-primary" />
                  )}
                  <span className={isCurrentPregnancyCompleted ? 'text-muted-foreground' : ''}>
                    {formatPregnancyDisplayName(currentPregnancy, isCurrentPregnancyCompleted)}
                  </span>
                  {isCurrentPregnancyCompleted && (
                    <Badge variant="secondary" className="text-xs">
                      {ready ? t('status.completed') : 'Completed'}
                    </Badge>
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
                {ready ? t('metrics.activePregnancies') : 'Active Pregnancies'}
              </SelectLabel>
              {activePregnancies.map(pregnancy => (
                <SelectItem 
                  key={pregnancy.id} 
                  value={pregnancy.id}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-primary" />
                    {formatPregnancyDisplayName(pregnancy, false)}
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
                <PawPrint className="h-4 w-4" />
                {ready ? t('dropdown.completedPregnancies') : 'Completed Pregnancies'}
              </SelectLabel>
              {completedPregnancies.map(pregnancy => (
                <SelectItem 
                  key={pregnancy.id} 
                  value={pregnancy.id}
                  className="cursor-pointer text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <PawPrint className="h-4 w-4 text-muted-foreground" />
                    {formatPregnancyDisplayName(pregnancy, true)}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          )}
          
          {completedPregnancies.length >= 5 && onShowAllCompleted && (
            <>
              <SelectSeparator />
              <SelectItem value="view-all-completed" className="cursor-pointer justify-center">
                <div className="flex items-center gap-2 text-primary">
                  <MoreHorizontal className="h-4 w-4" />
                  {ready ? t('dropdown.viewAllCompleted') : 'View All Completed Pregnancies'}
                </div>
              </SelectItem>
            </>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PregnancyDropdownSelector;
