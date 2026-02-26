import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { LocationProvider } from './contexts/LocationContext';
import { CartProvider } from './contexts/CartContext';

// Components
import Header from './components/Header';
import Hero from './components/Hero';
import BestSellers from './components/BestSellers';
import WhyChooseUs from './components/WhyChooseUs';
import Reviews from './components/Reviews';
import Menu from './components/Menu';
import Gallery from './components/Gallery';
import Location from './components/Location';
import OrderSection from './components/OrderSection';
import Footer from './components/Footer';
import FloatingButtons from './components/FloatingButtons';
import LocationModal from './components/LocationModal';
import CartDrawer from './components/CartDrawer';
import FloatingCartButton from './components/FloatingCartButton';

// Pages
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import AdminPanel from './pages/AdminPanel';

// Hooks
import { useLocation as useLocationContext } from './contexts/LocationContext';

import './App.css';

const HomePage = () => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const { isLocationSet } = useLocationContext();

  useEffect(() => {
    // Show location modal if not set
    if (!isLocationSet) {
      const timer = setTimeout(() => {
        setIsLocationModalOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isLocationSet]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderClick = () => {
    if (!isLocationSet) {
      setIsLocationModalOpen(true);
    } else {
      setIsCartDrawerOpen(true);
    }
  };

  const handleMenuClick = () => {
    if (!isLocationSet) {
      setIsLocationModalOpen(true);
    } else {
      scrollToSection('menu');
    }
  };

  return (
    <>
      <Header />
      <main>
        <Hero onOrderClick={handleOrderClick} onMenuClick={handleMenuClick} />
        <BestSellers onOrderClick={handleOrderClick} />
        <WhyChooseUs />
        <Reviews />
        <Menu onOpenCart={() => setIsCartDrawerOpen(true)} />
        <Gallery />
        <Location />
        <div id="order">
          <OrderSection />
        </div>
      </main>
      <Footer />
      <FloatingButtons />
      <FloatingCartButton onClick={() => setIsCartDrawerOpen(true)} />
      
      {/* Modals */}
      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
      />
      <CartDrawer 
        isOpen={isCartDrawerOpen} 
        onClose={() => setIsCartDrawerOpen(false)} 
      />
    </>
  );
};

function App() {
  return (
    <LocationProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="App">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderNumber" element={<OrderSuccess />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Routes>
          </div>
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </BrowserRouter>
      </CartProvider>
    </LocationProvider>
  );
}

export default App;
