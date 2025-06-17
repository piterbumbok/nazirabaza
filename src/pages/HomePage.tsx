import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import FeaturedCabins from '../components/FeaturedCabins';
import PhotoGallery from '../components/PhotoGallery';
import WhyChooseUs from '../components/WhyChooseUs';
import Testimonials from '../components/Testimonials';
import Footer from '../components/Footer';
import { apiService } from '../services/api';

const HomePage: React.FC = () => {
  const [galleryImages, setGalleryImages] = useState([
    'https://images.pexels.com/photos/3754595/pexels-photo-3754595.jpeg',
    'https://images.pexels.com/photos/4846293/pexels-photo-4846293.jpeg',
    'https://images.pexels.com/photos/4846265/pexels-photo-4846265.jpeg',
    'https://images.pexels.com/photos/4846437/pexels-photo-4846437.jpeg',
    'https://images.pexels.com/photos/4846436/pexels-photo-4846436.jpeg'
  ]);

  const [phone, setPhone] = useState('+7 965 411-15-55');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await apiService.getSettings();
        if (settings.galleryImages && Array.isArray(settings.galleryImages)) {
          setGalleryImages(settings.galleryImages);
        }
        if (settings.phone) {
          setPhone(settings.phone);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    loadSettings();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dark animated gradient background */}
      <div className="fixed inset-0 -z-10">
        {/* Base layer - deep blues and purples */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 animate-gradient-shift"></div>
        
        {/* Second layer - adds depth with darker cyan and pink */}
        <div className="absolute inset-0 bg-gradient-to-tl from-cyan-600 via-blue-700 to-pink-600 opacity-70 animate-gradient-flow gradient-soft"></div>
        
        {/* Third layer - deep accent colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 opacity-50 animate-gradient-wave gradient-blur"></div>
        
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <Header phone={phone} />
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/15 to-black/20"></div>
        <div className="relative z-10">
          <Hero />
        </div>
      </section>

      {/* Main Content */}
      <div className="bg-gray-50/95 backdrop-blur-sm">
        <FeaturedCabins />
        
        {/* Gallery Section */}
        <section className="py-20 bg-white/95 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Галерея наших объектов
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Посмотрите на наши уютные домики и современные квартиры с потрясающими видами
              </p>
            </div>
            <PhotoGallery images={galleryImages} alt="Галерея объектов недвижимости" />
          </div>
        </section>
        
        <WhyChooseUs />
        <Testimonials />
      </div>
      
      <Footer />
    </div>
  );
};

export default HomePage;