import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category?: string;
  inStock?: boolean;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
  totalItems: number;
}

const WISHLIST_STORAGE_KEY = 'engineersgadget_wishlist';

// Load wishlist from localStorage
const loadWishlistFromStorage = (): WishlistState => {
  if (typeof window === 'undefined') {
    return { items: [], totalItems: 0 };
  }
  
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        items: parsed.items || [],
        totalItems: parsed.items?.length || 0,
      };
    }
  } catch (error) {
    console.error('Error loading wishlist from localStorage:', error);
  }
  
  return { items: [], totalItems: 0 };
};

// Save wishlist to localStorage
const saveWishlistToStorage = (state: WishlistState) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify({
      items: state.items,
    }));
  } catch (error) {
    console.error('Error saving wishlist to localStorage:', error);
  }
};

const initialState: WishlistState = {
  items: [],
  totalItems: 0,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Initialize wishlist from localStorage (call on app mount)
    initializeWishlist: (state) => {
      const loaded = loadWishlistFromStorage();
      state.items = loaded.items;
      state.totalItems = loaded.totalItems;
    },
    addToWishlist: (state, action: PayloadAction<Omit<WishlistItem, 'addedAt'>>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (!existingItem) {
        state.items.push({
          ...action.payload,
          addedAt: new Date().toISOString(),
        });
        state.totalItems = state.items.length;
        saveWishlistToStorage(state);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalItems = state.items.length;
      saveWishlistToStorage(state);
    },
    clearWishlist: (state) => {
      state.items = [];
      state.totalItems = 0;
      saveWishlistToStorage(state);
    },
    toggleWishlist: (state, action: PayloadAction<Omit<WishlistItem, 'addedAt'>>) => {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      
      if (existingIndex >= 0) {
        state.items.splice(existingIndex, 1);
      } else {
        state.items.push({
          ...action.payload,
          addedAt: new Date().toISOString(),
        });
      }
      state.totalItems = state.items.length;
      saveWishlistToStorage(state);
    },
  },
});

export const { initializeWishlist, addToWishlist, removeFromWishlist, clearWishlist, toggleWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
