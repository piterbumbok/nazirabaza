import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Анна Петрова',
    image: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'Чудесный отдых! Домик "Морской бриз" превзошел все наши ожидания. Прекрасный вид на море, уютная обстановка и все необходимое для комфортного пребывания. Обязательно вернемся снова!',
    cabin: 'Морской бриз'
  },
  {
    id: 2,
    name: 'Иван Сидоров',
    image: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 5,
    text: 'Отличное место для семейного отдыха! Дети были в восторге от близости к морю. Домик очень просторный и чистый. Особенно понравилась терраса с барбекю и вечерний вид на закат.',
    cabin: 'Семейный причал'
  },
  {
    id: 3,
    name: 'Екатерина Смирнова',
    image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    rating: 4,
    text: 'Уютно, комфортно и очень красиво! Идеальное место для романтического отдыха вдвоем. Единственный минус - дорога до ближайшего магазина. В остальном все просто замечательно!',
    cabin: 'Песчаный берег'
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Отзывы наших гостей</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Нам важно ваше мнение. Мы постоянно работаем над улучшением сервиса, чтобы ваш отдых был незабываемым.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id} 
              className="bg-gray-50 rounded-2xl p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-14 h-14 rounded-full object-cover mr-4 border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                  <p className="text-sm text-blue-600 font-medium">{testimonial.cabin}</p>
                </div>
              </div>
              
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              <p className="text-gray-700 leading-relaxed">{testimonial.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;