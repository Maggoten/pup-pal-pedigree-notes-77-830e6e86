
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from './locales/en/common.json';
import svCommon from './locales/sv/common.json';
import enNavigation from './locales/en/navigation.json';
import svNavigation from './locales/sv/navigation.json';
import enDogs from './locales/en/dogs.json';
import svDogs from './locales/sv/dogs.json';
import enPregnancy from './locales/en/pregnancy.json';
import svPregnancy from './locales/sv/pregnancy.json';
import enLitters from './locales/en/litters.json';
import svLitters from './locales/sv/litters.json';
import enSettings from './locales/en/settings.json';
import svSettings from './locales/sv/settings.json';
import enAuth from './locales/en/auth.json';
import svAuth from './locales/sv/auth.json';
import enHome from './locales/en/home.json';
import svHome from './locales/sv/home.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    dogs: enDogs,
    pregnancy: enPregnancy,
    litters: enLitters,
    settings: enSettings,
    auth: enAuth,
    home: enHome,
  },
  sv: {
    common: svCommon,
    navigation: svNavigation,
    dogs: svDogs,
    pregnancy: svPregnancy,
    litters: svLitters,
    settings: svSettings,
    auth: svAuth,
    home: svHome,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'navigation', 'dogs', 'pregnancy', 'litters', 'settings', 'auth', 'home'],
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false,
    },
  });

export default i18n;
