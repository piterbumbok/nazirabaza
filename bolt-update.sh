#!/bin/bash

# Скрипт для обновления сайта с изменениями из Bolt
echo "🔄 Обновляем сайт с изменениями из Bolt..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

# Создаем резервную копию базы данных
echo "💾 Создаем резервную копию базы данных..."
if [ -f "server/database.sqlite" ]; then
    cp server/database.sqlite server/database.sqlite.backup.$(date +%Y%m%d_%H%M%S)
fi

# Обновляем App.tsx с новыми маршрутами
echo "🔄 Обновляем App.tsx..."
cat > src/App.tsx << 'EOF'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CabinDetailPage from './pages/CabinDetailPage';
import AdminPage from './pages/AdminPage';
import CabinsListPage from './pages/CabinsListPage';
import AboutPage from './pages/AboutPage';
import ContactsPage from './pages/ContactsPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cabins" element={<CabinsListPage />} />
        <Route path="/cabin/:id" element={<CabinDetailPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/:adminPath" element={<AdminPage />} />
      </Routes>
    </Router>
  );
}

export default App;
EOF

# Обновляем Hero.tsx с рабочей кнопкой
echo "🔄 Обновляем Hero.tsx..."
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

# Создаем страницу О нас
echo "📄 Создаем страницу О нас..."
cat > src/pages/AboutPage.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { Award, Users, MapPin, Clock } from 'lucide-react';

interface AboutContent {
  title: string;
  subtitle: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  stats: {
    yearsExperience: number;
    happyGuests: number;
    properties: number;
    locations: number;
  };
  team: {
    name: string;
    position: string;
    description: string;
    image: string;
  }[];
}

const AboutPage: React.FC = () => {
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    title: 'О нас',
    subtitle: 'Ваш идеальный отдых на берегу Каспийского моря',
    description: 'Мы предлагаем уникальные возможности для отдыха в живописных местах на побережье Каспийского моря. Наша компания специализируется на предоставлении комфортабельного жилья для незабываемого отдыха.',
    mission: 'Наша миссия - создавать незабываемые впечатления для наших гостей, предоставляя им комфортное и качественное размещение в самых красивых уголках побережья.',
    vision: 'Мы стремимся стать ведущей компанией в сфере краткосрочной аренды жилья, известной своим высоким уровнем сервиса и заботой о каждом госте.',
    values: [
      'Качество и комфорт',
      'Индивидуальный подход',
      'Честность и прозрачность',
      'Забота об окружающей среде'
    ],
    stats: {
      yearsExperience: 5,
      happyGuests: 1200,
      properties: 15,
      locations: 3
    },
    team: [
      {
        name: 'Анна Петрова',
        position: 'Основатель и директор',
        description: 'Более 10 лет опыта в сфере гостеприимства',
        image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
      },
      {
        name: 'Михаил Сидоров',
        position: 'Менеджер по развитию',
        description: 'Отвечает за развитие новых направлений',
        image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg'
      }
    ]
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAboutContent = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.aboutContent) {
          setAboutContent(prev => ({ ...prev, ...settings.aboutContent }));
        }
      } catch (error) {
        console.error('Error loading about content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAboutContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{aboutContent.title}</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              {aboutContent.subtitle}
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-700 leading-relaxed mb-12 text-center">
                {aboutContent.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div className="bg-blue-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Наша миссия</h3>
                  <p className="text-gray-700 leading-relaxed">{aboutContent.mission}</p>
                </div>
                <div className="bg-indigo-50 rounded-2xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Наше видение</h3>
                  <p className="text-gray-700 leading-relaxed">{aboutContent.vision}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Наши достижения</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{aboutContent.stats.yearsExperience}</div>
                <div className="text-gray-600">лет опыта</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{aboutContent.stats.happyGuests}+</div>
                <div className="text-gray-600">довольных гостей</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{aboutContent.stats.properties}</div>
                <div className="text-gray-600">объектов</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{aboutContent.stats.locations}</div>
                <div className="text-gray-600">локации</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Наши ценности</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aboutContent.values.map((value, index) => (
                  <div key={index} className="flex items-center p-6 bg-gray-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-lg font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {aboutContent.team.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-24 h-24 rounded-full mx-auto mb-6 object-cover"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{member.position}</p>
                  <p className="text-gray-600">{member.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default AboutPage;
EOF

# Создаем страницу Контакты
echo "📄 Создаем страницу Контакты..."
cat > src/pages/ContactsPage.tsx << 'EOF'
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

interface ContactInfo {
  title: string;
  subtitle: string;
  phone: string;
  email: string;
  address: string;
  workingHours: string;
  whatsapp: string;
  telegram: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    vk: string;
  };
  officeHours: {
    weekdays: string;
    weekends: string;
  };
}

const ContactsPage: React.FC = () => {
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    title: 'Контакты',
    subtitle: 'Свяжитесь с нами любым удобным способом',
    phone: '+7 965 411-15-55',
    email: 'info@vgosti.ru',
    address: 'Приморский бульвар, 123, Морской город, Россия',
    workingHours: 'Ежедневно с 9:00 до 21:00',
    whatsapp: '+79654111555',
    telegram: '@vgosti_support',
    socialMedia: {
      facebook: 'https://facebook.com/vgosti',
      instagram: 'https://instagram.com/vgosti',
      vk: 'https://vk.com/vgosti'
    },
    officeHours: {
      weekdays: 'Пн-Пт: 9:00 - 18:00',
      weekends: 'Сб-Вс: 10:00 - 16:00'
    }
  });

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.contactInfo) {
          setContactInfo(prev => ({ ...prev, ...settings.contactInfo }));
        }
      } catch (error) {
        console.error('Error loading contact info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadContactInfo();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Send via WhatsApp
    const message = `Новое сообщение с сайта:
Имя: ${formData.name}
Email: ${formData.email}
Телефон: ${formData.phone}
Сообщение: ${formData.message}`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${contactInfo.whatsapp.replace('+', '')}&text=${encodedMessage}&type=phone_number&app_absent=0`;
    
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    setFormData({ name: '', email: '', phone: '', message: '' });
    setIsSubmitting(false);
    alert('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-grow flex items-center justify-center pt-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">{contactInfo.title}</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              {contactInfo.subtitle}
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Details */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Как с нами связаться</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Телефон</h3>
                      <a href={`tel:${contactInfo.phone}`} className="text-blue-600 hover:text-blue-700 text-lg">
                        {contactInfo.phone}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">WhatsApp</h3>
                      <a 
                        href={`https://api.whatsapp.com/send/?phone=${contactInfo.whatsapp.replace('+', '')}&text=Здравствуйте!&type=phone_number&app_absent=0`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-lg"
                      >
                        {contactInfo.whatsapp}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Mail className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                      <a href={`mailto:${contactInfo.email}`} className="text-purple-600 hover:text-purple-700 text-lg">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Адрес</h3>
                      <p className="text-gray-700 text-lg">{contactInfo.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <Clock className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Время работы</h3>
                      <p className="text-gray-700">{contactInfo.officeHours.weekdays}</p>
                      <p className="text-gray-700">{contactInfo.officeHours.weekends}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Напишите нам</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Ваше имя *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваше имя"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваш email"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваш телефон"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Сообщение *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Введите ваше сообщение"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Как нас найти</h2>
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                  <p className="text-blue-800 font-medium text-lg">Интерактивная карта</p>
                  <p className="text-blue-600">{contactInfo.address}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ContactsPage;
EOF

# Пересобираем фронтенд
echo "🔨 Пересобираем фронтенд..."
npm run build

# Запускаем сервер
echo "🚀 Запускаем сервер..."
pm2 start vgosti-server

echo "✅ Все обновления применены!"
echo ""
echo "📊 Статус сервера:"
pm2 status
echo ""
echo "🌐 Проверьте сайт: https://vgosty05.ru"
echo "🔧 Кнопка 'Найти жилье' теперь работает!"
echo "📄 Страницы О нас и Контакты созданы!"
echo "🎨 Все компоненты теперь динамические!"