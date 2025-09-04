export interface SEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalPath: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  robots?: string;
  alternateLanguages?: Array<{
    hreflang: string;
    href: string;
  }>;
}

// SEO configurations for different pages
const SEO_CONFIG: Record<string, SEOData> = {
  home: {
    title: "Breeding Journey - Professional Dog Breeding Management Software",
    description: "A breeder's best friend – plan litters, track pregnancies and litters with ease. Professional dog breeding management software for modern breeders.",
    keywords: "dog breeding software, breeding management, pregnancy tracking, litter management, kennel software, breeding records, puppy tracking",
    canonicalPath: "/",
    ogTitle: "Breeding Journey - Professional Dog Breeding Software",
    ogDescription: "Professional dog breeding management platform for tracking pregnancies, managing litters, and maintaining breeding records.",
    alternateLanguages: [
      { hreflang: "en", href: "https://breedingjourney.com/" },
      { hreflang: "sv", href: "https://breedingjourney.com/sv/" }
    ]
  },
  dogs: {
    title: "My Dogs - Breeding Journey",
    description: "Manage your breeding dogs, track their health records, pedigrees, and breeding history with our comprehensive dog management system.",
    keywords: "dog management, breeding dogs, pedigree tracking, health records, breeding history, kennel management",
    canonicalPath: "/dogs"
  },
  pregnancies: {
    title: "Pregnancy Tracking - Breeding Journey", 
    description: "Track dog pregnancies from breeding to whelping with automated reminders, milestone tracking, and comprehensive pregnancy management tools.",
    keywords: "dog pregnancy tracking, whelping calendar, breeding pregnancy, pregnancy management, dog gestation tracking",
    canonicalPath: "/pregnancies"
  },
  litters: {
    title: "Litter Management - Breeding Journey",
    description: "Manage your dog litters from birth to new homes. Track puppy development, health records, and find perfect families for your puppies.",
    keywords: "litter management, puppy tracking, litter records, puppy development, breeding litters, puppy sales",
    canonicalPath: "/litters"
  },
  calendar: {
    title: "Breeding Calendar - Breeding Journey",
    description: "Stay organized with your breeding calendar. Track heat cycles, breeding dates, whelping dates, and important breeding milestones.",
    keywords: "breeding calendar, heat cycle tracking, breeding schedule, whelping dates, breeding planner",
    canonicalPath: "/calendar"
  },
  settings: {
    title: "Settings - Breeding Journey",
    description: "Customize your breeding management experience with personalized settings, preferences, and account management.",
    keywords: "breeding software settings, account management, kennel preferences, breeding management configuration",
    canonicalPath: "/settings",
    robots: "noindex,follow"
  }
};

export const getSEOData = (key: string): SEOData => {
  return SEO_CONFIG[key] || SEO_CONFIG.home;
};

export const generatePageTitle = (pageTitle?: string, suffix: string = "Breeding Journey"): string => {
  if (!pageTitle) return suffix;
  return `${pageTitle} - ${suffix}`;
};

export const generateMetaDescription = (content: string, maxLength: number = 160): string => {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength - 3).trim() + '...';
};

export const getCanonicalUrl = (path: string): string => {
  const baseUrl = "https://breedingjourney.com";
  return `${baseUrl}${path}`;
};

// Helper for generating structured data
export const generateBreadcrumbStructuredData = (breadcrumbs: Array<{ name: string; url: string }>) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
};

export default {
  getSEOData,
  generatePageTitle,
  generateMetaDescription,
  getCanonicalUrl,
  generateBreadcrumbStructuredData
};