import React from 'react';
import { MapPin, Users, Home, Bath } from 'lucide-react';
import { Cabin } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { Link } from 'react-router-dom';

interface CabinCardProps {
  cabin: Cabin;
}

const CabinCard: React.FC<CabinCardProps> = ({ cabin }) => {
  return (
    <Link to={`/cabin/${cabin.id}`}>
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col transform hover:-translate-y-2 hover:scale-[1.02] group border border-gray-100">
        <div className="relative h-64 overflow-hidden rounded-t-2xl">
          <img
            src={cabin.images[0]}
            alt={cabin.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {cabin.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm">
              ⭐ Популярный
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute bottom-4 left-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
            <span className="text-2xl font-bold">{formatPrice(cabin.pricePerNight)}</span>
            <span className="text-lg font-normal opacity-90 ml-1">/ ночь</span>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
            {cabin.name}
          </h3>

          {/* Показываем локацию только если она заполнена */}
          {cabin.location && cabin.location.trim() && (
            <div className="flex items-center text-gray-500 mb-4 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              <span>{cabin.location}</span>
            </div>
          )}

          <p className="text-gray-600 mb-6 text-sm line-clamp-3 leading-relaxed flex-grow">
            {cabin.description}
          </p>

          <div className="mt-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-gray-900">
                {formatPrice(cabin.pricePerNight)}
              </span>
              <span className="text-sm text-gray-500">за ночь</span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm text-gray-600">
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl transition-colors group-hover:bg-blue-50">
                <Home className="w-5 h-5 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-medium">{cabin.bedrooms} сп.</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl transition-colors group-hover:bg-blue-50">
                <Bath className="w-5 h-5 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-medium">{cabin.bathrooms} ван.</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-gray-50 rounded-xl transition-colors group-hover:bg-blue-50">
                <Users className="w-5 h-5 mb-1 text-gray-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-medium">до {cabin.maxGuests}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CabinCard;