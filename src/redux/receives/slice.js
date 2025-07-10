import { createSlice } from '@reduxjs/toolkit';
import { 
  getReceive, 
  getAllReceives,
  addReceive,
} from './operations';

const handlePending = state => {
  state.isLoading = true;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const ReceiveSlice = createSlice({
  name: 'receive',
  initialState: {
    items: [],
    activeItem: {},
    isLoading: false,
    error: null,
  },
  extraReducers: builder => {
    builder
      .addCase(getAllReceives.pending, handlePending)
      .addCase(getAllReceives.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload.items;
      })
      .addCase(getAllReceives.rejected, handleRejected)
      .addCase(getReceive.pending, handlePending)
      .addCase(getReceive.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.activeItem = action.payload;
      })
      .addCase(getReceive.rejected, handleRejected)
      .addCase(addReceive.pending, handlePending)
      .addCase(addReceive.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(addReceive.rejected, handleRejected);
  },
});

export const receivesReducer = ReceiveSlice.reducer;