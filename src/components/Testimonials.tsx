import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import ReviewModal from './ReviewModal';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const Testimonials: React.FC = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const allReviews = await apiService.getApprovedReviews();
        // Показываем случайные 3 отзыва
        const shuffled = allReviews.sort(() => 0.5 - Math.random());
        setReviews(shuffled.slice(0, 3));
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Показываем дефолтные отзывы при ошибке
        setReviews([
          {
            id: '1',
            name: 'Анна Петрова',
            rating: 5,
            comment: 'Чудесный отдых! Домик "Морской бриз" превзошел все наши ожидания. Прекрасный вид на море, уютная обстановка и все необходимое для комфортного пребывания. Обязательно вернемся снова!',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Иван Сидоров',
            rating: 5,
            comment: 'Отличное место для семейного отдыха! Дети были в восторге от близости к морю. Домик очень просторный и чистый. Особенно понравилась терраса с барбекю и вечерний вид на закат.',
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            name: 'Екатерина Смирнова',
            rating: 4,
            comment: 'Уютно, комфортно и очень красиво! Идеальное место для романтического отдыха вдвоем. Единственный минус - дорога до ближайшего магазина. В остальном все просто замечательно!',
            created_at: new Date().toISOString()
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // НОВАЯ функция - переход на страницу отзывов с открытием конкретного отзыва
  const goToReviewsPage = (review: Review, event: React.MouseEvent) => {
    event.preventDefault();
    // Переходим на страницу отзывов с параметром ID отзыва
    navigate(`/reviews?open=${review.id}`, { 
      state: { 
        reviewToOpen: review,
        fromHomePage: true 
      } 
    });
  };

  const openReviewModal = (review: Review, event: React.MouseEvent) => {
    event.preventDefault();
    setSelectedReview(review);
  };

  const closeReviewModal = () => {
    setSelectedReview(null);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null; // Не показываем секцию, если нет отзывов
  }

  return (
    <>
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Отзывы наших гостей</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Нам важно ваше мнение. Мы постоянно работаем над улучшением сервиса, чтобы ваш отдых был незабываемым.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-4 text-white font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{review.name}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(review.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="relative">
                  <p className="text-gray-700 leading-relaxed mb-4 break-words whitespace-pre-wrap">
                    {truncateText(review.comment)}
                  </p>
                  
                  {review.comment.length > 150 && (
                    <button
                      onClick={(e) => goToReviewsPage(review, e)}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Читать полностью
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/reviews')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Все отзывы и оставить свой
            </button>
          </div>
        </div>
      </section>

      {/* Review Modal - оставляем для совместимости */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={closeReviewModal}
        />
      )}
    </>
  );
};

export default Testimonials;