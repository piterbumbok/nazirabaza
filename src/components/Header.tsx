import React, { useState, useEffect } from 'react';
import { Menu, X, Home, Phone } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface HeaderProps {
  phone?: string;
}

const Header: React.FC<HeaderProps> = ({ phone = '+7 965 411-15-55' }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // Check if we're on the home page
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine header styling based on page and scroll state
  const getHeaderStyle = () => {
    if (isHomePage) {
      // Home page: transparent when not scrolled, white when scrolled
      return isScrolled
        ? 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20'
        : 'bg-transparent';
    } else {
      // Other pages: always white background
      return 'bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20';
    }
  };

  // Determine text color based on page and scroll state
  const getTextColor = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white';
    }
    return 'text-gray-900';
  };

  // Determine nav link color
  const getNavLinkColor = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white/90';
    }
    return 'text-gray-700';
  };

  // Determine phone button style
  const getPhoneButtonStyle = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm';
    }
    return 'text-blue-600 bg-blue-50 hover:bg-blue-100';
  };

  // Determine mobile menu button style
  const getMobileButtonStyle = () => {
    if (isHomePage && !isScrolled) {
      return 'text-white hover:bg-white/10';
    }
    return 'text-gray-700 hover:bg-gray-100';
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${getHeaderStyle()}`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center h-16">
        <Link to="/" className="flex items-center group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-200">
            <Home className="w-5 h-5 text-white" />
          </div>
          <h1 className={`text-2xl font-bold transition-colors duration-300 ${getTextColor()}`}>
            В гости
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {[
            { name: 'Главная', path: '/' },
            { name: 'Каталог', path: '/cabins' },
            { name: 'Контакты', path: '/contacts' }
          ].map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`font-medium transition-colors duration-300 hover:text-blue-500 ${getNavLinkColor()}`}
            >
              {item.name}
            </Link>
          ))}
          
          {/* Phone number in header */}
          <a 
            href={`tel:${phone}`}
            className={`flex items-center font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${getPhoneButtonStyle()}`}
          >
            <Phone className="w-4 h-4 mr-2" />
            <span>{phone}</span>
          </a>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${getMobileButtonStyle()}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-4">
              {[
                { name: 'Главная', path: '/' },
                { name: 'Каталог', path: '/cabins' },
                { name: 'Контакты', path: '/contacts' }
              ].map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="font-medium text-gray-700 hover:text-blue-600 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <a 
                href={`tel:${phone}`}
                className="flex items-center font-medium text-blue-600 hover:text-blue-700 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="w-4 h-4 mr-2" />
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;