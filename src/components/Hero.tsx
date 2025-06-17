import React from 'react';

const Hero: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
          Уютные домики и квартиры на берегу каспия
        </h1>
        <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 leading-relaxed">
          Отдохните от городской суеты в наших комфортабельных объектах с живописным видом на Каспийское море
        </p>
        <div className="flex justify-center">
          <button className="px-10 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105">
            Найти жилье
          </button>
        </div>
      </div>
    </div>
  );
};

export default Hero;