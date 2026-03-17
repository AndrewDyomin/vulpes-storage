import { createSlice } from '@reduxjs/toolkit';
import { logOut } from '../auth/operations';
import { 
  fetchAllProducts, 
  getProduct,
  getProductByBarcode,
  setActiveProduct, 
  deleteProduct, 
  updateProduct,
  searchProduct,
  fetchProductsBarcodes,
  getTranslate,
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
    items: { products: [], pagination: [] },
    activeItem: {},
    barcodes: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearActiveProduct: (state) => {
      state.activeItem = {};
    },
    updateProductField: (state, action) => {
        const { path, value } = action.payload;
        let obj = state.activeItem;

        for (let i = 0; i < path.length - 1; i++) {
          obj = obj[path[i]];
        }

        obj[path[path.length - 1]] = value;
    }
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
      .addCase(fetchProductsBarcodes.pending, handlePending)
      .addCase(fetchProductsBarcodes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.barcodes = action.payload;
      })
      .addCase(fetchProductsBarcodes.rejected, handleRejected)
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
        const updatedProduct = action.payload;
        const index = state.items.products.findIndex(
          item => item._id === updatedProduct._id
        );
        if (index !== -1) {
          state.items.products[index] = updatedProduct;
        }
      })
      .addCase(updateProduct.rejected, handleRejected)
      .addCase(searchProduct.pending, handlePending)
      .addCase(searchProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(searchProduct.rejected, handleRejected)
      .addCase(deleteProduct.pending, handlePending)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload;
      })
      .addCase(deleteProduct.rejected, handleRejected)
      .addCase(getTranslate.pending, handlePending)
      .addCase(getTranslate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.activeItem.name.translatedRU = action.payload.name.RU;
        state.activeItem.name.translatedUA = action.payload.name.UA;
        state.activeItem.description.translatedRU = action.payload.description.RU;
        state.activeItem.description.translatedUA = action.payload.description.UA;
      })
      .addCase(getTranslate.rejected, handleRejected)
      .addCase(logOut.fulfilled, state => {
        state.items = [];
        state.activeItem = {};
        state.error = null;
        state.isLoading = false;
      });
  },
});

export const productsReducer = productsSlice.reducer;
export const { clearActiveProduct, updateProductField } = productsSlice.actions;