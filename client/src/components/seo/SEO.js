import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '../../contexts/LanguageContext';
import { getSeoConfig } from '../../services/api';

const SEO = ({ 
  title, 
  description, 
  keywords = [], 
  image, 
  type = 'website',
  url
}) => {
  const { currentLanguage } = useLanguage();
  const [config, setConfig] = useState({
    siteTitle: 'Vanguard Machinery',
    siteDescription: 'Leading manufacturer of cold roll forming machines with 15+ years of expertise, serving 165+ countries worldwide.',
    siteKeywords: 'cold roll forming, machinery, manufacturing, industrial equipment, CNC machines',
    ogImage: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSeoConfig();
        if (data && Object.keys(data).length > 0) {
          setConfig(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (error) {
        // Silently fail and use defaults
        console.warn('Failed to load SEO config, using defaults');
      }
    };
    fetchConfig();
  }, []);

  const siteName = config.siteTitle;
  const baseUrl = 'https://vanguardmachinery.com';
  
  const metaTitle = title ? `${title} | ${siteName}` : siteName;
  const metaDescription = description || config.siteDescription;
  
  // Combine default keywords with page-specific keywords
  const defaultKeywordsArray = config.siteKeywords ? config.siteKeywords.split(',').map(k => k.trim()) : [];
  const combinedKeywords = [...new Set([...keywords, ...defaultKeywordsArray])];
  const metaKeywords = combinedKeywords.join(', ');
  
  const metaImage = image || config.ogImage;
  const metaUrl = url ? `${baseUrl}${url}` : baseUrl;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLanguage} />
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={currentLanguage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={metaUrl} />
      <meta name="twitter:title" content={metaTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />

      {/* Canonical */}
      <link rel="canonical" href={metaUrl} />
    </Helmet>
  );
};

export default SEO;
