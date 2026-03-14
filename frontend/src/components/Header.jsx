import React, { useState, useEffect } from 'react';
import { Phone, Menu, X, Clock, ShoppingBag, MapPin } from 'lucide-react';
import { useNavigate, useLocation as useRouterLocation } from 'react-router-dom';
import { restaurantInfo } from '../utils/mockData';
import { useCart } from '../contexts/CartContext';

const Header = ({ onCartClick }) => {

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();

  const itemCount = getItemCount();
  const isHome = routerLocation.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    if (!isHome) {
      navigate('/');
      return;
    }

    const el = document.getElementById(sectionId);

    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }

    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: "home", label: "Home", section: "home", path: "/" },
    { id: "menu", label: "Menu", section: "menu" },
    { id: "specials", label: "Specials", section: "specials" },
    { id: "track", label: "Track Order", path: "/track-order" }
  ];

  return (
    <>
      {/* Top Info Bar */}

      <div className="bg-brand-800 text-white text-xs py-2 hidden md:block">

        <div className="container mx-auto px-4 flex items-center justify-between">

          <div className="flex items-center gap-5">

            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-gold" />
              {restaurantInfo.timingsDetail}
            </span>

            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gold" />
              {restaurantInfo.area}
            </span>

          </div>

          <a
            href={`tel:${restaurantInfo.phone}`}
            className="flex items-center gap-1 hover:text-gold transition-colors"
          >
            <Phone className="w-3 h-3" />
            {restaurantInfo.phone}
          </a>

        </div>

      </div>

      {/* Main Header */}

      <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md backdrop-blur-sm py-2' : 'bg-white py-3'}`}>

        <div className="container mx-auto px-4 flex items-center justify-between">

          {/* Logo */}

          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-3 group"
          >

            <div className="w-10 h-10 bg-brand-700 rounded-xl flex items-center justify-center text-white font-display font-bold text-lg shadow-sm group-hover:bg-brand-600 transition-colors">
              C
            </div>

            <div>
              <div className="text-lg font-display font-bold text-brand-800 leading-tight">
                {restaurantInfo.name}
              </div>

              <div className="text-[10px] text-gold-dark font-semibold tracking-widest uppercase">
                Fine Dining
              </div>
            </div>

          </button>

          {/* Desktop Navigation */}

          <nav className="hidden md:flex items-center gap-2">

            {navItems.map(item => (

              <button
                key={item.id}
                onClick={() => {

                  if (item.path) {
                    navigate(item.path);
                  } else {
                    scrollToSection(item.section);
                  }

                }}

                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all"
              >
                {item.label}
              </button>

            ))}

          </nav>

          {/* Right Side Actions */}

          <div className="flex items-center gap-3">

            {/* Cart Button */}

            {onCartClick && (

              <button
                onClick={onCartClick}
                className="relative p-2 text-gray-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all"
              >

                <ShoppingBag className="w-5 h-5" />

                {itemCount > 0 && (

                  <span className="absolute -top-1 -right-1 bg-brand text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-cart-bounce">
                    {itemCount}
                  </span>

                )}

              </button>

            )}

            {/* Order Button */}

            <a
              href={`tel:${restaurantInfo.phone}`}
              className="hidden md:flex items-center gap-2 bg-brand-700 text-white px-4 py-2 rounded-lg hover:bg-brand-600 hover:shadow-md transition-all text-sm font-medium"
            >

              <Phone className="w-4 h-4" />

              Order Now

            </a>

            {/* Mobile Menu Button */}

            <button
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >

              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}

            </button>

          </div>

        </div>

        {/* Mobile Navigation */}

        <div className={`md:hidden overflow-hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-80 border-t bg-white' : 'max-h-0'}`}>

          <div className="container mx-auto px-4 py-3 space-y-1">

            {navItems.map(item => (

              <button
                key={item.id}
                onClick={() => {

                  if (item.path) {

                    navigate(item.path);
                    setIsMobileMenuOpen(false);

                  } else {

                    scrollToSection(item.section);

                  }

                }}

                className="block w-full text-left px-4 py-2.5 text-gray-700 hover:text-brand-700 hover:bg-brand-50 rounded-lg transition-all font-medium text-sm"
              >

                {item.label}

              </button>

            ))}

            <div className="flex gap-2 pt-2">

              <a
                href={`tel:${restaurantInfo.phone}`}
                className="flex-1 flex items-center justify-center gap-2 bg-brand-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-brand-600"
              >

                <Phone className="w-4 h-4" />

                Call Now

              </a>

            </div>

          </div>

        </div>

      </header>

    </>
  );
};

export default Header;