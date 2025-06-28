import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  images: string[];
  alt: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, alt }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleImages, setVisibleImages] = useState<string[]>([]);
  const [currentSet, setCurrentSet] = useState(0);

  // Автоматическая смена фото каждые 3 секунды
  useEffect(() => {
    if (!images || images.length <= 5) {
      setVisibleImages(images || []);
      return;
    }

    // Если фото больше 5, показываем по 5 и меняем их
    const interval = setInterval(() => {
      setCurrentSet(prev => {
        const nextSet = (prev + 1) % Math.ceil(images.length / 5);
        const startIndex = nextSet * 5;
        const endIndex = Math.min(startIndex + 5, images.length);
        setVisibleImages(images.slice(startIndex, endIndex));
        return nextSet;
      });
    }, 3000);

    // Инициализируем первый набор
    setVisibleImages(images.slice(0, 5));

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <ZoomIn className="w-8 h-8 text-gray-500" />
          </div>
          <p className="text-gray-500 font-medium">Фотографии скоро появятся</p>
        </div>
      </div>
    );
  }

  const openGallery = (index: number) => {
    setCurrentIndex(index);
    setShowGallery(true);
    document.body.style.overflow = 'hidden';
  };

  const closeGallery = () => {
    setShowGallery(false);
    document.body.style.overflow = '';
  };

  const goToPrevious = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showGallery) return;

      switch (e.key) {
        case 'ArrowLeft':
          goToPrevious();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          closeGallery();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGallery, images.length]);

  return (
    <>
      {/* Красивая сетка фотографий с автоматической сменой */}
      <div className="grid grid-cols-4 gap-4 h-96">
        {/* Главное большое фото */}
        <div 
          className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100"
          onClick={() => openGallery(0)}
        >
          <img
            src={visibleImages[0] || images[0]}
            alt={`${alt} - главное фото`}
            className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg';
            }}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-4">
              <ZoomIn className="w-8 h-8 text-gray-800" />
            </div>
          </div>
          
          {/* Индикатор количества фото и автосмены */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-full text-sm font-medium">
            {images.length} фото
            {images.length > 5 && (
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-1"></div>
                <span className="text-xs">авто</span>
              </div>
            )}
          </div>
        </div>

        {/* Остальные фото в сетке с плавной сменой */}
        {visibleImages.slice(1, 5).map((image, index) => (
          <div
            key={`${currentSet}-${index}`}
            className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100"
            onClick={() => openGallery(index + 1)}
          >
            <img
              src={image}
              alt={`${alt} - фото ${index + 2}`}
              className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110"
              style={{
                animation: images.length > 5 ? 'fadeInScale 1s ease-in-out' : 'none'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg';
              }}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 rounded-full p-3">
                <ZoomIn className="w-6 h-6 text-gray-800" />
              </div>
            </div>
          </div>
        ))}

        {/* Если фото меньше 5, заполняем пустые ячейки */}
        {visibleImages.length < 5 && Array.from({ length: 5 - visibleImages.length }).map((_, index) => (
          <div key={`empty-${index}`} className="bg-gray-100 rounded-xl"></div>
        ))}
      </div>

      {/* Полноэкранная галерея */}
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
            <X className="w-6 h-6" />
          </button>

          {/* Навигация */}
          {images.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/30 hover:bg-black/50 z-10 transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full bg-black/30 hover:bg-black/50 z-10 transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Главное изображение */}
          <div className="relative max-h-[85vh] max-w-[90vw]">
            <img
              src={images[currentIndex]}
              alt={`${alt} - фото ${currentIndex + 1}`}
              className="max-h-[85vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Индикатор и миниатюры внизу */}
          <div className="absolute bottom-4 left-0 right-0">
            <div className="text-center text-white mb-4">
              <span className="bg-black/50 px-4 py-2 rounded-full text-sm">
                {currentIndex + 1} / {images.length}
              </span>
            </div>
            
            {/* Миниатюры для навигации */}
            {images.length > 1 && (
              <div className="flex justify-center space-x-2 px-4 overflow-x-auto max-w-full scrollbar-hide">
                <div className="flex space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(index);
                      }}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                        index === currentIndex 
                          ? 'ring-3 ring-white scale-110' 
                          : 'opacity-70 hover:opacity-100 hover:scale-105'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Миниатюра ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInScale {
          0% {
            opacity: 0.7;
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default PhotoGallery;