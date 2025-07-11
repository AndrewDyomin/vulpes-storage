import { createSlice } from '@reduxjs/toolkit';
import { logOut } from '../auth/operations';
import { 
  fetchAllOrders, 
  fetchOrdersByFilter,
  getOrder,
  setActiveOrder,
} from './operations';

const handlePending = state => {
  state.isLoading = true;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    all: [],
    active: {},
    isLoading: false,
    error: null,
  },
  reducers: {
    clearActiveOrder: (state) => {
      state.active = {};
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllOrders.pending, handlePending)
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.all = action.payload;
      })
      .addCase(fetchAllOrders.rejected, handleRejected)
      .addCase(fetchOrdersByFilter.pending, handlePending)
      .addCase(fetchOrdersByFilter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.all = action.payload.data;
      })
      .addCase(fetchOrdersByFilter.rejected, handleRejected)
      .addCase(getOrder.pending, handlePending)
      .addCase(getOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.active = action.payload;
      })
      .addCase(getOrder.rejected, handleRejected)
      .addCase(setActiveOrder.fulfilled, (state, action) => {
        state.active = action.payload;
      })
      .addCase(logOut.fulfilled, state => {
        state.all = [];
        state.active = {};
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const ordersReducer = ordersSlice.reducer;
export const { clearActiveProduct } = ordersSlice.actions;