
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import enAuth from './locales/en/auth.json';
import svAuth from './locales/sv/auth.json';
import enCommon from './locales/en/common.json';
import svCommon from './locales/sv/common.json';
import enHome from './locales/en/home.json';
import svHome from './locales/sv/home.json';
import enDogs from './locales/en/dogs.json';
import svDogs from './locales/sv/dogs.json';
import enLitters from './locales/en/litters.json';
import svLitters from './locales/sv/litters.json';
import enPregnancy from './locales/en/pregnancy.json';
import svPregnancy from './locales/sv/pregnancy.json';
import enSettings from './locales/en/settings.json';
import svSettings from './locales/sv/settings.json';
import enNavigation from './locales/en/navigation.json';
import svNavigation from './locales/sv/navigation.json';

const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
    dogs: enDogs,
    litters: enLitters,
    pregnancy: enPregnancy,
    settings: enSettings,
    navigation: enNavigation
  },
  sv: {
    auth: svAuth,
    common: svCommon,
    home: svHome,
    dogs: svDogs,
    litters: svLitters,
    pregnancy: svPregnancy,
    settings: svSettings,
    navigation: svNavigation
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    
    ns: ['common', 'auth', 'home', 'dogs', 'litters', 'pregnancy', 'settings', 'navigation'],
    defaultNS: 'common',
    
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
