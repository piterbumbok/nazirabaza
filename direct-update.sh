#!/bin/bash

# Прямое обновление сервера без GitHub
echo "🔧 Применяем изменения напрямую на сервер..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

# Исправляем кнопку "Найти жилье" в Hero.tsx
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

# Создаем страницы О нас и Контакты (сокращенные версии)
echo "📄 Создаем страницу О нас..."
mkdir -p src/pages
cat > src/pages/AboutPage.tsx << 'EOF'
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">О нас</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              Ваш идеальный отдых на берегу Каспийского моря
            </p>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-xl text-gray-700 leading-relaxed">
                Мы предлагаем уникальные возможности для отдыха в живописных местах на побережье Каспийского моря. 
                Наша компания специализируется на предоставлении комфортабельного жилья для незабываемого отдыха.
              </p>
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

echo "📄 Создаем страницу Контакты..."
cat > src/pages/ContactsPage.tsx << 'EOF'
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const ContactsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow pt-20">
        <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Контакты</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              Свяжитесь с нами любым удобным способом
            </p>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-center">
                    <Phone className="w-6 h-6 text-blue-600 mr-3" />
                    <a href="tel:+79654111555" className="text-lg text-blue-600">+7 965 411-15-55</a>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle className="w-6 h-6 text-green-600 mr-3" />
                    <a href="https://api.whatsapp.com/send/?phone=79654111555&text=Здравствуйте!" className="text-lg text-green-600">WhatsApp</a>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-6 h-6 text-purple-600 mr-3" />
                    <a href="mailto:info@vgosti.ru" className="text-lg text-purple-600">info@vgosti.ru</a>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-6 h-6 text-orange-600 mr-3 mt-1" />
                    <span className="text-lg text-gray-700">Приморский бульвар, 123, Морской город, Россия</span>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Время работы</h3>
                  <p className="text-gray-700">Пн-Пт: 9:00 - 18:00</p>
                  <p className="text-gray-700">Сб-Вс: 10:00 - 16:00</p>
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

# Обновляем App.tsx
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
      </Routes>
    </Router>
  );
}

export default App;
EOF

# Обновляем Header.tsx
echo "🔄 Обновляем Header.tsx..."
sed -i "s|{ name: 'О нас', path: '#' }|{ name: 'О нас', path: '/about' }|g" src/components/Header.tsx
sed -i "s|{ name: 'Контакты', path: '#' }|{ name: 'Контакты', path: '/contacts' }|g" src/components/Header.tsx

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
echo "📄 Страницы О нас и Контакты созданы!"