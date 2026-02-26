// Form validation utilities

export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
    return 'Please enter a valid 10-digit phone number';
  }
  return null;
};

export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return 'Please enter a valid name (minimum 2 characters)';
  }
  if (name.trim().length > 50) {
    return 'Name is too long (maximum 50 characters)';
  }
  return null;
};

export const validateAddress = (address) => {
  if (!address || address.trim().length < 10) {
    return 'Please enter a complete address (minimum 10 characters)';
  }
  if (address.trim().length > 200) {
    return 'Address is too long (maximum 200 characters)';
  }
  return null;
};

export const validateArea = (area) => {
  if (!area || area.trim().length < 2) {
    return 'Please select or enter your area';
  }
  return null;
};

export const validateCheckoutForm = (formData) => {
  const errors = {};
  
  const nameError = validateName(formData.name);
  if (nameError) errors.name = nameError;
  
  const phoneError = validatePhone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  if (formData.deliveryType === 'delivery') {
    const addressError = validateAddress(formData.address);
    if (addressError) errors.address = addressError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const sanitizeInput = (input) => {
  return input.trim().replace(/[<>]/g, '');
};
