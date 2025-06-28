import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  images: string[];
  alt: string;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ images, alt }) => {
  const [showGallery, setShowGallery] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainImage, setMainImage] = useState(0);

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

  const selectMainImage = (index: number) => {
    setMainImage(index);
  };

  // Handle keyboard navigation
  React.useEffect(() => {
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
      {/* Красивая сетка фотографий */}
      <div className="grid grid-cols-4 gap-4 h-96">
        {/* Главное большое фото */}
        <div 
          className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl bg-gray-100"
          onClick={() => openGallery(0)}
        >
          <img
            src={images[0]}
            alt={`${alt} - главное фото`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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
          {/* Индикатор количества фото */}
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-full text-sm font-medium">
            {images.length} фото
          </div>
        </div>

        {/* Остальные фото в сетке */}
        {images.slice(1, 5).map((image, index) => (
          <div
            key={index + 1}
            className="relative group cursor-pointer overflow-hidden rounded-xl bg-gray-100"
            onClick={() => openGallery(index + 1)}
          >
            <img
              src={image}
              alt={`${alt} - фото ${index + 2}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
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

        {/* Если фото больше 5, показываем кнопку "Еще фото" */}
        {images.length > 5 && (
          <div
            className="relative group cursor-pointer overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center"
            onClick={() => openGallery(5)}
          >
            <div className="text-center text-white">
              <ZoomIn className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm font-medium">+{images.length - 5}</p>
              <p className="text-xs opacity-90">еще фото</p>
            </div>
          </div>
        )}
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
              <div className="flex justify-center space-x-2 px-4 overflow-x-auto max-w-full">
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
                          ? 'ring-2 ring-white scale-110' 
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
    </>
  );
};

export default PhotoGallery;