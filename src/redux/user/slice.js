import { createSlice } from '@reduxjs/toolkit';
import { deleteUser, getAllUsers, updateUser } from './operations';

const handlePending = state => {
  state.isLoading = true;
};

const handleRejected = (state, action) => {
  state.error = action.payload;
};

const userSlice = createSlice({
  name: 'user',
  initialState:{},
  extraReducers: (builder) =>
    builder
      .addCase(updateUser.rejected, handleRejected)
      .addCase(getAllUsers.pending, handlePending)
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, handleRejected)
      .addCase(deleteUser.rejected, handleRejected)
});

export const userReducer = userSlice.reducer;