import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

const CART_STORAGE_KEY = 'digicam_cart';

// Load cart from localStorage
const loadCartFromStorage = (): CartState => {
  if (typeof window === 'undefined') {
    return { items: [], totalItems: 0, totalPrice: 0 };
  }
  
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: parsed.items || [],
        totalItems: parsed.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0,
        totalPrice: parsed.items?.reduce((total: number, item: CartItem) => total + item.price * item.quantity, 0) || 0,
      };
    }
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
  }
  
  return { items: [], totalItems: 0, totalPrice: 0 };
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({
      items: state.items,
    }));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Initialize cart from localStorage (call on app mount)
    initializeCart: (state) => {
      const loaded = loadCartFromStorage();
      state.items = loaded.items;
      state.totalItems = loaded.totalItems;
      state.totalPrice = loaded.totalPrice;
    },
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'> & { quantity?: number }>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        existingItem.quantity += action.payload.quantity || 1;
      } else {
        state.items.push({
          ...action.payload,
          quantity: action.payload.quantity || 1,
        });
      }
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      saveCartToStorage(state);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      saveCartToStorage(state);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(item => item.id === action.payload.id);
      
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter(item => item.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      state.totalPrice = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      saveCartToStorage(state);
    },
  },
});

export const { initializeCart, addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
