import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import SEO from '../components/seo/SEO';
import { submitContactForm } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  CheckCircle,
  MessageCircle
} from 'lucide-react';

const Contact = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const product = params.get('product');
    if (product) {
      setFormData(prev => ({
        ...prev,
        subject: prev.subject || `${t('inquireProduct')}${product}`,
        message: prev.message || `${t('inquireProductMessage')}${product}`
      }));
    }
  }, [location.search]);

  // Initialize Baidu Maps
  useEffect(() => {
    const initBaiduMap = () => {
      if (window.BMap && mapRef.current) {
        const map = new window.BMap.Map(mapRef.current);
        const point = new window.BMap.Point(116.621809, 38.077487);
        map.centerAndZoom(point, 15);
        
        // Add marker
        const marker = new window.BMap.Marker(point);
        map.addOverlay(marker);
        
        // Add info window
        const infoWindow = new window.BMap.InfoWindow("我们的位置<br/>经度：116.621809<br/>纬度：38.077487");
        marker.addEventListener("click", function(){
          map.openInfoWindow(infoWindow, point);
        });
        
        // Enable map controls
        map.addControl(new window.BMap.NavigationControl());
        map.addControl(new window.BMap.ScaleControl());
        map.addControl(new window.BMap.OverviewMapControl());
        map.addControl(new window.BMap.MapTypeControl());
        map.enableScrollWheelZoom(true);
      }
    };

    // Load Baidu Maps API
    if (!window.BMap) {
      const script = document.createElement('script');
      script.src = 'https://api.map.baidu.com/api?v=3.0&ak=nvEb0EWXolaqQ8nysdFotaqRfLlZ5Ye3&callback=initBaiduMap';
      script.async = true;
      window.initBaiduMap = initBaiduMap;
      document.head.appendChild(script);
    } else {
      initBaiduMap();
    }

    return () => {
      if (window.initBaiduMap) {
        delete window.initBaiduMap;
      }
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitContactForm(formData);
      setIsSubmitted(true);
      setFormData({ name: '', email: '', company: '', phone: '', subject: '', message: '' });
    } catch (err) {
      alert(err.response?.data?.message || '提交失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: t('phone'),
      details: ['+86-18713085148'],
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: MessageCircle,
      title: t('whatsapp'),
      details: ['+86-18713085148'],
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Mail,
      title: t('email'),
      details: [t('companyEmail')],
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: MapPin,
      title: t('address'),
      details: [t('longitude'), t('latitude'), t('china')],
      color: 'bg-orange-100 text-orange-600'
    },
    {
      icon: Clock,
      title: t('businessHours'),
      details: [t('mondayFriday'), t('saturday')],
      color: 'bg-indigo-100 text-indigo-600'
    }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md mx-4"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('messageSent')}</h2>
          <p className="text-gray-600 mb-6">
            {t('thankYouForContacting')}
          </p>
          <div className="flex flex-col space-y-3">
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('sendAnotherMessage')}
            </button>
            {user && (
              <button
                onClick={() => navigate('/chat')}
                className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                进入在线聊天室
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO 
        title={t('contactUs')} 
        description={t('contactDescription') || "Get in touch with Vanguard Machinery for inquiries, support, and collaboration."}
        url="/contact"
      />
      {/* Hero Section */}
      <section className="relative py-32 bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-primary-900/90 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1423666639041-f56000c27a9a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')` }}
          />
        </div>
        <div className="container relative z-20 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8">
              {t('contactUs')}
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 font-light">
              {t('contactDescription')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-24 relative -mt-20 z-30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 group"
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110 ${info.color.replace('bg-', 'bg-opacity-10 bg-').replace('text-', 'text-')}`}>
                    <info.icon className={`w-7 h-7 ${info.color.split(' ')[1]}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 font-serif">{info.title}</h3>
                  <div className="space-y-2">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-gray-600 font-medium leading-relaxed">
                        {detail}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form & Map */}
            <div className="lg:col-span-2 space-y-8">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100"
              >
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">{t('sendMessage')}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('name')}</label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder={t('namePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('email')}</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder={t('emailPlaceholder')}
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder={t('phonePlaceholder')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('company')}</label>
                      <input
                        type="text"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                        placeholder={t('companyPlaceholder')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('subject')}</label>
                    <input
                      type="text"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                      placeholder={t('subjectPlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('message')}</label>
                    <textarea
                      name="message"
                      required
                      rows="6"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                      placeholder={t('messagePlaceholder')}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary-500/30 flex items-center justify-center"
                  >
                    {isSubmitting ? (
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        {t('sendMessage')}
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Map */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden h-[400px] border border-gray-100"
              >
                <div ref={mapRef} className="w-full h-full"></div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Contact;
