import React from 'react';
import { MapPin, Home, ThumbsUp, Shield } from 'lucide-react';

const features = [
  {
    icon: <MapPin className="w-8 h-8 text-blue-600" />,
    title: 'Лучшая локация',
    description: 'Все наши объекты расположены в живописных местах с прямым доступом к Каспийскому морю и потрясающими видами.'
  },
  {
    icon: <Home className="w-8 h-8 text-blue-600" />,
    title: 'Близость к морю',
    description: 'Дорога до пляжа занимает не более 5 минут пешком от любого нашего объекта недвижимости.'
  },
  {
    icon: <ThumbsUp className="w-8 h-8 text-blue-600" />,
    title: 'Комфорт и уют',
    description: 'Каждый домик и квартира полностью оборудованы всем необходимым для комфортного отдыха.'
  },
  {
    icon: <Shield className="w-8 h-8 text-blue-600" />,
    title: 'Безопасное бронирование',
    description: 'Гарантированное бронирование без скрытых платежей и дополнительных комиссий.'
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Почему выбирают нас</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Мы создаем идеальные условия для вашего отдыха на Каспийском море, уделяя внимание каждой детали.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl mb-6">
                {feature.icon}
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