import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

interface LightweightLanguageSwitcherProps {
  className?: string;
}

const LightweightLanguageSwitcher: React.FC<LightweightLanguageSwitcherProps> = ({ className }) => {
  const { t, i18n } = useTranslation('common');

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const getCurrentLanguageLabel = () => {
    if (i18n.language === 'sv') return 'Svenska';
    if (i18n.language === 'no') return 'Norsk';
    return 'English';
  };

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      <Globe className="h-4 w-4 text-muted-foreground" />
      <select
        value={i18n.language}
        onChange={(e) => handleLanguageChange(e.target.value)}
        className="bg-transparent border-none text-sm font-medium cursor-pointer focus:outline-none"
      >
        <option value="en">English</option>
        <option value="sv">Svenska</option>
        <option value="no">Norsk</option>
      </select>
    </div>
  );
};

export default LightweightLanguageSwitcher;