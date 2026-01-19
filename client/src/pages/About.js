import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/seo/SEO';
import { 
  Users, 
  Award, 
  Globe, 
  TrendingUp, 
  Shield, 
  Heart,
  CheckCircle,
  Star
} from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const stats = [
    { icon: Users, number: '500+', label: t('aboutStatsTeamMembers') },
    { icon: Globe, number: '165+', label: t('aboutStatsCountriesServed') },
    { icon: Award, number: '50+', label: t('aboutStatsIndustryAwards') },
    { icon: TrendingUp, number: '20+', label: t('aboutStatsYearsExperience') }
  ];

  const values = [
    {
      icon: Shield,
      title: t('aboutValueQualityAssuranceTitle'),
      description: t('aboutValueQualityAssuranceDesc')
    },
    {
      icon: Heart,
      title: t('aboutValueCustomerFocusTitle'),
      description: t('aboutValueCustomerFocusDesc')
    },
    {
      icon: CheckCircle,
      title: t('aboutValueReliabilityTitle'),
      description: t('aboutValueReliabilityDesc')
    },
    {
      icon: Star,
      title: t('aboutValueInnovationTitle'),
      description: t('aboutValueInnovationDesc')
    }
  ];

  const timeline = [
    {
      year: '2003',
      title: t('ourStory'),
      description: t('companyIntro')
    },
    {
      year: '2008',
      title: t('ourJourney'),
      description: t('trustedBySubtitle')
    },
    {
      year: '2015',
      title: t('aboutValueInnovationTitle'),
      description: t('aboutValueInnovationDesc')
    },
    {
      year: '2023',
      title: t('trustedByManufacturers'),
      description: t('clientsSaySubtitle')
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={t('aboutUs')} 
        description={t('aboutSubtitle') || "Learn about Vanguard Machinery's history, values, and commitment to excellence."}
        url="/about"
      />
      {/* Hero Section */}
      <section className="relative py-32 bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-primary-900/80 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center animate-pulse-slow"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1565008447742-97f6f38c985c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')` }}
          />
        </div>
        <div className="container relative z-20 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 tracking-tight">{t('aboutTitle')}</h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 font-light leading-relaxed">
              {t('aboutSubtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-16 z-30 pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-xl text-center hover:transform hover:-translate-y-2 transition-all duration-300 border-b-4 border-primary-600"
              >
                <div className="bg-primary-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-8 h-8 text-primary-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2 font-serif">{stat.number}</div>
                <div className="text-gray-600 font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">{t('companyProfile')}</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                {t('companyIntro')}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">{t('aboutValuesTitle')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              These core values guide everything we do and shape our relationships with customers, 
              partners, and employees worldwide.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-100 group"
              >
                <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-md group-hover:scale-110 transition-transform duration-300">
                  <value.icon className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-24 bg-neutral-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">{t('ourJourney')}</h2>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-primary-200 via-primary-400 to-primary-200 h-full"></div>
              
              {timeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className={`relative flex items-center mb-16 ${
                    index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-6 h-6 bg-primary-600 rounded-full border-4 border-white shadow-lg z-10"></div>
                  
                  {/* Content */}
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-12 text-right' : 'pl-12 text-left'}`}>
                    <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 group">
                      <span className="inline-block px-4 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-bold mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                        {item.year}
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
};

export default About;
