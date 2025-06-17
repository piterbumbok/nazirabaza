import React, { useEffect } from 'react';
import { X, Star } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewModalProps {
  review: Review;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ review, isOpen, onClose }) => {
  // Закрытие по Escape и блокировка скролла
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Блокируем скролл страницы
      document.body.classList.add('modal-open');
      // Прокручиваем модальное окно к началу
      setTimeout(() => {
        const modalContent = document.querySelector('.review-modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      // Восстанавливаем скролл
      document.body.classList.remove('modal-open');
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="review-modal modal-overlay"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div 
        className="review-modal-content bg-white rounded-2xl max-w-2xl w-full shadow-2xl"
        style={{
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
            <h3 className="text-xl font-bold text-gray-900">Полный отзыв</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Review Content */}
          <div className="space-y-4">
            {/* Author and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 text-white font-bold text-lg">
                  {review.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{review.name}</h4>
                  <p className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString('ru-RU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment with proper text wrapping */}
            <div className="bg-gray-50 rounded-lg p-6">
              <p className="review-text text-gray-700 leading-relaxed text-base">
                {review.comment}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;