import React from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Home, Bath, Users, Award } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PhotoGallery from '../components/PhotoGallery';
import BookingForm from '../components/BookingForm';
import { useCabin } from '../hooks/useCabins';

const CabinDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { cabin, loading, error } = useCabin(id || '');

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" style={{ zIndex: 10 }}>
        <Header phone="+7 965 411-15-55" />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !cabin) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50" style={{ zIndex: 10 }}>
        <Header phone="+7 965 411-15-55" />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Объект не найден</h2>
            <p className="text-gray-600 mb-4">{error || 'Извините, запрашиваемый объект не существует.'}</p>
            <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors">
              Вернуться на главную
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Получаем дополнительные данные из cabin
  const cabinData = cabin as any;
  const distanceToSea = cabinData.distanceToSea;
  const mapUrl = cabinData.mapUrl || '';

  console.log('🗺️ Raw map URL from database:', mapUrl);

  // УЛУЧШЕННАЯ функция обработки карты
  const processMapUrl = (url: string): string => {
    if (!url || !url.trim()) {
      console.log('❌ No map URL provided');
      return '';
    }
    
    const cleanUrl = url.trim();
    console.log('🔍 Processing map URL:', cleanUrl);
    
    // Если это iframe, извлекаем src
    if (cleanUrl.includes('<iframe')) {
      const srcMatch = cleanUrl.match(/src="([^"]+)"/i);
      if (srcMatch) {
        console.log('✅ Extracted from iframe:', srcMatch[1]);
        return srcMatch[1];
      }
    }
    
    // Если это уже готовая embed ссылка
    if (cleanUrl.includes('google.com/maps/embed')) {
      console.log('✅ Already embed URL');
      return cleanUrl;
    }
    
    // Если это обычная ссылка Google Maps, конвертируем в embed
    if (cleanUrl.includes('google.com/maps') || cleanUrl.includes('maps.google.com')) {
      let embedUrl = cleanUrl;
      
      // Заменяем обычный URL на embed
      embedUrl = embedUrl.replace(/https?:\/\/(www\.)?google\.com\/maps/g, 'https://www.google.com/maps/embed');
      embedUrl = embedUrl.replace(/https?:\/\/(www\.)?maps\.google\.com/g, 'https://www.google.com/maps/embed');
      
      // Если нет параметра pb, добавляем базовые параметры для embed
      if (!embedUrl.includes('pb=') && !embedUrl.includes('embed?')) {
        embedUrl = embedUrl.replace('/embed', '/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMDDCsDAwJzAwLjAiTiAwMMKwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1');
      }
      
      console.log('✅ Converted to embed:', embedUrl);
      return embedUrl;
    }
    
    // Если это короткая ссылка goo.gl или maps.app.goo.gl
    if (cleanUrl.includes('goo.gl') || cleanUrl.includes('maps.app.goo.gl')) {
      console.log('✅ Short URL detected, converting to embed format');
      // Для коротких ссылок создаем базовый embed URL
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMDDCsDAwJzAwLjAiTiAwMMKwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1`;
    }
    
    // Если это просто URL, пытаемся сделать его embed-совместимым
    if (cleanUrl.startsWith('http')) {
      console.log('✅ Converting HTTP URL to embed format');
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMDDCsDAwJzAwLjAiTiAwMMKwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1`;
    }
    
    console.log('✅ Using URL as is:', cleanUrl);
    return cleanUrl;
  };

  const embedMapUrl = processMapUrl(mapUrl);
  console.log('🎯 Final embed URL:', embedMapUrl);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 main-content" style={{ zIndex: 10 }}>
      <Header phone="+7 965 411-15-55" />
      
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{cabin.name}</h1>
          </div>
          
          <PhotoGallery images={cabin.images} alt={cabin.name} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Описание</h2>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">{cabin.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                    <Home className="w-8 h-8 text-blue-600 mb-3" />
                    <span className="text-sm text-gray-600 mb-1">Спальни</span>
                    <span className="font-bold text-gray-900 text-lg">{cabin.bedrooms}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                    <Bath className="w-8 h-8 text-blue-600 mb-3" />
                    <span className="text-sm text-gray-600 mb-1">Ванные</span>
                    <span className="font-bold text-gray-900 text-lg">{cabin.bathrooms}</span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                    <Users className="w-8 h-8 text-blue-600 mb-3" />
                    <span className="text-sm text-gray-600 mb-1">Гости</span>
                    <span className="font-bold text-gray-900 text-lg">до {cabin.maxGuests}</span>
                  </div>
                  {/* Показываем расстояние до моря только если оно указано */}
                  {distanceToSea && distanceToSea.trim() && (
                    <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl">
                      <MapPin className="w-8 h-8 text-blue-600 mb-3" />
                      <span className="text-sm text-gray-600 mb-1">До моря</span>
                      <span className="font-bold text-gray-900 text-lg">{distanceToSea}</span>
                    </div>
                  )}
                </div>

                {/* Локация - показываем только если заполнена */}
                {cabin.location && cabin.location.trim() && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                      Локация
                    </h3>
                    <p className="text-gray-700 text-lg">{cabin.location}</p>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">Удобства</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cabin.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Award className="w-5 h-5 text-blue-500 mr-3" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* ИСПРАВЛЕННАЯ секция карты */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Расположение</h2>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Объект расположен в живописном месте на берегу моря. Из окон открывается 
                  потрясающий вид на морской пейзаж.
                  {distanceToSea && distanceToSea.trim() && ` В ${distanceToSea} ходьбы находится песчаный пляж.`}
                </p>
                
                {/* ПОЛНОСТЬЮ ПЕРЕРАБОТАННАЯ карта */}
                <div className="map-container">
                  {embedMapUrl ? (
                    <div className="relative w-full h-96 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
                      <iframe
                        src={embedMapUrl}
                        width="100%"
                        height="100%"
                        style={{ 
                          border: 0,
                          position: 'relative',
                          zIndex: 1
                        }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Карта расположения объекта"
                        className="absolute inset-0"
                        onLoad={() => {
                          console.log('✅ Map iframe loaded successfully');
                        }}
                        onError={(e) => {
                          console.log('❌ Map iframe failed to load:', e);
                        }}
                      />
                      
                      {/* Индикатор загрузки */}
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-gray-500 text-sm">Загружаем карту...</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center border border-gray-200">
                      <div className="text-center">
                        <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <p className="text-blue-800 font-medium text-lg">Карта местности</p>
                        {distanceToSea && distanceToSea.trim() && (
                          <p className="text-blue-600 mt-2">Расстояние до моря: {distanceToSea}</p>
                        )}
                        <p className="text-blue-500 text-sm mt-2">Карта будет добавлена позже</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <BookingForm 
                  cabinId={cabin.id} 
                  pricePerNight={cabin.pricePerNight} 
                  maxGuests={cabin.maxGuests} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CabinDetailPage;