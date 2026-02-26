// Cart calculation utilities

export const DELIVERY_CHARGES = {
  'srm': 20,
  'potheri': 20,
  'guduvanchery': 40,
  'not_serviceable': 0
};

export const MIN_ORDER = {
  delivery: 199,
  pickup: 0
};

export const SERVICEABLE_AREAS = [
  { value: 'srm', label: 'SRM University Area', charge: 20 },
  { value: 'potheri', label: 'Potheri', charge: 20 },
  { value: 'guduvanchery', label: 'Guduvanchery', charge: 40 }
];

export const calculateSubtotal = (cartItems) => {
  return cartItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

export const getDeliveryCharge = (area, deliveryType) => {
  if (deliveryType === 'pickup') return 0;
  
  const normalizedArea = area?.toLowerCase().trim();
  
  if (normalizedArea?.includes('srm')) return DELIVERY_CHARGES.srm;
  if (normalizedArea?.includes('potheri')) return DELIVERY_CHARGES.potheri;
  if (normalizedArea?.includes('guduvanchery')) return DELIVERY_CHARGES.guduvanchery;
  
  return DELIVERY_CHARGES.not_serviceable;
};

export const calculateTotal = (subtotal, deliveryCharge) => {
  return subtotal + deliveryCharge;
};

export const isMinimumOrderMet = (subtotal, deliveryType) => {
  const minOrder = deliveryType === 'delivery' ? MIN_ORDER.delivery : MIN_ORDER.pickup;
  return subtotal >= minOrder;
};

export const getEstimatedDeliveryTime = () => {
  return '45-60 minutes';
};

export const isAreaServiceable = (area) => {
  const normalizedArea = area?.toLowerCase().trim();
  return SERVICEABLE_AREAS.some(serviceArea => 
    normalizedArea?.includes(serviceArea.value)
  );
};

export const formatPrice = (price) => {
  return `₹${price}`;
};

export const generateCartItemId = (itemName, customizations = '') => {
  return `${itemName}-${customizations}`.toLowerCase().replace(/\s+/g, '-');
};
