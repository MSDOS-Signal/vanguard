import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Globe, 
  Search, 
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getAdminCategories } from '../../services/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, logout } = useAuth();
  const { currentLanguage, changeLanguage, t } = useLanguage();
  const location = useLocation();

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

  const [productDropdown, setProductDropdown] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const cats = await getAdminCategories();
        const items = (cats || []).filter(c => c.isActive !== false).map(c => ({
          name: c.name,
          href: `/products?category=${encodeURIComponent(c.name)}`
        }));
        setProductDropdown(items);
      } catch (e) {
        setProductDropdown([]);
      }
    })();
  }, []);

  const navigation = [
    { name: t('home'), href: '/', current: location.pathname === '/' },
    { name: t('aboutUs'), href: '/about', current: location.pathname === '/about' },
    { 
      name: t('products'), 
      href: '/products', 
      current: location.pathname === '/products',
      hasDropdown: productDropdown.length > 0,
      dropdownItems: productDropdown
    },
    { name: t('news'), href: '/news', current: location.pathname === '/news' },
    { name: t('contactUs'), href: '/contact', current: location.pathname === '/contact' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar - Hidden on scroll for cleaner look */}
      <div className={`bg-gray-900 text-white transition-all duration-300 overflow-hidden ${
        isScrolled ? 'h-0 py-0 opacity-0' : 'h-10 py-2 opacity-100'
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between text-xs tracking-wider uppercase">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-secondary-400" />
                <span>{t('companyPhone')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-secondary-400" />
                <span>{t('companyEmail')}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-secondary-400" />
                <span>{t('companyAddress')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`fixed w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg py-3 top-0' 
          : 'bg-transparent py-6 top-10' // Offset for top bar
      }`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className={`w-12 h-12 flex items-center justify-center transition-all duration-500 transform group-hover:rotate-180 ${
                isScrolled ? 'bg-primary-900 text-white' : 'bg-white text-primary-900'
              }`}>
                <span className="font-serif font-bold text-2xl">V</span>
              </div>
              <div className="hidden sm:block">
                <div className={`text-2xl font-serif font-bold tracking-widest transition-colors duration-300 ${
                  isScrolled ? 'text-primary-900' : 'text-white'
                }`}>
                  VANGUARD
                </div>
                <div className={`text-[0.65rem] uppercase tracking-[0.3em] transition-colors duration-300 ${
                  isScrolled ? 'text-primary-600' : 'text-white/80'
                }`}>
                  Machinery Trading
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navigation.map((item) => (
                <div key={item.name} className="relative group">
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-1 text-sm font-medium tracking-widest uppercase transition-all duration-300 relative py-2 ${
                      item.current
                        ? isScrolled ? 'text-secondary-600' : 'text-white'
                        : isScrolled 
                          ? 'text-primary-900 hover:text-secondary-600' 
                          : 'text-white/80 hover:text-white'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.hasDropdown && <ChevronDown className="w-3 h-3 opacity-70 group-hover:rotate-180 transition-transform duration-300" />}
                    
                    {/* Hover Underline Effect */}
                    <span className={`absolute bottom-0 left-0 w-full h-[2px] transform origin-left transition-transform duration-300 ${
                      item.current ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    } ${isScrolled ? 'bg-secondary-600' : 'bg-white'}`} />
                  </Link>

                  {/* Dropdown */}
                  {item.hasDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-none shadow-xl border-t-2 border-secondary-500 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50">
                      <div className="py-2">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block px-6 py-3 text-sm text-gray-600 hover:text-white hover:bg-primary-900 transition-colors duration-200"
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:block">{languages.find(lang => lang.code === currentLanguage)?.name || 'ENGLISH'}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {isLanguageOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                    >
                      <div className="py-2">
                        {languages.map((language) => (
                          <button
                            key={language.code}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-gray-50 flex items-center space-x-3"
                            onClick={() => {
                              changeLanguage(language.code);
                              setIsLanguageOpen(false);
                            }}
                          >
                            <span className="text-lg">{language.flag}</span>
                            <span>{language.name}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`transition-colors duration-300 ${
                  isScrolled ? 'text-primary-900 hover:text-secondary-600' : 'text-white hover:text-secondary-400'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Auth */}
              {user ? (
                <div className="relative group">
                  <button className={`flex items-center space-x-2 font-medium transition-colors duration-300 ${
                    isScrolled ? 'text-primary-900' : 'text-white'
                  }`}>
                    <span>{user.username}</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-none shadow-xl border-t-2 border-secondary-500 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                    <div className="py-1">
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-secondary-600 transition-colors"
                        >
                          {t('dashboard')}
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-6 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-secondary-600 transition-colors"
                      >
                        {t('logout')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className={`px-6 py-2.5 text-sm font-medium tracking-wide transition-all duration-300 border ${
                    isScrolled 
                      ? 'border-primary-900 text-primary-900 hover:bg-primary-900 hover:text-white' 
                      : 'border-white text-white hover:bg-white hover:text-primary-900'
                  }`}
                >
                  {t('login')}
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`lg:hidden p-2 transition-colors duration-300 ${
                  isScrolled ? 'text-primary-900' : 'text-white'
                }`}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white border-t border-gray-200"
            >
              <div className="px-4 py-6 space-y-4">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={`block px-3 py-2 rounded-md text-base font-medium ${
                        item.current
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                    {item.hasDropdown && item.current && (
                      <div className="ml-4 mt-2 space-y-2">
                        {item.dropdownItems.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block px-3 py-2 text-sm text-gray-600 hover:text-primary-600"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {dropdownItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-32"
            onClick={() => setIsSearchOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-lg shadow-xl p-6">
                <div className="flex items-center space-x-4">
                  <Search className="w-6 h-6 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('search')}
                    className="flex-1 text-lg outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
};

export default Header;
