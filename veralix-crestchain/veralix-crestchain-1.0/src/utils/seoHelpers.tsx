import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonical?: string;
}

export const useSEO = ({ title, description, keywords, ogImage, canonical }: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    if (keywords) updateMetaTag('keywords', keywords);

    // Open Graph
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    if (ogImage) updateMetaTag('og:image', ogImage, true);

    // Twitter
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    if (ogImage) updateMetaTag('twitter:image', ogImage);

    // Canonical URL
    if (canonical) {
      let linkElement = document.querySelector('link[rel="canonical"]');
      if (!linkElement) {
        linkElement = document.createElement('link');
        linkElement.setAttribute('rel', 'canonical');
        document.head.appendChild(linkElement);
      }
      linkElement.setAttribute('href', canonical);
    }
  }, [title, description, keywords, ogImage, canonical]);
};

interface StructuredDataProps {
  type: 'Organization' | 'Product' | 'Service' | 'FAQPage' | 'BreadcrumbList';
  data: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

export const organizationSchema = {
  name: 'Veralix',
  description: 'Plataforma de certificación NFT para joyería en Colombia',
  url: 'https://veralix.io',
  logo: 'https://veralix.io/logo.png',
  foundingDate: '2023',
  founders: [
    {
      '@type': 'Person',
      name: 'Veralix Team'
    }
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'CO',
    addressLocality: 'Bogotá'
  },
  sameAs: [
    'https://www.linkedin.com/company/veralix',
    'https://www.instagram.com/veralix',
    'https://twitter.com/veralix'
  ]
};
