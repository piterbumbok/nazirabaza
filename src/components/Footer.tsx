import React from 'react';
import { Home, Phone, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">В гости</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Уютные домики и современные квартиры на берегу моря для незабываемого отдыха. 
              Идеальное место для спокойного отдыха и наслаждения морским пейзажем.
            </p>
            <div className="flex space-x-4">
              {['facebook', 'instagram', 'twitter'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors duration-300"
                >
                  <span className="sr-only">{social}</span>
                  <div className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Навигация</h3>
            <ul className="space-y-3">
              {['Главная', 'Каталог', 'Бронирование', 'Галерея', 'О нас', 'Контакты'].map(
                (item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-300 hover:text-white transition-colors duration-300 hover:translate-x-1 inline-block">
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-6">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-1 text-blue-400" />
                <span className="text-gray-300">Приморский бульвар, 123, Морской город, Россия</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-gray-300">+7 (999) 123-45-67</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-gray-300">info@vgosti.ru</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} В гости. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;