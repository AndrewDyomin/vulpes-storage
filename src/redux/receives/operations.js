import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getReceive = createAsyncThunk(
  'Receive/getOne',
  async (id, thunkAPI) => {
    try {
      const res = await axios.post('/receive-products/get-by-id', { id });
      return JSON.parse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getAllReceives = createAsyncThunk(
  'Receive/getAllReceives',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/receive-products/all');
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addReceive = createAsyncThunk(
  'Receive/add',
  async (data, thunkAPI) => {
    try {
      const res = await axios.post('/receive-products/add', { ...data });
      return JSON.parse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

