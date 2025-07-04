import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const getInventoryCheck = createAsyncThunk(
  'InventoryCheck/getOne',
  async (id, thunkAPI) => {
    try {
      const res = await axios.post('/inventory-check/by-id', { id });
      return JSON.parse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getAllInventoryChecks = createAsyncThunk(
  'InventoryCheck/getAllInventoryChecks',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/inventory-check/all');
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const addInventoryCheck = createAsyncThunk(
  'InventoryCheck/add',
  async (data, thunkAPI) => {
    try {
      const res = await axios.post('/inventory-check/add', { ...data });
      return JSON.parse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

