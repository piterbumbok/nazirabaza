import React, { useState, useEffect } from 'react';
import { Home, Phone, Mail, MapPin } from 'lucide-react';
import { apiService } from '../services/api';

const Footer: React.FC = () => {
  const [footerContent, setFooterContent] = useState({
    siteName: 'В гости',
    footerDescription: 'Уютные домики и современные квартиры на берегу моря для незабываемого отдыха. Идеальное место для спокойного отдыха и наслаждения морским пейзажем.',
    footerPhone: '+7 965 411-15-55',
    footerEmail: 'info@vgosti.ru',
    footerAddress: 'Приморский бульвар, 123, Морской город, Россия'
  });

  useEffect(() => {
    const loadFooterContent = async () => {
      try {
        const settings = await apiService.getSettings();
        if (Object.keys(settings).length > 0) {
          setFooterContent(prev => ({
            siteName: settings.siteName || prev.siteName,
            footerDescription: settings.footerDescription || prev.footerDescription,
            footerPhone: settings.footerPhone || prev.footerPhone,
            footerEmail: settings.footerEmail || prev.footerEmail,
            footerAddress: settings.footerAddress || prev.footerAddress
          }));
        }
      } catch (error) {
        console.error('Error loading footer content:', error);
      }
    };

    loadFooterContent();
  }, []);

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3">
                <Home className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">{footerContent.siteName}</h2>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {footerContent.footerDescription}
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
            <h3 className="text-xl font-semibold mb-6">Контакты</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 flex-shrink-0 mt-1 text-blue-400" />
                <span className="text-gray-300">{footerContent.footerAddress}</span>
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-gray-300">{footerContent.footerPhone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0 text-blue-400" />
                <span className="text-gray-300">{footerContent.footerEmail}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} {footerContent.siteName}. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;