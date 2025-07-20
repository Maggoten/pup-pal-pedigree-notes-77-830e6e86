
import React from 'react';
import { useTranslation } from 'react-i18next';

interface WelcomeHeaderProps {
  username: string;
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ username }) => {
  const { t } = useTranslation('home');

  return (
    <div className="flex flex-col space-y-1">
      <h2 className="text-2xl font-bold text-warmgreen-700">
        {t('welcome.title', { username })}
      </h2>
      <p className="text-warmgreen-600 text-sm">
        {t('welcome.subtitle')}
      </p>
    </div>
  );
};

export default WelcomeHeader;
