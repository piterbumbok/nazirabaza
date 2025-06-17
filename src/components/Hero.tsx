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