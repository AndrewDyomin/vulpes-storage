import { createSlice } from '@reduxjs/toolkit';
import { logOut } from '../auth/operations';
import { 
  fetchAllProducts, 
  getProduct,
  getProductByBarcode,
  setActiveProduct, 
  deleteProduct, 
  updateProduct 
} from './operations';

const handlePending = state => {
  state.isLoading = true;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    activeItem: {},
    isLoading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllProducts.pending, handlePending)
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(fetchAllProducts.rejected, handleRejected)
      .addCase(getProduct.pending, handlePending)
      .addCase(getProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.activeItem = action.payload;
      })
      .addCase(getProduct.rejected, handleRejected)
      .addCase(getProductByBarcode.pending, handlePending)
      .addCase(getProductByBarcode.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.activeItem = action.payload;
      })
      .addCase(getProductByBarcode.rejected, handleRejected)
      .addCase(setActiveProduct.fulfilled, (state, action) => {
        state.activeItem = action.payload;
      })
      .addCase(updateProduct.pending, handlePending)
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(updateProduct.rejected, handleRejected)
      .addCase(deleteProduct.pending, handlePending)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(deleteProduct.rejected, handleRejected)
      .addCase(logOut.fulfilled, state => {
        state.items = [];
        state.activeItem = {};
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const productsReducer = productsSlice.reducer;