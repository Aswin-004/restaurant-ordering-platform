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
          <div className="inline-block bg-[#D4AF37]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#8B0000] font-semibold">Visit Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#8B0000] mb-4">
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
            <div className="bg-[#FFF8DC] rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#8B0000] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#8B0000] mb-2">Address</h3>
                  <p className="text-gray-700 mb-1">{restaurantInfo.address}</p>
                  <p className="text-gray-700 mb-2">{restaurantInfo.city}</p>
                  <p className="text-[#D4AF37] font-semibold">{restaurantInfo.landmark}</p>
                </div>
              </div>
            </div>

            {/* Timings Card */}
            <div className="bg-[#FFF8DC] rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#8B0000] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#8B0000] mb-2">Opening Hours</h3>
                  <p className="text-gray-700 mb-2">{restaurantInfo.timings}</p>
                  <div className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                    Open Now
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-[#FFF8DC] rounded-2xl p-8 shadow-lg">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#8B0000] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#8B0000] mb-2">Contact</h3>
                  <a
                    href={`tel:${restaurantInfo.phone}`}
                    className="text-gray-700 hover:text-[#8B0000] transition-colors block mb-2"
                  >
                    {restaurantInfo.phone}
                  </a>
                  <a
                    href={`mailto:${restaurantInfo.email}`}
                    className="text-gray-700 hover:text-[#8B0000] transition-colors block"
                  >
                    {restaurantInfo.email}
                  </a>
                </div>
              </div>
            </div>

            {/* Get Directions Button */}
            <button
              onClick={handleGetDirections}
              className="w-full bg-[#8B0000] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#6B0000] transition-colors shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Navigation className="w-5 h-5" />
              <span>Get Directions</span>
            </button>

            {/* Quick Info */}
            <div className="bg-gradient-to-br from-[#D4AF37] to-[#C49F27] rounded-2xl p-6 text-center text-white">
              <p className="text-lg font-semibold mb-2">
                🎓 Just 5 Minutes from SRM University
              </p>
              <p className="text-sm">
                Perfect spot for students, families, and food lovers!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
