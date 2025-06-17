import React from 'react';
import { useNavigate } from 'react-router-dom';
import { cabins } from '../data/cabins';
import CabinCard from './CabinCard';

const FeaturedCabins: React.FC = () => {
  const navigate = useNavigate();
  const displayCabins = cabins.slice(0, 6);

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {displayCabins.map((cabin) => (
            <CabinCard key={cabin.id} cabin={cabin} />
          ))}
        </div>

        {cabins.length > 6 && (
          <div className="text-center">
            <button 
              onClick={() => navigate('/cabins')}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
            >
              Найти домик
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCabins;