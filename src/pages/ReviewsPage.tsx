import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SimpleCaptcha from '../components/SimpleCaptcha';
import { Star, Send, Shield } from 'lucide-react';
import { apiService } from '../services/api';

const ReviewsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rating: 5,
    comment: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.comment.trim()) {
      alert('Пожалуйста, заполните все обязательные поля');
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
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Ошибка при отправке отзыва. Попробуйте еще раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRatingChange = (rating: number) => {
    setFormData({ ...formData, rating });
  };

  const handleCaptchaVerify = (isValid: boolean) => {
    setCaptchaVerified(isValid);
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
              onClick={() => setSubmitted(false)}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Оставить еще один отзыв
            </button>
          </div>
        </main>
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Оставить отзыв</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto">
              Поделитесь своими впечатлениями о нашем сервисе
            </p>
          </div>
        </section>

        {/* Review Form */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border p-8">
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
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                      Ваш отзыв *
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      value={formData.comment}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Расскажите о своих впечатлениях..."
                    />
                  </div>

                  {/* Капча */}
                  <SimpleCaptcha 
                    onVerify={handleCaptchaVerify}
                    className="bg-gray-50 p-4 rounded-lg border"
                  />

                  <button
                    type="submit"
                    disabled={isSubmitting || !captchaVerified}
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                      captchaVerified && !isSubmitting
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

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Защита от спама</p>
                      <p>Мы используем капчу для защиты от автоматических отзывов. Все отзывы проходят модерацию перед публикацией.</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  * Обязательные поля. Отзыв будет опубликован после модерации.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default ReviewsPage;