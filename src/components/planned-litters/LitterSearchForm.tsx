
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LitterSearchFormProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const LitterSearchForm: React.FC<LitterSearchFormProps> = ({ 
  searchQuery, 
  onSearchChange 
}) => {
  const { t } = useTranslation('plannedLitters');
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={t('search.placeholder')}
        className="pl-10 w-full md:w-[300px]"
      />
    </div>
  );
};

export default LitterSearchForm;
