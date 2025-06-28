import React, { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ReviewModal from '../components/ReviewModal';
import SimpleCaptcha from '../components/SimpleCaptcha';
import { Star, Send, Shield, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../services/api';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
}

const ReviewsPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  
  // Пагинация
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;
  
  // Форма
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const MAX_COMMENT_LENGTH = 1000;

  useEffect(() => {
    loadReviews();
  }, []);

  // НОВЫЙ useEffect для обработки перехода с главной страницы
  useEffect(() => {
    const openReviewId = searchParams.get('open');
    const reviewFromState = location.state?.reviewToOpen;
    
    if (openReviewId && reviewFromState) {
      // Если пришли с главной страницы с конкретным отзывом
      console.log('🎯 Открываем отзыв с главной страницы:', reviewFromState);
      setSelectedReview(reviewFromState);
      
      // Очищаем URL от параметра
      window.history.replaceState({}, '', '/reviews');
    } else if (openReviewId && reviews.length > 0) {
      // Если есть ID в URL, но нет данных в state - ищем в загруженных отзывах
      const reviewToOpen = reviews.find(r => r.id === openReviewId);
      if (reviewToOpen) {
        setSelectedReview(reviewToOpen);
        window.history.replaceState({}, '', '/reviews');
      }
    }
  }, [searchParams, location.state, reviews]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const approvedReviews = await apiService.getApprovedReviews();
      setReviews(approvedReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  // Пагинация
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const openReviewModal = (review: Review) => {
    console.log('🔍 Открываем модальное окно отзыва:', review);
    setSelectedReview(review);
  };

  const closeReviewModal = () => {
    console.log('❌ Закрываем модальное окно отзыва');
    setSelectedReview(null);
  };

  // Форма отзыва
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (formData.comment.length > MAX_COMMENT_LENGTH) {
      alert(`Отзыв не может быть длиннее ${MAX_COMMENT_LENGTH} символов`);
      return;
    }

    if (!captchaVerified) {
      alert('Пожалуйста, подтвердите, что вы не робот');
      return;
    }

    setIsSubmitting(true);

    try {
      await apiService.createReview(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', rating: 5, comment: '' });
      setCaptchaVerified(false);
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'comment' && value.length > MAX_COMMENT_LENGTH) {
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleCaptchaVerify = (isValid: boolean) => {
    setCaptchaVerified(isValid);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      buttons.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Назад
        </button>
      );
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            i === currentPage
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      buttons.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300"
        >
          Далее
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      );
    }

    return buttons;
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-grow pt-20 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Спасибо за отзыв!</h2>
            <p className="text-gray-600 mb-6">
              Ваш отзыв отправлен на модерацию и появится на сайте после проверки.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                loadReviews();
              }}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Вернуться к отзывам
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const remainingChars = MAX_COMMENT_LENGTH - formData.comment.length;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow pt-20">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Отзывы наших гостей</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8">
              Читайте отзывы других гостей и поделитесь своими впечатлениями
            </p>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              {showForm ? 'Скрыть форму' : 'Оставить отзыв'}
            </button>
          </div>
        </section>

        {/* Review Form */}
        {showForm && (
          <section className="py-12 bg-white border-b">
            <div className="container mx-auto px-4">
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-8">
                  <div className="flex items-center justify-center mb-8">
                    <Shield className="w-6 h-6 text-blue-600 mr-2" />
                    <h2 className="text-2xl font-bold text-gray-900">Ваш отзыв</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Оценка *
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= formData.rating
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-4 text-gray-600">
                          {formData.rating} из 5 звезд
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">
                          Ваш отзыв *
                        </label>
                        <span className={`text-sm ${remainingChars < 50 ? 'text-red-500' : 'text-gray-500'}`}>
                          {remainingChars} символов осталось
                        </span>
                      </div>
                      <textarea
                        id="comment"
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        maxLength={MAX_COMMENT_LENGTH}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent resize-none ${
                          remainingChars < 50 
                            ? 'border-red-300 focus:ring-red-500' 
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                        placeholder="Расскажите о своих впечатлениях..."
                      />
                    </div>

                    <SimpleCaptcha 
                      onVerify={handleCaptchaVerify}
                      className="bg-white p-4 rounded-lg border"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting || !captchaVerified || formData.comment.length > MAX_COMMENT_LENGTH}
                      className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                        captchaVerified && !isSubmitting && formData.comment.length <= MAX_COMMENT_LENGTH
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isSubmitting ? (
                        'Отправка...'
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          {captchaVerified ? 'Отправить отзыв' : 'Подтвердите капчу'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* Reviews List */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Загружаем отзывы...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Пока нет отзывов</h3>
                <p className="text-gray-600 mb-6">Станьте первым, кто оставит отзыв!</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Оставить отзыв
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Все отзывы</h2>
                  <p className="text-gray-600">
                    Показано {startIndex + 1}-{Math.min(endIndex, reviews.length)} из {reviews.length} отзывов
                  </p>
                </div>

                {/* Reviews Grid - Horizontal Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                  {currentReviews.map((review) => (
                    <div 
                      key={review.id} 
                      className="bg-gray-50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100 h-full flex flex-col"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-3 text-white font-bold">
                          {review.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{review.name}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(review.created_at).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      
                      <div className="flex-1 flex flex-col">
                        <p className="text-gray-700 leading-relaxed mb-4 flex-1 break-words">
                          {truncateText(review.comment, 120)}
                        </p>
                        
                        {review.comment.length > 120 && (
                          <button
                            onClick={() => openReviewModal(review)}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors mt-auto"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Читать полностью
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-gray-50 rounded-2xl p-8">
                    <div className="flex justify-center items-center space-x-2 mb-6">
                      {renderPaginationButtons()}
                    </div>
                    
                    <div className="text-center text-gray-600">
                      <p className="text-sm">Страница {currentPage} из {totalPages}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Review Modal */}
      {selectedReview && (
        <ReviewModal
          review={selectedReview}
          isOpen={!!selectedReview}
          onClose={closeReviewModal}
        />
      )}
    </div>
  );
};

export default ReviewsPage;