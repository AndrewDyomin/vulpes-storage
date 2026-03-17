import { createSlice } from '@reduxjs/toolkit';
import { fetchCurrency } from './operations';

const currencySlice = createSlice({
  name: 'currency',
  initialState: {
    rates: {
      USD: { buy: null, sell: null },
      EUR: { buy: null, sell: null },
      UAH: { buy: 1, sell: 1 },
    },
    lastUpdate: 0,
    isLoading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchCurrency.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchCurrency.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.rates = action.payload;
        state.lastUpdate = Date.now();
      })
      .addCase(fetchCurrency.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const currencyReducer = currencySlice.reducer;