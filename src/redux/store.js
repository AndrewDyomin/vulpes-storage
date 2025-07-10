import { configureStore } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { authReducer } from './auth/slice';
import { productsReducer } from './products/slice';
import { inventoryCheckReducer } from './inventory/slice';
import { receivesReducer } from './receives/slice'
import refreshTokenMiddleware from './middleware/refreshTokenMiddleware';
import { userReducer } from './user/slice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token'],
};

const productsPersistConfig = {
  key: 'products',
  storage,
  whitelist: ['activeItem'],
}

const inventoryCheckPersistConfig = {
  key: 'inventory',
  storage,
  whitelist: ['activeItem'],
}

const receiveProductsPersistConfig = {
  key: 'receive',
  storage,
  whitelist: ['activeItem'],
}

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    products: persistReducer(productsPersistConfig, productsReducer),
    inventory: persistReducer(inventoryCheckPersistConfig, inventoryCheckReducer),
    receive: persistReducer(receiveProductsPersistConfig, receivesReducer),
    user: userReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(refreshTokenMiddleware),
  devTools: process.env.NODE_ENV === 'development',
});

export const persistor = persistStore(store);
