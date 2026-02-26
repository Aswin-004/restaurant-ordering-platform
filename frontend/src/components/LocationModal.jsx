import React, { useState } from 'react';
import { X, MapPin, ShoppingBag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { useLocation } from '../contexts/LocationContext';
import { SERVICEABLE_AREAS, isAreaServiceable } from '../utils/cartUtils';
import toast from 'react-hot-toast';

const LocationModal = ({ isOpen, onClose }) => {
  const { setLocation } = useLocation();
  const [selectedType, setSelectedType] = useState(null);
  const [selectedArea, setSelectedArea] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [step, setStep] = useState(1);

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    if (type === 'pickup') {
      // For pickup, directly set location
      setLocation('pickup', 'SRM University Area');
      toast.success('Pickup selected! Browse our menu now.');
      onClose();
    } else {
      setStep(2);
    }
  };

  const handleAreaSelect = () => {
    const finalArea = selectedArea === 'custom' ? customArea : selectedArea;
    
    if (!finalArea) {
      toast.error('Please select or enter your area');
      return;
    }

    if (!isAreaServiceable(finalArea)) {
      toast.error('Sorry, we don\'t deliver to this area yet. Please try pickup.');
      return;
    }

    setLocation('delivery', finalArea);
    toast.success(`Delivery to ${finalArea} confirmed!`);
    onClose();
  };

  const handleBack = () => {
    setStep(1);
    setSelectedType(null);
    setSelectedArea('');
    setCustomArea('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#8B0000] flex items-center space-x-2">
            <MapPin className="w-6 h-6" />
            <span>Select Order Type</span>
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4 mt-4">
            <p className="text-gray-600 mb-6">
              How would you like to receive your order?
            </p>

            {/* Delivery Option */}
            <button
              onClick={() => handleTypeSelect('delivery')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#8B0000] hover:bg-[#FFF8DC] transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#8B0000] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-[#8B0000]">Home Delivery</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get it delivered to your doorstep
                  </p>
                  <p className="text-xs text-[#D4AF37] font-semibold mt-2">
                    Delivery charges: ₹20 - ₹40
                  </p>
                </div>
              </div>
            </button>

            {/* Pickup Option */}
            <button
              onClick={() => handleTypeSelect('pickup')}
              className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-[#8B0000] hover:bg-[#FFF8DC] transition-all group"
            >
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#8B0000] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-bold text-[#8B0000]">Pickup</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Collect from restaurant
                  </p>
                  <p className="text-xs text-green-600 font-semibold mt-2">
                    No delivery charges • Ready in 30 mins
                  </p>
                </div>
              </div>
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 mt-4">
            <button
              onClick={handleBack}
              className="text-sm text-gray-600 hover:text-[#8B0000] flex items-center space-x-1"
            >
              <span>←</span>
              <span>Back</span>
            </button>

            <p className="text-gray-600 mb-4">
              Select your delivery area:
            </p>

            <div className="space-y-3">
              {SERVICEABLE_AREAS.map((area) => (
                <label
                  key={area.value}
                  className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#8B0000] hover:bg-[#FFF8DC] transition-all"
                >
                  <input
                    type="radio"
                    name="area"
                    value={area.value}
                    checked={selectedArea === area.value}
                    onChange={(e) => {
                      setSelectedArea(e.target.value);
                      setCustomArea('');
                    }}
                    className="w-5 h-5 text-[#8B0000]"
                  />
                  <div className="ml-3 flex-1">
                    <div className="font-semibold text-gray-800">{area.label}</div>
                    <div className="text-sm text-gray-600">Delivery charge: ₹{area.charge}</div>
                  </div>
                </label>
              ))}

              {/* Custom Area */}
              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-[#8B0000] hover:bg-[#FFF8DC] transition-all">
                <input
                  type="radio"
                  name="area"
                  value="custom"
                  checked={selectedArea === 'custom'}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-5 h-5 text-[#8B0000] mt-1"
                />
                <div className="ml-3 flex-1">
                  <div className="font-semibold text-gray-800 mb-2">Other Area</div>
                  {selectedArea === 'custom' && (
                    <input
                      type="text"
                      value={customArea}
                      onChange={(e) => setCustomArea(e.target.value)}
                      placeholder="Enter your area"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#8B0000]"
                      autoFocus
                    />
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    We'll check if we deliver to your area
                  </div>
                </div>
              </label>
            </div>

            <Button
              onClick={handleAreaSelect}
              className="w-full bg-[#8B0000] text-white hover:bg-[#6B0000] py-3 text-lg font-semibold mt-6"
            >
              Continue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
