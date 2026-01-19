import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import { ChevronRight, Shield, Zap, Globe, Factory, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import CompanyStats from '../components/home/CompanyStats';
import ServiceHighlights from '../components/home/ServiceHighlights';
import Testimonials from '../components/home/Testimonials';
import CallToAction from '../components/home/CallToAction';
import { getFeaturedProducts } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import SEO from '../components/seo/SEO';

const Home = () => {
  const { data: featuredProducts, isLoading } = useQuery('featuredProducts', getFeaturedProducts);
  const { t } = useLanguage();

  const features = [
    {
      icon: Shield,
      title: t('qualityGuarantee'),
      description: t('qualityGuaranteeDesc')
    },
    {
      icon: Zap,
      title: t('aiPoweredMachinery'),
      description: t('aiPoweredMachineryDesc')
    },
    {
      icon: Globe,
      title: t('globalReach'),
      description: t('globalReachDesc')
    }
  ];

  const stats = [
    { number: '15+', label: t('yearsExperience'), icon: Award },
    { number: '165+', label: t('statCountriesServed'), icon: Globe },
    { number: '1000+', label: t('happyCustomers'), icon: Users },
    { number: '500+', label: t('machineryTypes'), icon: Factory }
  ];

  return (
    <div className="min-h-screen">
      <SEO 
        title="Home"
        description="Vanguard Machinery - Global leader in cold roll forming machinery and industrial solutions."
      />
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-24 bg-surface">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-primary-900 mb-6 tracking-tight">
              {t('whyChooseVanguard')}
            </h2>
            <div className="w-24 h-1 bg-secondary-400 mx-auto mb-8 rounded-full" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
              {t('whyChooseSubtitle')}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-10 shadow-soft hover:shadow-strong transition-all duration-500 group border-t-4 border-transparent hover:border-secondary-400"
              >
                <div className="w-20 h-20 bg-primary-50 rounded-none flex items-center justify-center mb-8 group-hover:bg-primary-900 transition-colors duration-500">
                  <feature.icon className="w-10 h-10 text-primary-900 group-hover:text-secondary-400 transition-colors duration-500" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-primary-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Stats */}
      <CompanyStats stats={stats} />

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('featuredMachinery')}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('featuredMachinerySubtitle')}
            </p>
          </motion.div>

          <FeaturedProducts products={featuredProducts} isLoading={isLoading} />

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors duration-300 group"
            >
              {t('viewAllProducts')}
              <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Service Highlights */}
      <ServiceHighlights />

      {/* Testimonials */}
      <Testimonials />

      {/* Call to Action */}
      <CallToAction />
    </div>
  );
};

export default Home;
