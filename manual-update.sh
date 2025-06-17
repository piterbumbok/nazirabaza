#!/bin/bash

# Ручное обновление файлов с изменениями
echo "🔧 Применяем изменения вручную..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

# Обновляем Hero.tsx с рабочей кнопкой
echo "🔄 Исправляем кнопку Найти жилье..."
cat > src/components/Hero.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Hero: React.FC = () => {
  const navigate = useNavigate();
  const [heroContent, setHeroContent] = useState({
    heroTitle: 'Уютные домики и квартиры на берегу каспия',
    heroSubtitle: 'Отдохните от городской суеты в наших комфортабельных объектах с живописным видом на Каспийское море'
  });

  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.heroTitle || settings.heroSubtitle) {
          setHeroContent({
            heroTitle: settings.heroTitle || heroContent.heroTitle,
            heroSubtitle: settings.heroSubtitle || heroContent.heroSubtitle
          });
        }
      } catch (error) {
        console.error('Error loading hero content:', error);
      }
    };

    loadHeroContent();
  }, []);

  const handleFindAccommodation = () => {
    navigate('/cabins');
  };

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          {heroContent.heroTitle}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 leading-relaxed">
          {heroContent.heroSubtitle}
        </p>
        <div className="flex justify-center">
          <button 
            onClick={handleFindAccommodation}
            className="px-10 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
          >
            Найти жилье
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;
EOF

# Обновляем Header.tsx с рабочими ссылками
echo "🔄 Обновляем Header.tsx..."
sed -i "s|{ name: 'О нас', path: '#' }|{ name: 'О нас', path: '/about' }|g" src/components/Header.tsx
sed -i "s|{ name: 'Контакты', path: '#' }|{ name: 'Контакты', path: '/contacts' }|g" src/components/Header.tsx

# Обновляем Footer.tsx с динамическим контентом
echo "🔄 Обновляем Footer.tsx..."
cat > src/components/Footer.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { Home, Phone, Mail, MapPin } from 'lucide-react';
import { apiService } from '../services/api';

const Footer: React.FC = () => {
  const [footerContent, setFooterContent] = useState({
    siteName: 'В гости',
    footerDescription: 'Уютные домики и современные квартиры на берегу моря для незабываемого отдыха. Идеальное место для спокойного отдыха и наслаждения морским пейзажем.',
    footerPhone: '+7 (999) 123-45-67',
    footerEmail: 'info@vgosti.ru',
    footerAddress: 'Приморский бульвар, 123, Морской город, Россия'
  });

  useEffect(() => {
    const loadFooterContent = async () => {
      try {
        const settings = await apiService.getSettings();
        if (Object.keys(settings).length > 0) {
          setFooterContent(prev => ({
            siteName: settings.siteName || prev.siteName,
            footerDescription: settings.footerDescription || prev.footerDescription,
            footerPhone: settings.footerPhone || prev.footerPhone,
            footerEmail: settings.footerEmail || prev.footerEmail,
            footerAddress: settings.footerAddress || prev.footerAddress
          }));
        }
      } catch (error) {
        console.error('Error loading footer content:', error);
      }
    };

    loadFooterContent();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">{footerContent.siteName}</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {footerContent.footerDescription}
            </p>
            <div className="flex space-x-4">
              {['facebook', 'instagram', 'twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Навигация</h3>
            <ul className="space-y-3">
              {['Главная', 'Каталог', 'Бронирование', 'Галерея', 'О нас', 'Контакты'].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-1 text-blue-400" />
                <span className="text-gray-300">{footerContent.footerAddress}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-gray-300">{footerContent.footerPhone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-gray-300">{footerContent.footerEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {footerContent.siteName}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
EOF

# Обновляем WhyChooseUs.tsx с динамическим контентом
echo "🔄 Обновляем WhyChooseUs.tsx..."
cat > src/components/WhyChooseUs.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import { MapPin, Home, ThumbsUp, Shield } from 'lucide-react';
import { apiService } from '../services/api';

interface Feature {
  title: string;
  description: string;
}

const WhyChooseUs: React.FC = () => {
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
    const loadFeatures = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.whyChooseUsFeatures && Array.isArray(settings.whyChooseUsFeatures)) {
          setFeatures(settings.whyChooseUsFeatures);
        }
      } catch (error) {
        console.error('Error loading features:', error);
      }
    };

    loadFeatures();
  }, []);

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
EOF

# Обновляем HomePage.tsx с динамической галереей
echo "🔄 Обновляем HomePage.tsx..."
cat > src/pages/HomePage.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedCabins from '../components/FeaturedCabins';
import PhotoGallery from '../components/PhotoGallery';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { apiService } from '../services/api';

const HomePage: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState([
    'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg',
    'https://images.pexels.com/photos/4846293/pexels-photo-4846293.jpeg',
    'https://images.pexels.com/photos/4846265/pexels-photo-4846265.jpeg',
    'https://images.pexels.com/photos/4846437/pexels-photo-4846437.jpeg',
    'https://images.pexels.com/photos/4846436/pexels-photo-4846436.jpeg'
  ]);

  const [phone, setPhone] = useState('+7 965 411-15-55');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.galleryImages && Array.isArray(settings.galleryImages)) {
          setGalleryImages(settings.galleryImages);
        }
        if (settings.phone) {
          setPhone(settings.phone);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark animated gradient background */}
      <div className="fixed inset-0 -z-10">
        {/* Base layer - deep blues and purples */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 animate-gradient-shift"></div>
        
        {/* Second layer - adds depth with darker cyan and pink */}
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-600 via-blue-700 to-pink-600 opacity-70 animate-gradient-flow gradient-soft"></div>
        
        {/* Third layer - deep accent colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50 animate-gradient-wave gradient-blur"></div>
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <Header phone={phone} />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/20"></div>
        <div className="relative z-10">
          <Hero />
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gray-50/95 backdrop-blur-sm">
        <FeaturedCabins />
        
        {/* Gallery Section */}
        <section className="py-20 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Галерея наших объектов
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Посмотрите на наши уютные домики и современные квартиры с потрясающими видами
              </p>
            </div>
            <PhotoGallery images={galleryImages} alt="Галерея объектов недвижимости" />
          </div>
        </section>
        
        <WhyChooseUs />
        <Testimonials />
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;
EOF

# Пересобираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm run build

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start vgosti-server

echo "✅ Основные исправления применены!"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🌐 Проверьте сайт: https://vgosty05.ru"
echo "🔧 Кнопка 'Найти жилье' теперь работает!"
echo "🎨 Все компоненты теперь динамические!"
echo "⚙️ Админка готова к настройке контента!"