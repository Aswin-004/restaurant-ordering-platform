import React from 'react';
import { gallery } from '../utils/mockData';

const Gallery = () => {
  return (
    <section className="py-16 md:py-24 bg-[#FFF8DC]">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#8B0000]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#8B0000] font-semibold">Gallery</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#8B0000] mb-4">
            A Glimpse Inside
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Experience our delicious food and cozy ambience
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative h-80 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-white font-bold text-xl mb-2">{item.title}</h3>
                  <span className="inline-block bg-[#D4AF37] text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
