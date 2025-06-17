import React, { useState, useEffect } from 'react';
import { MapPin, Home, ThumbsUp, Shield } from 'lucide-react';
import { apiService } from '../services/api';

interface Feature {
  title: string;
  description: string;
}

const WhyChooseUs: React.FC = () => {
  const [title, setTitle] = useState('Почему выбирают нас');
  const [subtitle, setSubtitle] = useState('Мы создаем идеальные условия для вашего отдыха на Каспийском море, уделяя внимание каждой детали.');
  const [features, setFeatures] = useState<Feature[]>([
    {
      title: 'Лучшая локация',
      description: 'Все наши объекты расположены в живописных местах с прямым доступом к Каспийскому морю и потрясающими видами.'
    },
    {
      title: 'Близость к морю',
      description: 'Дорога до пляжа занимает не более 5 минут пешком от любого нашего объекта недвижимости.'
    },
    {
      title: 'Комфорт и уют',
      description: 'Каждый домик и квартира полностью оборудованы всем необходимым для комфортного отдыха.'
    },
    {
      title: 'Безопасное бронирование',
      description: 'Гарантированное бронирование без скрытых платежей и дополнительных комиссий.'
    }
  ]);

  const icons = [
    <MapPin className="w-8 h-8 text-blue-600" />,
    <Home className="w-8 h-8 text-blue-600" />,
    <ThumbsUp className="w-8 h-8 text-blue-600" />,
    <Shield className="w-8 h-8 text-blue-600" />
  ];

  useEffect(() => {
    const loadContent = async () => {
      try {
        const settings = await apiService.getSettings();
        
        if (settings.whyChooseUsTitle) {
          setTitle(settings.whyChooseUsTitle);
        }
        
        if (settings.whyChooseUsSubtitle) {
          setSubtitle(settings.whyChooseUsSubtitle);
        }
        
        if (settings.whyChooseUsFeatures && Array.isArray(settings.whyChooseUsFeatures)) {
          setFeatures(settings.whyChooseUsFeatures);
        }
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };

    loadContent();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{title}</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                {icons[index] || <Home className="w-8 h-8 text-blue-600" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;