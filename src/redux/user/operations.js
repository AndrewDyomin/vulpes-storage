import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data, thunkAPI) => {
    try {
      const response = await axios.post('/users/update', data);
      thunkAPI.dispatch(getAllUsers());
      toast.success(`${response.data.message}`)
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getAllUsers = createAsyncThunk(
  'user/getAllUsers',
  async (_, thunkAPI) => {
    try {
      const response = await axios.get('users/all');
      return response.data.usersArray;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (data, thunkAPI) => {
    try {
      const response = await axios.post('users/delete', data);
      thunkAPI.dispatch(getAllUsers());
      toast.success(`${response.data.message}`)
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);