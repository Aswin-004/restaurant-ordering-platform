import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-2xl font-bold text-[#D4AF37] mb-4">
              {restaurantInfo.name}
            </h3>
            <p className="text-gray-400 mb-4">
              Potheri's favorite multi-cuisine restaurant serving delicious North Indian, Chinese, Seafood & more since years.
            </p>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-[#D4AF37]">★</span>
                ))}
              </div>
              <span className="text-sm">{restaurantInfo.rating} ({restaurantInfo.reviewCount}+ reviews)</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('home')}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('menu')}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  Menu
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('about')}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('location')}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  Location
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
                <span className="text-gray-400 text-sm">
                  {restaurantInfo.address}, {restaurantInfo.city}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <a
                  href={`tel:${restaurantInfo.phone}`}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm"
                >
                  {restaurantInfo.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                <a
                  href={`mailto:${restaurantInfo.email}`}
                  className="text-gray-400 hover:text-[#D4AF37] transition-colors text-sm"
                >
                  {restaurantInfo.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="text-lg font-bold mb-4">Opening Hours</h4>
            <div className="flex items-start space-x-3 mb-4">
              <Clock className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-1" />
              <div className="text-gray-400 text-sm">
                <p className="font-semibold text-white mb-1">All Days</p>
                <p>{restaurantInfo.timings}</p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h5 className="font-semibold mb-3">Follow Us</h5>
              <div className="flex space-x-3">
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-[#2a2a2a] rounded-full flex items-center justify-center hover:bg-[#D4AF37] transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} {restaurantInfo.name}. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-[#D4AF37] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
