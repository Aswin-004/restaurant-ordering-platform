import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Clock } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md py-3' : 'bg-white/95 backdrop-blur-sm py-4'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-[#8B0000]">
              {restaurantInfo.name}
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-gray-700 hover:text-[#8B0000] transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('menu')}
              className="text-gray-700 hover:text-[#8B0000] transition-colors font-medium"
            >
              Menu
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-700 hover:text-[#8B0000] transition-colors font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('location')}
              className="text-gray-700 hover:text-[#8B0000] transition-colors font-medium"
            >
              Location
            </button>
          </nav>

          {/* Contact Info */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-gray-600">Open Now</span>
            </div>
            <a
              href={`tel:${restaurantInfo.phone}`}
              className="flex items-center space-x-2 bg-[#8B0000] text-white px-4 py-2 rounded-md hover:bg-[#6B0000] transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="font-medium">{restaurantInfo.phone}</span>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <nav className="flex flex-col space-y-3">
              <button
                onClick={() => scrollToSection('home')}
                className="text-left text-gray-700 hover:text-[#8B0000] transition-colors font-medium py-2"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('menu')}
                className="text-left text-gray-700 hover:text-[#8B0000] transition-colors font-medium py-2"
              >
                Menu
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="text-left text-gray-700 hover:text-[#8B0000] transition-colors font-medium py-2"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('location')}
                className="text-left text-gray-700 hover:text-[#8B0000] transition-colors font-medium py-2"
              >
                Location
              </button>
              <a
                href={`tel:${restaurantInfo.phone}`}
                className="flex items-center space-x-2 bg-[#8B0000] text-white px-4 py-3 rounded-md hover:bg-[#6B0000] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="font-medium">Call Now</span>
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
