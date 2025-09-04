import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: any;
}

const StructuredData = ({ data }: StructuredDataProps) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

// Predefined structured data schemas for dog breeding industry
export const LocalBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Breeding Journey",
  "description": "A breeder's best friend – plan litters, track pregnancies and litters with ease.",
  "url": "https://breedingjourney.com",
  "logo": "https://breedingjourney.com/OG-image.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "availableLanguage": ["English", "Swedish"]
  },
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "SE"
  },
  "serviceArea": {
    "@type": "Place",
    "name": "Worldwide"
  }
};

export const SoftwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Breeding Journey",
  "applicationCategory": "PetCareApplication",
  "operatingSystem": "Web Browser",
  "description": "Professional dog breeding management software for tracking pregnancies, litters, and breeding records.",
  "url": "https://breedingjourney.com",
  "screenshot": "https://breedingjourney.com/OG-image.png",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "featureList": [
    "Pregnancy tracking",
    "Litter management", 
    "Breeding records",
    "Calendar integration",
    "Reminder system"
  ]
};

export const OrganizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Breeding Journey",
  "url": "https://breedingjourney.com",
  "logo": "https://breedingjourney.com/OG-image.png",
  "description": "Leading dog breeding management software platform.",
  "knowsAbout": [
    "Dog Breeding",
    "Pregnancy Tracking",
    "Litter Management",
    "Pet Care Software"
  ]
};

export const FAQSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Breeding Journey?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Breeding Journey is a comprehensive dog breeding management platform that helps breeders track pregnancies, manage litters, and maintain detailed breeding records."
      }
    },
    {
      "@type": "Question", 
      "name": "How does pregnancy tracking work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our pregnancy tracking feature allows you to monitor your dog's pregnancy from breeding to whelping, with automated reminders and milestone tracking."
      }
    }
  ]
};

export const ArticleSchema = (title: string, description: string, datePublished: string, author: string = "Breeding Journey") => ({
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": title,
  "description": description,
  "author": {
    "@type": "Organization",
    "name": author
  },
  "publisher": {
    "@type": "Organization",
    "name": "Breeding Journey",
    "logo": {
      "@type": "ImageObject",
      "url": "https://breedingjourney.com/OG-image.png"
    }
  },
  "datePublished": datePublished,
  "dateModified": datePublished
});

export const ProductSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Breeding Journey Software",
  "description": "Professional dog breeding management software platform",
  "brand": {
    "@type": "Brand",
    "name": "Breeding Journey"
  },
  "category": "Pet Care Software",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  }
};

export default StructuredData;