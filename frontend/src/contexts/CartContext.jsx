import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { generateCartItemId } from '../utils/cartUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { item } = action.payload;
      const itemId = generateCartItemId(item.name);
      
      const existingItem = state.items.find(i => i.id === itemId);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(i =>
            i.id === itemId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...item, id: itemId, quantity: 1 }]
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.itemId)
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id !== itemId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.id === itemId
            ? { ...item, quantity }
            : item
        )
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: []
      };
    }

    case 'LOAD_CART': {
      return {
        ...state,
        items: action.payload.items
      };
    }

    default:
      return state;
  }
};

const initialState = {
  items: []
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const { items } = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: { items } });
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: state.items }));
  }, [state.items]);

  const addItem = (item) => {
    dispatch({ type: 'ADD_ITEM', payload: { item } });
  };

  const removeItem = (itemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { itemId } });
  };

  const updateQuantity = (itemId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const value = {
    items: state.items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemCount,
    getCartTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
