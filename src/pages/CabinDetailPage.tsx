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
      <div className="min-h-screen flex flex-col bg-gray-50">
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
      <div className="min-h-screen flex flex-col bg-gray-50">
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

  // Получаем дополнительные данные из cabin (они могут быть добавлены через API)
  const cabinData = cabin as any;
  const distanceToSea = cabinData.distanceToSea;
  const mapUrl = cabinData.mapUrl || '';

  // Функция для конвертации Google Maps ссылки в embed
  const convertGoogleMapsUrl = (url: string): string => {
    if (!url) return '';
    
    // Если это уже iframe src, возвращаем как есть
    if (url.includes('google.com/maps/embed')) {
      return url;
    }
    
    // Если это ссылка типа https://maps.app.goo.gl/...
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      // Для коротких ссылок Google Maps нужно использовать iframe с базовым URL
      const shortId = url.split('/').pop();
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d0!3d0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMDDCsDAwJzAwLjAiTiAwMMKwMDAnMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s`;
    }
    
    // Если это обычная ссылка Google Maps
    if (url.includes('google.com/maps') || url.includes('maps.google.com')) {
      // Извлекаем координаты или place_id из URL и создаем embed ссылку
      return url.replace('google.com/maps', 'google.com/maps/embed');
    }
    
    return url;
  };

  const embedMapUrl = convertGoogleMapsUrl(mapUrl);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
              
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Расположение</h2>
                <p className="text-gray-700 mb-6 text-lg leading-relaxed">
                  Объект расположен в живописном месте на берегу моря. Из окон открывается 
                  потрясающий вид на морской пейзаж.
                  {distanceToSea && distanceToSea.trim() && ` В ${distanceToSea} ходьбы находится песчаный пляж.`}
                </p>
                
                {/* Карта */}
                {embedMapUrl ? (
                  <div className="h-96 rounded-xl overflow-hidden border">
                    <iframe
                      src={embedMapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Карта расположения"
                    />
                  </div>
                ) : (
                  <div className="h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                      <p className="text-blue-800 font-medium text-lg">Карта местности</p>
                      {distanceToSea && distanceToSea.trim() && (
                        <p className="text-blue-600">Расстояние до моря: {distanceToSea}</p>
                      )}
                    </div>
                  </div>
                )}
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