import React, { useState } from 'react';
import { MessageCircle, FileText } from 'lucide-react';
import { formatPrice } from '../utils/formatPrice';

interface BookingFormProps {
  cabinId: string;
  pricePerNight: number;
  maxGuests: number;
}

const BookingForm: React.FC<BookingFormProps> = ({ 
  cabinId, 
  pricePerNight 
}) => {
  const [accommodationRules] = useState([
    'Заезд после 14:00, выезд до 12:00',
    'Курение запрещено',
    'Без вечеринок и мероприятий',
    'Разрешено проживание с домашними животными'
  ]);

  const handleWhatsAppBooking = () => {
    const message = `Здравствуйте! Хочу забронировать домик "${cabinId}". Цена: ${formatPrice(pricePerNight)} за ночь`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=79654111555&text=${encodedMessage}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Забронировать</h3>
      <p className="text-gray-700 mb-6">
        <span className="text-xl font-bold text-blue-700">{formatPrice(pricePerNight)}</span> / ночь
      </p>

      <div className="space-y-6">
        {/* Accommodation Rules */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <FileText className="w-5 h-5 text-gray-600 mr-2" />
            <h4 className="font-semibold text-gray-900">Правила проживания</h4>
          </div>
          <ul className="space-y-2">
            {accommodationRules.map((rule, index) => (
              <li key={index} className="text-sm text-gray-700 flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {/* WhatsApp Booking Button */}
        <button
          onClick={handleWhatsAppBooking}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors flex items-center justify-center shadow-lg hover:shadow-xl"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Забронировать через WhatsApp
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Нажимая кнопку, вы перейдете в WhatsApp для оформления бронирования
      </p>
    </div>
  );
};

export default BookingForm;