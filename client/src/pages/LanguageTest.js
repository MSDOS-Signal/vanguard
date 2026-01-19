import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageTest = () => {
  const { currentLanguage, changeLanguage, t, translations } = useLanguage();

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Language Test Page
          </h1>
          
          {/* Language Selector */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Select Language</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    currentLanguage === lang.code
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="text-sm font-medium">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Language Display */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Current Language: {currentLanguage.toUpperCase()}</h2>
            <div className="text-lg text-gray-600">
              {languages.find(lang => lang.code === currentLanguage)?.name}
            </div>
          </div>

          {/* Translation Test */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Translation Test</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Header Navigation:</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Home:</strong> {t('home')}</div>
                    <div><strong>About Us:</strong> {t('aboutUs')}</div>
                    <div><strong>Products:</strong> {t('products')}</div>
                    <div><strong>News:</strong> {t('news')}</div>
                    <div><strong>Contact:</strong> {t('contactUs')}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Hero Section:</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Title:</strong> {t('heroTitle')}</div>
                    <div><strong>Subtitle:</strong> {t('heroSubtitle')}</div>
                    <div><strong>Description:</strong> {t('heroDescription')}</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Features:</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Quality Guarantee:</strong> {t('qualityGuarantee')}</div>
                    <div><strong>AI Machinery:</strong> {t('aiPoweredMachinery')}</div>
                    <div><strong>High Tech:</strong> {t('highTech')}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Stats:</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Years Experience:</strong> {t('yearsExperience')}</div>
                    <div><strong>Countries Served:</strong> {t('countriesServed')}</div>
                    <div><strong>Happy Customers:</strong> {t('happyCustomers')}</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Actions:</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Explore Products:</strong> {t('exploreProducts')}</div>
                    <div><strong>Get Quote:</strong> {t('getQuote')}</div>
                    <div><strong>Login:</strong> {t('login')}</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Dropdown Items:</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Company Profile:</strong> {t('companyProfile')}</div>
                    <div><strong>CNC Machines:</strong> {t('cncMachines')}</div>
                    <div><strong>Industrial Equipment:</strong> {t('industrialEquipment')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Language Status</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`p-3 rounded-lg border-2 text-center ${
                    translations[lang.code]
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  <div className="text-lg mb-1">{lang.flag}</div>
                  <div className="text-xs font-medium">{lang.name}</div>
                  <div className="text-xs mt-1">
                    {translations[lang.code] ? '✅ Active' : '❌ Missing'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageTest;
