import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { menuCategories } from '../utils/mockData';

const Menu = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const filteredCategories = menuCategories.map((category) => ({
    ...category,
    items: category.items.filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter((category) => category.items.length > 0);

  return (
    <section id="menu" className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-[#D4AF37]/10 px-4 py-2 rounded-full mb-4">
            <span className="text-[#8B0000] font-semibold">Our Menu</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-[#8B0000] mb-4">
            Explore Our Delicious Menu
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-8">
            From aromatic biryanis to flavorful Chinese dishes - we have something for everyone
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for dishes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#8B0000] transition-colors"
            />
          </div>
        </div>

        {/* Menu Categories */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-[#FFF8DC] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-[#F5EBCD] transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-[#8B0000] rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {category.items.length}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-[#8B0000]">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.items.length} items
                    </p>
                  </div>
                </div>
                {expandedCategory === category.id ? (
                  <ChevronUp className="w-6 h-6 text-[#8B0000]" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-[#8B0000]" />
                )}
              </button>

              {/* Category Items */}
              {expandedCategory === category.id && (
                <div className="px-6 pb-6 space-y-3">
                  {category.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0 hover:bg-white/50 px-4 rounded-lg transition-colors"
                    >
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{item.name}</h4>
                      </div>
                      <div className="text-lg font-bold text-[#8B0000]">
                        ₹{item.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No dishes found matching "{searchTerm}"</p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            Prices may vary. Please confirm with staff for current pricing and availability.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Menu;
