import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCabins } from '../hooks/useCabins';
import CabinCard from './CabinCard';

const FeaturedCabins: React.FC = () => {
  const navigate = useNavigate();
  const { cabins, loading, error } = useCabins();
  
  const displayCabins = cabins.slice(0, 6);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </section>
    );
  }

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