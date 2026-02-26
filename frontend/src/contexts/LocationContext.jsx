import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [deliveryType, setDeliveryType] = useState(null); // 'delivery' | 'pickup'
  const [selectedArea, setSelectedArea] = useState('');
  const [isLocationSet, setIsLocationSet] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedLocation = localStorage.getItem('location');
    if (savedLocation) {
      try {
        const { deliveryType: savedType, selectedArea: savedArea } = JSON.parse(savedLocation);
        setDeliveryType(savedType);
        setSelectedArea(savedArea);
        setIsLocationSet(true);
      } catch (error) {
        console.error('Error loading location:', error);
      }
    }
  }, []);

  // Save to localStorage whenever location changes
  useEffect(() => {
    if (deliveryType) {
      localStorage.setItem('location', JSON.stringify({
        deliveryType,
        selectedArea
      }));
    }
  }, [deliveryType, selectedArea]);

  const setLocation = (type, area = '') => {
    setDeliveryType(type);
    setSelectedArea(area);
    setIsLocationSet(true);
  };

  const clearLocation = () => {
    setDeliveryType(null);
    setSelectedArea('');
    setIsLocationSet(false);
    localStorage.removeItem('location');
  };

  const value = {
    deliveryType,
    selectedArea,
    isLocationSet,
    setLocation,
    clearLocation
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};
