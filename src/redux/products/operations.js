import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import toast from 'react-hot-toast';

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
      const res = await axios.post(`/products/search?page=${query?.page}&limit=${query?.limit}`, { value: query.value, filter: query.filter, sort: query.sort });
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
      const res = await axios.get(`/products/all?page=${query?.page}&limit=${query?.limit}&stockfilter=${query?.filter.inStock}&sort=${query.sort}`);
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const fetchProductsBarcodes = createAsyncThunk(
  'products/fetchProductsBarcodes',
  async (_, thunkAPI) => {
    try {
      let page = 1;
      const result = { date: Date.now(), map: {} }
      const products = [];
      while (true) {
        const res = await axios.get(`/products/all-barcodes?page=${page}&limit=1000`);
        products.push(...res.data.products);
        page ++;
        if (res.data.products.length < 1000) break;
      }

      products.forEach(p => {
        if (p.barcode !== '') {
          result.map[p.barcode] = p;
        }
      })
      
      return result;
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
  'products/updateProduct',
  async (data, thunkAPI) => {
    try {
      const res = await axios.post('/products/update', { data });

      toast.success(`${res.data.message}`);

      return res.data.update;
    } catch(error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const getTranslate = createAsyncThunk(
  'products/getTranslate',
  async (data, thunkAPI) => {
    try {
      const res = await axios.post('/products/get-translate', data);

      toast.success(`${res.data?.message}`);

      return res.data.product;
    } catch(error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);