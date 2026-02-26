// Mock data for Classic Restaurant

export const restaurantInfo = {
  name: "Classic Restaurant",
  address: "29, Pillayar Koil Street, Potheri",
  city: "Chennai, Tamil Nadu 603203",
  landmark: "Near SRM University",
  phone: "+918056070976",
  whatsapp: "+918056070976",
  email: "info@classicrestaurant.com",
  timings: "11:00 AM – 11:00 PM (All days)",
  avgCost: "₹500 for two",
  rating: 4.0,
  reviewCount: 62,
  cuisines: ["North Indian", "Chinese", "Seafood", "Biryani", "Pasta", "Fast Food", "Beverages"],
  services: ["Dine-in", "Takeaway", "Home Delivery"],
  payments: "Accepts Digital Payments",
  googleMapEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.3448!2d80.0423!3d12.8230!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDQ5JzIyLjgiTiA4MMKwMDInMzIuMyJF!5e0!3m2!1sen!2sin!4v1234567890"
};

export const bestSellers = [
  {
    id: 1,
    name: "Signature Biryani",
    description: "Aromatic basmati rice layered with tender meat, spices & saffron",
    price: "₹190",
    image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0",
    badge: "Most Popular",
    category: "Biryani"
  },
  {
    id: 2,
    name: "Butter Chicken",
    description: "Creamy tomato-based curry with tender chicken pieces",
    price: "₹240",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398",
    badge: "Chef's Special",
    category: "North Indian"
  },
  {
    id: 3,
    name: "Hakka Noodles",
    description: "Stir-fried noodles with vegetables and choice of protein",
    price: "₹150",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246",
    badge: "Student Favorite",
    category: "Chinese"
  },
  {
    id: 4,
    name: "Seafood Special",
    description: "Fresh catch of the day with exotic spices",
    price: "₹280",
    image: "https://images.unsplash.com/photo-1519351635902-7d60d09cb2ed",
    badge: "Premium",
    category: "Seafood"
  }
];

export const menuCategories = [
  {
    id: 1,
    name: "Biryani",
    items: [
      { name: "Hyderabadi Chicken Biryani", price: 165 },
      { name: "Classic Spl. Biryani", price: 190 },
      { name: "Mugal Chicken Biryani", price: 190 },
      { name: "Tikka Biryani", price: 190 },
      { name: "Tandoori Biryani", price: 200 },
      { name: "Lollypop Biryani", price: 200 },
      { name: "Afgani Biryani", price: 200 },
      { name: "Hyderabadi Mutton Biryani", price: 220 },
      { name: "Prawn Biryani", price: 220 },
      { name: "Fish Biryani", price: 210 },
      { name: "Egg Biryani", price: 135 },
      { name: "Plain Biryani", price: 130 },
      { name: "Veg Biryani", price: 135 },
      { name: "Mushroom Biryani", price: 150 },
      { name: "Paneer Biryani", price: 150 }
    ]
  },
  {
    id: 2,
    name: "Tandoori Starter",
    items: [
      { name: "Tandoori Chicken Full", price: 560 },
      { name: "Tandoori Chicken Half", price: 270 },
      { name: "Tandoori Chicken Quarter", price: 135 },
      { name: "Afgani Chicken Full", price: 560 },
      { name: "Afgani Chicken Half", price: 270 },
      { name: "Afgani Chicken Quarter", price: 150 },
      { name: "Chicken Tikka 6 Pieces", price: 170 },
      { name: "Reshmi Kabab 6 Pieces", price: 180 },
      { name: "Kalmi Kabab 6 Pieces", price: 180 },
      { name: "Tangdi Kabab 2 Pieces", price: 190 },
      { name: "Lassoni Kabab", price: 190 },
      { name: "Badami Kabab", price: 190 },
      { name: "Kalimeri Kabab", price: 185 },
      { name: "Fish Tikka 6 Pieces", price: 260 },
      { name: "Tandoori Prawn 6 Pieces", price: 250 },
      { name: "Tandoori Fish 5 Pieces", price: 210 }
    ]
  },
  {
    id: 3,
    name: "Chinese Side Dish",
    items: [
      { name: "Chilly Chicken", price: 155 },
      { name: "Chicken Manchurian", price: 155 },
      { name: "Pepper Chicken", price: 170 },
      { name: "Garlic Chicken", price: 170 },
      { name: "Szewan Chicken", price: 180 },
      { name: "Dragon Chicken", price: 195 },
      { name: "Crispy Chicken", price: 180 },
      { name: "Chilly Mutton", price: 210 },
      { name: "Mutton Manchurian", price: 210 },
      { name: "Garlic Mutton", price: 220 },
      { name: "Ginger Mutton", price: 220 },
      { name: "Dragon Mutton", price: 230 }
    ]
  },
  {
    id: 4,
    name: "Roti / Naan",
    items: [
      { name: "Roti", price: 25 },
      { name: "Butter Roti", price: 30 },
      { name: "Naan", price: 25 },
      { name: "Butter Naan", price: 30 },
      { name: "Kulchaa", price: 40 },
      { name: "Masala Kulcha", price: 40 },
      { name: "Paneer Kulcha", price: 50 },
      { name: "Garlic Naan", price: 55 },
      { name: "Stuffed Naan Non Veg", price: 75 },
      { name: "Stuffed Naan Veg", price: 65 }
    ]
  },
  {
    id: 5,
    name: "Pasta",
    items: [
      { name: "Chicken Pasta", price: 160 },
      { name: "Mutton Pasta", price: 170 },
      { name: "Fish Pasta", price: 180 },
      { name: "Prawn Pasta", price: 170 },
      { name: "Egg Pasta", price: 110 },
      { name: "Veg Pasta", price: 110 },
      { name: "Paneer Pasta", price: 120 },
      { name: "Mushroom Pasta", price: 120 }
    ]
  }
];

export const whyChooseUs = [
  {
    icon: "DollarSign",
    title: "Affordable Pricing",
    description: "Just ₹500 for two people with generous portions"
  },
  {
    icon: "MapPin",
    title: "Near SRM University",
    description: "Just minutes away from campus - perfect for students"
  },
  {
    icon: "Leaf",
    title: "Vegetarian Friendly",
    description: "Wide variety of vegetarian options available"
  },
  {
    icon: "Clock",
    title: "Quick Service",
    description: "Fast preparation and delivery without compromising quality"
  },
  {
    icon: "Sparkles",
    title: "Clean & Hygienic",
    description: "Maintained to highest cleanliness standards"
  },
  {
    icon: "CreditCard",
    title: "Digital Payments",
    description: "All payment methods accepted for your convenience"
  }
];

export const reviews = [
  {
    id: 1,
    name: "Rahul Sharma",
    rating: 5,
    comment: "Best biryani near SRM! The chicken biryani is absolutely delicious. Affordable prices and quick delivery.",
    date: "2 days ago",
    avatar: "RS"
  },
  {
    id: 2,
    name: "Priya Kumar",
    rating: 4,
    comment: "Great food quality and taste. Love their butter chicken and naan combo. Perfect for weekend dinners.",
    date: "1 week ago",
    avatar: "PK"
  },
  {
    id: 3,
    name: "Arjun Patel",
    rating: 5,
    comment: "As a SRM student, this is my go-to place. Good portions, tasty food, and pocket-friendly prices!",
    date: "2 weeks ago",
    avatar: "AP"
  },
  {
    id: 4,
    name: "Sneha Reddy",
    rating: 4,
    comment: "Loved the Chinese dishes! Hakka noodles and Manchurian were spot on. Will definitely order again.",
    date: "3 weeks ago",
    avatar: "SR"
  }
];

export const gallery = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1689079564957-83e3641c7fd8",
    title: "Restaurant Interior",
    category: "ambience"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a",
    title: "Signature Biryani",
    category: "food"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1707448829764-9474458021ed",
    title: "Butter Chicken Meal",
    category: "food"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1555126634-323283e090fa",
    title: "Chinese Noodles",
    category: "food"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1693743387915-7d190a0e636f",
    title: "Dining Setup",
    category: "ambience"
  },
  {
    id: 6,
    image: "https://images.unsplash.com/photo-1689789330285-18404b1b4b57",
    title: "Cozy Ambience",
    category: "ambience"
  }
];

export const orderOptions = [
  {
    id: 1,
    title: "Order Online",
    description: "Browse menu & place order",
    action: "order",
    icon: "ShoppingBag"
  },
  {
    id: 2,
    title: "Call Now",
    description: "Speak to us directly",
    action: "call",
    phone: "+918056070976",
    icon: "Phone"
  },
  {
    id: 3,
    title: "WhatsApp Order",
    description: "Quick order via WhatsApp",
    action: "whatsapp",
    phone: "+918056070976",
    icon: "MessageCircle"
  }
];
