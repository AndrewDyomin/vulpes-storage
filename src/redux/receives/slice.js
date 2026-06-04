import { createSlice } from '@reduxjs/toolkit';
import { 
  getReceive, 
  getAllReceives,
  addReceive,
  getAllInvoices,
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
    invoices: null,
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
    updateInvoices(state, action) {
      const { _id, invoices } = action.payload;
      const receive = state.items.find(
        item => item._id === _id
      );
      if (receive) {
        receive.invoices = invoices;
      }
    } 
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
        state.draft = null;
        state.error = null;
      })
      .addCase(addReceive.rejected, handleRejected)
      .addCase(getAllInvoices.pending, handlePending)
      .addCase(getAllInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.invoices = action.payload;
      })
      .addCase(getAllInvoices.rejected, handleRejected);
  },
});

export const { setDraft, clearDraft, updateInvoices } = ReceiveSlice.actions;
export const receivesReducer = ReceiveSlice.reducer;