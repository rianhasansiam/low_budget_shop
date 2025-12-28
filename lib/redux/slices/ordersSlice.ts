import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types based on the order schema
export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  image?: string;
}

export interface ShippingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  _id: string;
  customer_name: string;
  email: string;
  phone: string;
  order_date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address: ShippingAddress;
  items: OrderItem[];
  payment_method: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersPagination {
  total: number;
  limit: number;
  skip: number;
  hasMore: boolean;
}

interface OrdersState {
  items: Order[];
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  selectedOrder: Order | null;
  pagination: OrdersPagination | null;
}

const initialState: OrdersState = {
  items: [],
  loading: false,
  error: null,
  hasFetched: false,
  selectedOrder: null,
  pagination: null,
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
      state.hasFetched = true;
    },
    setOrdersPagination: (state, action: PayloadAction<OrdersPagination>) => {
      state.pagination = action.payload;
    },
    setOrdersLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setOrdersError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    selectOrder: (state, action: PayloadAction<Order>) => {
      state.selectedOrder = action.payload;
    },
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.items.unshift(action.payload);
      if (state.pagination) {
        state.pagination.total += 1;
      }
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.items.findIndex((o) => o._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedOrder?._id === action.payload._id) {
        state.selectedOrder = action.payload;
      }
    },
    updateOrderStatus: (state, action: PayloadAction<{ id: string; status: Order['status'] }>) => {
      const index = state.items.findIndex((o) => o._id === action.payload.id);
      if (index !== -1) {
        state.items[index].status = action.payload.status;
        state.items[index].updatedAt = new Date().toISOString();
      }
      if (state.selectedOrder?._id === action.payload.id) {
        state.selectedOrder.status = action.payload.status;
        state.selectedOrder.updatedAt = new Date().toISOString();
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((o) => o._id !== action.payload);
      if (state.selectedOrder?._id === action.payload) {
        state.selectedOrder = null;
      }
      if (state.pagination) {
        state.pagination.total -= 1;
      }
    },
    clearOrders: (state) => {
      state.items = [];
      state.hasFetched = false;
      state.selectedOrder = null;
      state.pagination = null;
    },
  },
});

export const {
  setOrders,
  setOrdersPagination,
  setOrdersLoading,
  setOrdersError,
  selectOrder,
  clearSelectedOrder,
  addOrder,
  updateOrder,
  updateOrderStatus,
  deleteOrder,
  clearOrders,
} = ordersSlice.actions;

export default ordersSlice.reducer;
