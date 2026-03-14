import React from "react";
import { Star, ShoppingBag } from "lucide-react";
import { bestSellers } from "../utils/mockData";
import { useCart } from "../contexts/CartContext";
import { useLocation as useLocationContext } from "../contexts/LocationContext";
import toast from "react-hot-toast";

const BestSellers = ({ onOrderClick }) => {

  const { addItem } = useCart();
  const { isLocationSet } = useLocationContext();

  const handleAddToCart = (item) => {

    if (!isLocationSet) {
      onOrderClick();
      return;
    }

    const price =
      typeof item.price === "string"
        ? parseInt(item.price.replace(/[^\d]/g, ""), 10)
        : item.price;

    addItem({
      name: item.name,
      price,
      category: item.category,
    });

    toast.success(`${item.name} added to cart!`);
  };

  return (

    <section className="py-20 md:py-28 bg-cream">

      <div className="container mx-auto px-4">

        {/* Section Header */}

        <div className="text-center mb-14">

          <div className="inline-block bg-brand-50 px-4 py-2 rounded-full mb-4 shadow-sm">
            <span className="text-brand-700 font-semibold text-sm">
              Customer Favorites
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-display font-bold text-brand-800 mb-4">
            Our Best Sellers
          </h2>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            The most loved dishes our customers order again and again
          </p>

        </div>

        {/* Grid */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {bestSellers.map((item) => (

            <div
              key={item.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >

              {/* Image */}

              <div className="relative h-56 overflow-hidden">

                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Badge */}

                <div className="absolute top-4 right-4 bg-gold text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  {item.badge}
                </div>

                {/* Category */}

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                  {item.category}
                </div>

              </div>

              {/* Content */}

              <div className="p-6">

                <h3 className="text-xl font-bold text-brand-800 mb-1">
                  {item.name}
                </h3>

                <p className="text-gray-500 text-sm mb-5 line-clamp-2">
                  {item.description}
                </p>

                {/* Price + Button */}

                <div className="flex items-center justify-between">

                  <div className="text-2xl font-bold text-brand-700">
                    {typeof item.price === "string"
                      ? item.price
                      : `₹${item.price}`}
                  </div>

                  <button
                    onClick={() => handleAddToCart(item)}
                    className="bg-gold text-black px-4 py-2 rounded-lg hover:bg-gold-dark hover:shadow-lg transition-all font-semibold text-sm flex items-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Add
                  </button>

                </div>

                {/* Rating */}

                <div className="flex items-center mt-5 pt-4 border-t border-gray-100">

                  <div className="flex items-center gap-0.5">

                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3.5 h-3.5 text-gold fill-current"
                      />
                    ))}

                  </div>

                  <span className="ml-2 text-xs text-gray-500">
                    Highly Rated
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

export default BestSellers;