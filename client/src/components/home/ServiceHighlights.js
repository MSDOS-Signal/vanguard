import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  Truck, 
  Shield, 
  Headphones, 
  Wrench, 
  Globe, 
  Award 
} from 'lucide-react';

const ServiceHighlights = () => {
  const { t } = useLanguage();
  const services = [
    {
      icon: Truck,
      title: t('serviceGlobalShipping'),
      description: t('serviceGlobalShippingDesc')
    },
    {
      icon: Shield,
      title: t('serviceQualityGuarantee'),
      description: t('serviceQualityGuaranteeDesc')
    },
    {
      icon: Headphones,
      title: t('service247Support'),
      description: t('service247SupportDesc')
    },
    {
      icon: Wrench,
      title: t('serviceInstallationTraining'),
      description: t('serviceInstallationTrainingDesc')
    },
    {
      icon: Globe,
      title: t('serviceInternationalService'),
      description: t('serviceInternationalServiceDesc')
    },
    {
      icon: Award,
      title: t('serviceCertifiedEquipment'),
      description: t('serviceCertifiedEquipmentDesc')
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('servicesTitle')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('servicesSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <service.icon className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {service.title}
              </h3>
              <p className="text-gray-600">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceHighlights;
