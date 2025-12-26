import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import productsReducer from './slices/productsSlice';
import categoriesReducer from './slices/categoriesSlice';
import filtersReducer from './slices/filtersSlice';
import userReducer from './slices/userSlice';
import ordersReducer from './slices/ordersSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      cart: cartReducer,
      products: productsReducer,
      categories: categoriesReducer,
      filters: filtersReducer,
      user: userReducer,
      orders: ordersReducer,
    },
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
