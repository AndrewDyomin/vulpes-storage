import { createSlice } from '@reduxjs/toolkit';
import { 
  getInventoryCheck, 
  getAllInventoryChecks,
  addInventoryCheck,
} from './operations';

const handlePending = state => {
  state.isLoading = true;
};

const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = action.payload;
};

const InventoryCheckSlice = createSlice({
  name: 'inventoryCheck',
  initialState: {
    items: [],
    activeItem: {},
    draft: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setDraft(state, action) {
      state.draft = action.payload;
    },
    clearDraft(state) {
      state.draft = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getAllInventoryChecks.pending, handlePending)
      .addCase(getAllInventoryChecks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.items = action.payload.items;
      })
      .addCase(getAllInventoryChecks.rejected, handleRejected)
      .addCase(getInventoryCheck.pending, handlePending)
      .addCase(getInventoryCheck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.activeItem = action.payload;
      })
      .addCase(getInventoryCheck.rejected, handleRejected)
      .addCase(addInventoryCheck.pending, handlePending)
      .addCase(addInventoryCheck.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.draft = null;
      })
      .addCase(addInventoryCheck.rejected, handleRejected);
  },
});

export const { setDraft, clearDraft } = InventoryCheckSlice.actions;
export const inventoryCheckReducer = InventoryCheckSlice.reducer;