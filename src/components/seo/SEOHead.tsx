import { Helmet } from 'react-helmet-async';
import { getSEOData, SEOData } from '@/utils/seo';

interface SEOHeadProps {
  seoKey?: string;
  customSEO?: Partial<SEOData>;
}

const SEOHead = ({ seoKey, customSEO }: SEOHeadProps) => {
  const seoData = seoKey ? getSEOData(seoKey) : getSEOData('home');
  const finalSEO = { ...seoData, ...customSEO };

  return (
    <Helmet>
      <title>{finalSEO.title}</title>
      <meta name="description" content={finalSEO.description} />
      <meta name="keywords" content={finalSEO.keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={`https://breedingjourney.com${finalSEO.canonicalPath}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={finalSEO.ogTitle || finalSEO.title} />
      <meta property="og:description" content={finalSEO.ogDescription || finalSEO.description} />
      <meta property="og:url" content={`https://breedingjourney.com${finalSEO.canonicalPath}`} />
      <meta property="og:type" content={finalSEO.ogType || 'website'} />
      <meta property="og:image" content={finalSEO.ogImage || '/OG-image.png'} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalSEO.ogTitle || finalSEO.title} />
      <meta name="twitter:description" content={finalSEO.ogDescription || finalSEO.description} />
      <meta name="twitter:image" content={finalSEO.ogImage || '/OG-image.png'} />
      
      {/* Additional meta tags */}
      <meta name="robots" content={finalSEO.robots || 'index,follow'} />
      {finalSEO.alternateLanguages && (
        finalSEO.alternateLanguages.map((lang) => (
          <link
            key={lang.hreflang}
            rel="alternate"
            hrefLang={lang.hreflang}
            href={lang.href}
          />
        ))
      )}
    </Helmet>
  );
};

export default SEOHead;