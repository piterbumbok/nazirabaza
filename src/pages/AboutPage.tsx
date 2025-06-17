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