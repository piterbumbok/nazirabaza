import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedCabins from '../components/FeaturedCabins';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { apiService } from '../services/api';
import { ZoomIn } from 'lucide-react';

const HomePage: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState([
    'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg',
    'https://images.pexels.com/photos/4846293/pexels-photo-4846293.jpeg',
    'https://images.pexels.com/photos/4846265/pexels-photo-4846265.jpeg',
    'https://images.pexels.com/photos/4846437/pexels-photo-4846437.jpeg',
    'https://images.pexels.com/photos/4846436/pexels-photo-4846436.jpeg'
  ]);

  const [phone, setPhone] = useState('+7 965 411-15-55');
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  const [currentImageSet, setCurrentImageSet] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

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

  // Умная логика отображения фото на главной странице
  useEffect(() => {
    if (galleryImages.length <= 6) {
      // Если фото 6 или меньше - показываем все
      setVisibleImages(galleryImages);
    } else {
      // Если больше 6 - показываем 6 и меняем их каждые 8 секунд (увеличено с 4)
      const interval = setInterval(() => {
        setCurrentImageSet(prev => {
          const nextSet = (prev + 1) % Math.ceil(galleryImages.length / 6);
          const startIndex = nextSet * 6;
          const endIndex = Math.min(startIndex + 6, galleryImages.length);
          
          // Если в последнем наборе меньше 6 фото, дополняем из начала
          let newImages = galleryImages.slice(startIndex, endIndex);
          if (newImages.length < 6) {
            const needed = 6 - newImages.length;
            newImages = [...newImages, ...galleryImages.slice(0, needed)];
          }
          
          setVisibleImages(newImages);
          return nextSet;
        });
      }, 8000); // Увеличено с 4000 до 8000 мс

      // Инициализируем первый набор
      setVisibleImages(galleryImages.slice(0, 6));

      return () => clearInterval(interval);
    }
  }, [galleryImages]);

  // Определяем сетку в зависимости от количества фото
  const getGridLayout = (count: number) => {
    switch (count) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-2 md:grid-cols-4';
      case 5:
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
      default:
        return 'grid-cols-2 md:grid-cols-3';
    }
  };

  const openGallery = (index: number) => {
    setCurrentGalleryIndex(index);
    setShowGallery(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowGallery(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = () => {
    setCurrentGalleryIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentGalleryIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

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
        
        {/* Gallery Section - УМНАЯ АДАПТИВНАЯ СЕТКА */}
        <section className="py-20 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Галерея наших объектов
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
                Посмотрите на наши уютные домики и современные квартиры с потрясающими видами
              </p>
              
              {/* Индикатор автосмены */}
              {galleryImages.length > 6 && (
                <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse-soft mr-2"></div>
                  Показано 6 из {galleryImages.length} фото • Автосмена каждые 8 сек
                </div>
              )}
            </div>
            
            {/* Умная адаптивная сетка */}
            <div className={`grid gap-6 ${getGridLayout(visibleImages.length)}`}>
              {visibleImages.map((image, index) => (
                <div 
                  key={`${currentImageSet}-${index}`}
                  className={`
                    relative overflow-hidden rounded-2xl group cursor-pointer
                    ${visibleImages.length === 1 ? 'aspect-video max-w-4xl mx-auto' : 
                      visibleImages.length === 2 ? 'aspect-square' :
                      visibleImages.length === 3 ? 'aspect-square' :
                      'aspect-video'}
                  `}
                  onClick={() => openGallery(index)}
                  style={{
                    animation: galleryImages.length > 6 ? 'fadeInSlide 1.5s ease-out' : 'none'
                  }}
                >
                  <img
                    src={image}
                    alt={`Галерея ${index + 1}`}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg';
                    }}
                  />
                  
                  {/* Overlay с эффектом увеличения */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/90 rounded-full p-4 transform scale-75 group-hover:scale-100">
                      <ZoomIn className="w-8 h-8 text-gray-800" />
                    </div>
                  </div>
                  
                  {/* Номер фото для больших галерей */}
                  {visibleImages.length > 3 && (
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {index + 1}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <WhyChooseUs />
        <Testimonials />
      </div>
      
      <Footer />

      {/* Полноэкранная галерея для главной страницы */}
      {showGallery && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeGallery}
        >
          {/* Кнопка закрытия */}
          <button
            onClick={closeGallery}
            className="absolute top-4 right-4 text-white p-3 rounded-full bg-black/30 hover:bg-black/50 z-10 transition-colors"
          >
            ✕
          </button>

          {/* Навигация */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevious();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/30 hover:bg-black/50 z-10 transition-colors"
              >
                ←
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/30 hover:bg-black/50 z-10 transition-colors"
              >
                →
              </button>
            </>
          )}

          {/* Главное изображение */}
          <div className="relative max-h-[85vh] max-w-[90vw]">
            <img
              src={galleryImages[currentGalleryIndex]}
              alt={`Галерея ${currentGalleryIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Индикатор */}
          <div className="absolute bottom-4 left-0 right-0 text-center text-white">
            <span className="bg-black/50 px-4 py-2 rounded-full text-sm">
              {currentGalleryIndex + 1} / {galleryImages.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;