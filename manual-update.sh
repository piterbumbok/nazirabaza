#!/bin/bash

# Ручное обновление файлов с изменениями
echo "🔧 Применяем изменения вручную..."

cd /var/www/vgosty05/nazirabaza

# Останавливаем сервер
echo "🛑 Останавливаем сервер..."
pm2 stop vgosti-server 2>/dev/null || true

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

# Обновляем Hero.tsx
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
echo "🎨 Все компоненты теперь динамические!"