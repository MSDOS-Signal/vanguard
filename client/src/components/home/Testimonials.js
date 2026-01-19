import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
  const { t } = useLanguage();
  const testimonials = [
    {
      id: 1,
      name: "John Smith",
      position: t('labelTitle') ? 'Production Manager' : 'Production Manager',
      company: "Global Manufacturing Co.",
      content: "Vanguard Machinery has been our trusted partner for over 5 years. Their CNC machines have significantly improved our production efficiency.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 2,
      name: "Maria Garcia",
      position: "Operations Director",
      company: "Precision Engineering Ltd.",
      content: "The quality of their industrial equipment is outstanding. Their after-sales support is exceptional and always available when we need it.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face"
    },
    {
      id: 3,
      name: "David Chen",
      position: "CEO",
      company: "Advanced Automation Systems",
      content: "We've purchased multiple automation systems from Vanguard. Their expertise and reliability make them our go-to supplier for all machinery needs.",
      rating: 5,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('whatClientsSay')}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('clientsSaySubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex -space-x-2 mr-4">
                  <img
                    className="w-12 h-12 rounded-full border-2 border-white"
                    src={testimonial.image}
                    alt={testimonial.name}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.position}</p>
                  <p className="text-sm text-blue-600">{testimonial.company}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <div className="relative">
                <Quote className="w-6 h-6 text-blue-200 absolute -top-2 -left-2" />
                <p className="text-gray-600 italic pl-4">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
