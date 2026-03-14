import React from 'react';
import { MapPin, Navigation, Phone, Clock } from 'lucide-react';
import { restaurantInfo } from '../utils/mockData';

const Location = () => {
  const handleGetDirections = () => {
    const address = encodeURIComponent(
      `${restaurantInfo.address}, ${restaurantInfo.city}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
  };

  return (
    <section id="location" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gold/10 px-4 py-2 rounded-full mb-4">
            <span className="text-brand-700 font-semibold">Visit Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4 font-display">
            Find Us Here
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Conveniently located near SRM University for easy access
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Map */}
          <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-xl">
            <iframe
              src={restaurantInfo.googleMapEmbed}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Classic Restaurant Location"
            ></iframe>
          </div>

          {/* Location Info */}
          <div className="space-y-6">
            {/* Address Card */}
            <div className="bg-cream rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-700 mb-2">Address</h3>
                  <p className="text-gray-700 mb-1">{restaurantInfo.address}</p>
                  <p className="text-gray-700 mb-2">{restaurantInfo.city}</p>
                  <p className="text-gold font-semibold">{restaurantInfo.landmark}</p>
                </div>
              </div>
            </div>

            {/* Timings Card */}
            <div className="bg-cream rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-700 mb-2">Opening Hours</h3>
                  <p className="text-gray-700 mb-2">{restaurantInfo.timings}</p>
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Open Now
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-cream rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-brand-700 mb-2">Contact</h3>
                  <a
                    href={`tel:${restaurantInfo.phone}`}
                    className="text-gray-700 hover:text-brand-700 transition-colors block mb-2"
                  >
                    {restaurantInfo.phone}
                  </a>
                  <a
                    href={`mailto:${restaurantInfo.email}`}
                    className="text-gray-700 hover:text-brand-700 transition-colors block"
                  >
                    {restaurantInfo.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Get Directions Button */}
            <button
              onClick={handleGetDirections}
              className="w-full bg-brand-700 text-white py-4 rounded-xl font-semibold text-lg hover:bg-brand transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span>Get Directions</span>
            </button>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-gold to-gold-dark rounded-2xl p-6 text-center text-white">
              <p className="text-lg font-semibold mb-2">
                📍 Just Minutes from SRM University
              </p>
              <p className="text-sm">
                Perfect spot for delicious food!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
