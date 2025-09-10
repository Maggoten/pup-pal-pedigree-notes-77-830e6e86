import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import only the necessary translations for About page
import aboutEn from '@/locales/en/about.json';
import aboutSv from '@/locales/sv/about.json';
import commonEn from '@/locales/en/common.json';
import commonSv from '@/locales/sv/common.json';

// Minimal resources for About page only
const aboutResources = {
  en: {
    about: aboutEn,
    common: commonEn,
  },
  sv: {
    about: aboutSv,
    common: commonSv,
  },
};

// Create separate i18n instance for About page
const aboutI18n = i18n.createInstance();

aboutI18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: aboutResources,
    fallbackLng: 'en',
    debug: false, // Always false for better performance
    
    ns: ['about', 'common'],
    defaultNS: 'about',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    react: {
      useSuspense: false,
    },
  });

export default aboutI18n;