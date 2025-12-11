
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import all translation files
import enAuth from './locales/en/auth.json';
import svAuth from './locales/sv/auth.json';
import noAuth from './locales/no/auth.json';
import enCommon from './locales/en/common.json';
import svCommon from './locales/sv/common.json';
import noCommon from './locales/no/common.json';
import enHome from './locales/en/home.json';
import svHome from './locales/sv/home.json';
import noHome from './locales/no/home.json';
import enDogs from './locales/en/dogs.json';
import svDogs from './locales/sv/dogs.json';
import noDogs from './locales/no/dogs.json';
import enLitters from './locales/en/litters.json';
import svLitters from './locales/sv/litters.json';
import noLitters from './locales/no/litters.json';
import enPlannedLitters from './locales/en/plannedLitters.json';
import svPlannedLitters from './locales/sv/plannedLitters.json';
import noPlannedLitters from './locales/no/plannedLitters.json';
import enPregnancy from './locales/en/pregnancy.json';
import svPregnancy from './locales/sv/pregnancy.json';
import noPregnancy from './locales/no/pregnancy.json';
import enSettings from './locales/en/settings.json';
import svSettings from './locales/sv/settings.json';
import noSettings from './locales/no/settings.json';
import enNavigation from './locales/en/navigation.json';
import svNavigation from './locales/sv/navigation.json';
import noNavigation from './locales/no/navigation.json';
import enAbout from './locales/en/about.json';
import svAbout from './locales/sv/about.json';
import noAbout from './locales/no/about.json';
import enPrivacy from './locales/en/privacy.json';
import svPrivacy from './locales/sv/privacy.json';
import noPrivacy from './locales/no/privacy.json';
import enTerms from './locales/en/terms.json';
import svTerms from './locales/sv/terms.json';
import noTerms from './locales/no/terms.json';
import enFaq from './locales/en/faq.json';
import svFaq from './locales/sv/faq.json';
import noFaq from './locales/no/faq.json';
import enContact from './locales/en/contact.json';
import svContact from './locales/sv/contact.json';
import noContact from './locales/no/contact.json';

const resources = {
  en: {
    auth: enAuth,
    common: enCommon,
    home: enHome,
    dogs: enDogs,
    litters: enLitters,
    plannedLitters: enPlannedLitters,
    pregnancy: enPregnancy,
    settings: enSettings,
    navigation: enNavigation,
    about: enAbout,
    privacy: enPrivacy,
    terms: enTerms,
    faq: enFaq,
    contact: enContact
  },
  sv: {
    auth: svAuth,
    common: svCommon,
    home: svHome,
    dogs: svDogs,
    litters: svLitters,
    plannedLitters: svPlannedLitters,
    pregnancy: svPregnancy,
    settings: svSettings,
    navigation: svNavigation,
    about: svAbout,
    privacy: svPrivacy,
    terms: svTerms,
    faq: svFaq,
    contact: svContact
  },
  no: {
    auth: noAuth,
    common: noCommon,
    home: noHome,
    dogs: noDogs,
    litters: noLitters,
    plannedLitters: noPlannedLitters,
    pregnancy: noPregnancy,
    settings: noSettings,
    navigation: noNavigation,
    about: noAbout,
    privacy: noPrivacy,
    terms: noTerms,
    faq: noFaq,
    contact: noContact
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    ns: ['common', 'auth', 'home', 'dogs', 'litters', 'plannedLitters', 'pregnancy', 'settings', 'navigation', 'about', 'privacy', 'terms', 'faq', 'contact'],
    defaultNS: 'common',
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    interpolation: {
      escapeValue: false,
    },
    
    saveMissing: false,
    load: 'languageOnly',
    react: {
      useSuspense: false,
    },
  });

export default i18n;
