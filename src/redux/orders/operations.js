import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

export const getOrder = createAsyncThunk(
  'orders/getOrder',
  async (id, thunkAPI) => {
    try {
      const res = await axios.post('/orders/id', { id });
      return JSON.parse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchAllOrders = createAsyncThunk(
  'orders/fetchAllOrders',
  async (_, thunkAPI) => {
    try {
      const res = await axios.get('/orders/all');
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const setActiveOrder = createAsyncThunk(
  'orders/setActiveOrder',
  async (order, thunkAPI) => {
    try {
      return order;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  // 'products/updateProduct',
  // async (credentials, thunkAPI) => {
  //   try {
  //     const updated = await axios.post('/collections/update', {
  //       data: credentials,
  //       headers: {
  //       'Content-Type': 'multipart/form-data'
  //     }});
  //     thunkAPI.dispatch(setActiveProduct(updated.data));
  //     const res = thunkAPI.dispatch(fetchAllProducts());
  //     return res;
  //   } catch(error) {
  //     return thunkAPI.rejectWithValue(error.message);
  //   }
  // }
);