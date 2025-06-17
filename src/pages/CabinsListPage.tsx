import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { cabins } from '../data/cabins';
import CabinCard from '../components/CabinCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CabinsListPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const cabinsPerPage = 12;
  
  const totalPages = Math.ceil(cabins.length / cabinsPerPage);
  const startIndex = (currentPage - 1) * cabinsPerPage;
  const endIndex = startIndex + cabinsPerPage;
  const currentCabins = cabins.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105"
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
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${
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
          className="flex items-center px-4 py-2 text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-105"
        >
          Далее
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header phone="+7 965 411-15-55" />
      <main className="flex-grow pt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Каталог недвижимости</h1>
            <p className="text-xl text-gray-600 mb-8">
              Выберите идеальный вариант для отдыха из {cabins.length} доступных объектов
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Показано {startIndex + 1}-{Math.min(endIndex, cabins.length)} из {cabins.length} объектов
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {currentCabins.map((cabin) => (
              <CabinCard key={cabin.id} cabin={cabin} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex justify-center items-center space-x-2 mb-6">
                {renderPaginationButtons()}
              </div>
              
              {/* Results info */}
              <div className="text-center text-gray-600">
                <p className="text-sm">Страница {currentPage} из {totalPages}</p>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CabinsListPage;