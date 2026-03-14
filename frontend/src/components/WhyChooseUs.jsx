import React from 'react';
import { DollarSign, MapPin, Leaf, Clock, Sparkles, CreditCard } from 'lucide-react';
import { whyChooseUs } from '../utils/mockData';

const iconMap = {
  DollarSign,
  MapPin,
  Leaf,
  Clock,
  Sparkles,
  CreditCard
};

const WhyChooseUs = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gold/10 px-4 py-2 rounded-full mb-4">
            <span className="text-brand-700 font-semibold">Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-brand-700 mb-4">
            Why Choose Classic Restaurant?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your perfect dining destination in Potheri
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {whyChooseUs.map((feature, index) => {
            const Icon = iconMap[feature.icon];
            return (
              <div
                key={index}
                className="group bg-cream rounded-2xl p-8 hover:bg-brand-700 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                {/* Icon */}
                <div className="w-16 h-16 bg-gold rounded-xl flex items-center justify-center mb-6 group-hover:bg-white transition-colors">
                  <Icon className="w-8 h-8 text-white group-hover:text-brand-700" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-brand-700 mb-3 group-hover:text-white transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 group-hover:text-white/90 transition-colors">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 bg-gradient-to-br from-brand-800 to-brand-900 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
                4.0
              </div>
              <div className="text-white text-sm md:text-base">Star Rating</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
                62+
              </div>
              <div className="text-white text-sm md:text-base">Happy Reviews</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
                100+
              </div>
              <div className="text-white text-sm md:text-base">Menu Items</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-gold mb-2">
                12hrs
              </div>
              <div className="text-white text-sm md:text-base">Daily Service</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
