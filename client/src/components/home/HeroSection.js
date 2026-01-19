import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, Play } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const HeroSection = () => {
  const { t } = useLanguage();
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/30 z-10" />
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat transform scale-105 animate-float"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-white h-full flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-4xl"
        >
          {/* Decorative Tag */}
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: 'auto' }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block overflow-hidden mb-6"
          >
            <span className="inline-block py-2 px-4 bg-secondary-500/20 border border-secondary-500 text-secondary-400 text-sm font-bold tracking-widest uppercase backdrop-blur-sm rounded">
              ISO 9001 Certified Manufacturer
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1 
            className="text-6xl md:text-8xl font-serif font-bold mb-8 leading-none tracking-tight drop-shadow-2xl"
          >
            <span className="block text-white">
              {t('heroTitle')}
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-secondary-300 to-secondary-500 mt-2">
              {t('heroSubtitle')}
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl mb-12 text-gray-200 max-w-2xl font-light leading-relaxed border-l-4 border-secondary-500 pl-6"
          >
            {t('heroDescription')}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-6"
          >
            <Link
              to="/products"
              className="group relative px-8 py-4 bg-secondary-500 text-white font-bold tracking-widest uppercase text-sm overflow-hidden transition-all duration-300 hover:bg-secondary-600 shadow-lg hover:shadow-secondary-500/50 rounded-sm"
            >
              <span className="relative z-10 flex items-center">
                {t('exploreProducts')}
                <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            
            <Link
              to="/contact"
              className="group px-8 py-4 bg-white/10 border border-white/30 text-white font-bold tracking-widest uppercase text-sm transition-all duration-300 hover:bg-white hover:text-primary-900 backdrop-blur-sm rounded-sm"
            >
              {t('getQuote')}
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20"
      >
        <span className="text-white/50 text-xs uppercase tracking-widest mb-2">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
