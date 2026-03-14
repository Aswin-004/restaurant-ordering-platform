import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, ShoppingBag } from 'lucide-react';
import { menuCategories as fallbackCategories } from '../utils/mockData';
import { useCart } from '../contexts/CartContext';
import { useLocation } from '../contexts/LocationContext';
import { getMenu } from '../services/api';
import toast from 'react-hot-toast';

const Menu = ({ onOpenCart }) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [menuCategories, setMenuCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addedItemId, setAddedItemId] = useState(null);

  const categoryRefs = useRef({});

  const { addItem } = useCart();
  const { isLocationSet } = useLocation();

  useEffect(() => {

    const fetchMenu = async () => {

      try {

        const response = await getMenu(true);

        if (Array.isArray(response.data) && response.data.length > 0) {

          const grouped = {};

          response.data.forEach(item => {

            const cat = item.category || 'Other';

            if (!grouped[cat]) grouped[cat] = [];

            grouped[cat].push({
              name: item.name,
              price: item.price,
              image: item.image,
              description: item.description
            });

          });

          const categories = Object.entries(grouped).map(
            ([name, items], idx) => ({
              id: idx + 1,
              name,
              items
            })
          );

          setMenuCategories(categories);

          if (categories.length > 0) {
            setActiveCategory(categories[0].id);
          }

        } else {

          setMenuCategories(fallbackCategories);

          if (fallbackCategories.length > 0) {
            setActiveCategory(fallbackCategories[0].id);
          }

        }

      } catch {

        setMenuCategories(fallbackCategories);

        if (fallbackCategories.length > 0) {
          setActiveCategory(fallbackCategories[0].id);
        }

      } finally {
        setLoading(false);
      }

    };

    fetchMenu();

  }, []);

  const handleAddToCart = (item, categoryName) => {

    if (!isLocationSet) {

      toast.error('Please select delivery/pickup option first');
      return;

    }

    addItem({
      name: item.name,
      price: item.price,
      category: categoryName,
      image: item.image
    });

    setAddedItemId(item.name);

    setTimeout(() => setAddedItemId(null), 500);

    toast.success(`${item.name} added!`, {
      icon: '🛒',
      duration: 1500
    });

  };

  const scrollToCategory = (catId) => {

    setActiveCategory(catId);

    const el = categoryRefs.current[catId];

    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

  };

  const filteredCategories = menuCategories
    .map(cat => ({
      ...cat,
      items: cat.items.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }))
    .filter(cat => cat.items.length > 0);

  return (

    <section id="menu" className="py-16 md:py-24 bg-cream">

      <div className="container mx-auto px-4">

        {/* Header */}

        <div className="text-center mb-12">

          <span className="inline-block bg-brand-50 text-brand-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-3">
            Our Menu
          </span>

          <h2 className="font-display text-3xl md:text-5xl font-bold text-brand-800 mb-3">
            Explore Our Dishes
          </h2>

          <p className="text-gray-500 max-w-lg mx-auto">
            From aromatic biryanis to sizzling Chinese — something for everyone
          </p>

        </div>

        {/* Search */}

        <div className="max-w-md mx-auto mb-10 relative">

          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

          <input
            type="text"
            placeholder="Search dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm shadow-sm"
          />

        </div>

        {/* Category Pills */}

        {!loading && filteredCategories.length > 0 && (

          <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide max-w-4xl mx-auto justify-center flex-wrap">

            {filteredCategories.map(cat => (

              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? 'bg-brand-700 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-brand-50 hover:text-brand-700 border border-gray-200'
                }`}
              >

                {cat.name}

                <span className="ml-1 text-xs opacity-70">
                  ({cat.items.length})
                </span>

              </button>

            ))}

          </div>

        )}

        {/* Loading */}

        {loading && (

          <div className="max-w-4xl mx-auto space-y-4">

            {[1,2,3].map(i => (

              <div
                key={i}
                className="h-20 rounded-2xl bg-gray-100 animate-pulse"
              />

            ))}

          </div>

        )}

        {/* Menu Items */}

        {!loading && (

          <div className="max-w-4xl mx-auto space-y-8">

            {filteredCategories.map(category => (

              <div
                key={category.id}
                ref={el => (categoryRefs.current[category.id] = el)}
                className="scroll-mt-28"
              >

                {/* Category Title */}

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-9 h-9 bg-brand-700 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {category.items.length}
                  </div>

                  <h3 className="text-xl font-bold text-brand-800">
                    {category.name}
                  </h3>

                  <div className="flex-1 h-px bg-brand-100"></div>

                </div>

                {/* Items */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {category.items.map((item, idx) => (

                    <div
                      key={idx}
                      className={`bg-white rounded-xl p-4 flex items-center gap-4 group hover:shadow-lg transition-all duration-300 border border-gray-100 ${
                        addedItemId === item.name
                          ? 'ring-2 ring-green-400 scale-[1.02]'
                          : ''
                      }`}
                    >

                      {/* Image */}

                      {item.image ? (

                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />

                      ) : (

                        <div className="w-16 h-16 rounded-lg bg-cream-dark flex items-center justify-center flex-shrink-0">

                          <ShoppingBag className="w-6 h-6 text-brand-700/30" />

                        </div>

                      )}

                      {/* Info */}

                      <div className="flex-1 min-w-0">

                        <h4 className="font-semibold text-gray-800 text-sm truncate">
                          {item.name}
                        </h4>

                        {item.description && (

                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {item.description}
                          </p>

                        )}

                        <div className="text-brand-700 font-bold mt-1">
                          ₹{item.price}
                        </div>

                      </div>

                      {/* Add Button */}

                      <button
                        onClick={() => handleAddToCart(item, category.name)}
                        className="bg-brand-50 text-brand-700 hover:bg-brand-700 hover:text-white px-3 py-2 rounded-lg transition-all text-sm font-semibold flex items-center gap-1 flex-shrink-0 opacity-90 group-hover:opacity-100"
                      >

                        <Plus className="w-4 h-4" />

                        Add

                      </button>

                    </div>

                  ))}

                </div>

              </div>

            ))}

          </div>

        )}

        {/* Empty Search */}

        {!loading && filteredCategories.length === 0 && (

          <div className="text-center py-16">

            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />

            <p className="text-gray-400">
              No dishes found for "{searchTerm}"
            </p>

          </div>

        )}

      </div>

    </section>

  );

};

export default Menu;