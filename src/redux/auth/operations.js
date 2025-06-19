import axios from 'axios';
import { createAsyncThunk } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

const setAuthHeader = token => {
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
};

const clearAuthHeader = () => {
  axios.defaults.headers.common.Authorization = '';
};

export const register = createAsyncThunk(
  'auth/register',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post('/auth/register', credentials);
      setAuthHeader(res.data.token);
      toast.success(`Welcome ${res.data.user.name}`)
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logIn = createAsyncThunk(
  'auth/login',
  async (credentials, thunkAPI) => {
    try {
      const res = await axios.post('/auth/login', credentials);
      setAuthHeader(res.data.token);
      localStorage.setItem('auth', JSON.stringify(res.data));
      toast.success(`Welcome ${res.data.user.name}`)
      return res.data;
    } catch (error) {
      if (error.response.status === 401) {
        toast.error(`Error: wrong login or password`)
      }
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const logOut = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    await axios.post('/auth/logout');
    localStorage.setItem('auth', '');
    clearAuthHeader();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message);
  }
});

export const refreshUser = createAsyncThunk(
  'auth/refresh',
  async (_, thunkAPI) => {
    const state = thunkAPI.getState();
    let persistedToken = state.auth.token;

    if (persistedToken === null) {
      const savedAuth = JSON.parse(localStorage.getItem('auth'));
      if (!savedAuth || savedAuth.length === 0) {
        toast.error('You are not authorized');
        return thunkAPI.rejectWithValue('Unable to fetch user');
      }
      persistedToken = savedAuth.token;
    }

    try {
      setAuthHeader(persistedToken);
      const res = await axios.post('/auth/current');
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);
