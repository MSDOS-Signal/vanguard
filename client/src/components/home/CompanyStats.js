import React from 'react';
import { Users, Globe, Award, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const CompanyStats = () => {
  const { t } = useLanguage();
  const stats = [
    {
      icon: Users,
      number: "165+",
      label: t('statCountriesServed'),
      description: t('statCountriesDesc')
    },
    {
      icon: Globe,
      number: "20+",
      label: t('statYearsExperience'),
      description: t('statYearsDesc')
    },
    {
      icon: Award,
      number: "10,000+",
      label: t('statMachinesDelivered'),
      description: t('statMachinesDesc')
    },
    {
      icon: Clock,
      number: "24/7",
      label: t('statSupportAvailable'),
      description: t('statSupportDesc')
    }
  ];

  return (
    <section className="py-16 bg-blue-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('trustedByManufacturers')}
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            {t('trustedBySubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-white bg-opacity-20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-lg font-semibold text-white mb-2">
                {stat.label}
              </div>
              <div className="text-blue-100">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CompanyStats;
