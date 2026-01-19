import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const CallToAction = () => {
  const { t } = useLanguage();
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            {t('ctaTitle')}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t('ctaSubtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {t('ctaGetFreeQuote')}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            
            <a
              href="tel:+862112345678"
              className="inline-flex items-center px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              <Phone className="w-5 h-5 mr-2" />
              {t('ctaCallNow')}
            </a>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
            <div className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              <span>{t('companyEmail')}</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              <span>{t('companyPhone')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
