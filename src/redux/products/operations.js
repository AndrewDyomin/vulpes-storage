import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

export const getProduct = createAsyncThunk(
  'products/getProduct',
  async (id, thunkAPI) => {
    try {
      const res = await axios.post('/products/get', { id });
      return JSON.parse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const searchProduct = createAsyncThunk(
  'products/searchProduct',
  async (query, thunkAPI) => {
    try {
      const res = await axios.post(`/products/search?page=${query?.page}&limit=${query?.limit}`, { value: query.value });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getProductByBarcode = createAsyncThunk(
  'products/getProductByBarcode',
  async (barcode, thunkAPI) => {
    try {
      const res = await axios.post('/products/bybarcode', { barcode });
      return res.data.product;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchAllProducts = createAsyncThunk(
  'products/fetchAllProducts',
  async (query, thunkAPI) => {
    try {
      const res = await axios.get(`/products/all?page=${query?.page}&limit=${query?.limit}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const setActiveProduct = createAsyncThunk(
  'products/setActiveProduct',
  async (product, thunkAPI) => {
    try {
      return product;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (credentials, thunkAPI) => {
    try {
      await axios.delete('/products/remove', {
        data: credentials,
        headers: {
          'Content-Type': 'application/json'
        }});
      const res = thunkAPI.dispatch(fetchAllProducts());
      return res;
    } catch(error) {
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