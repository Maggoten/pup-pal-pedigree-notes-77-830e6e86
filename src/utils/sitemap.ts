// Sitemap generation utilities
export const generateSitemap = () => {
  const baseUrl = "https://breedingjourney.com";
  const currentDate = new Date().toISOString().split('T')[0];
  
  const routes = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/dogs", priority: "0.9", changefreq: "weekly" },
    { path: "/pregnancies", priority: "0.9", changefreq: "weekly" },
    { path: "/litters", priority: "0.9", changefreq: "weekly" },
    { path: "/calendar", priority: "0.8", changefreq: "weekly" },
    { path: "/settings", priority: "0.3", changefreq: "monthly" }
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${routes.map(route => `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${route.path}"/>
    <xhtml:link rel="alternate" hreflang="sv" href="${baseUrl}/sv${route.path}"/>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
};

export const generateRobotsTxt = () => {
  const baseUrl = "https://breedingjourney.com";
  
  return `# Robots.txt for Breeding Journey
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot  
Allow: /
Crawl-delay: 1

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Crawl-delay: 2

# Sitemap location
Sitemap: ${baseUrl}/sitemap.xml

# Additional directives
Host: ${baseUrl}`;
};

export default {
  generateSitemap,
  generateRobotsTxt
};