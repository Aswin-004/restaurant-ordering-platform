import React from 'react';
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
import './App.css';

function App() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderClick = () => {
    scrollToSection('order');
  };

  const handleMenuClick = () => {
    scrollToSection('menu');
  };

  return (
    <div className="App">
      <Header />
      <main>
        <Hero onOrderClick={handleOrderClick} onMenuClick={handleMenuClick} />
        <BestSellers onOrderClick={handleOrderClick} />
        <WhyChooseUs />
        <Reviews />
        <Menu />
        <Gallery />
        <Location />
        <div id="order">
          <OrderSection />
        </div>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}

export default App;
