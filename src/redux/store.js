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
import { ordersReducer } from './orders/slice'
import { productsReducer } from './products/slice';
import { inventoryCheckReducer } from './inventory/slice';
import { receivesReducer } from './receives/slice'
import refreshTokenMiddleware from './middleware/refreshTokenMiddleware';
import { userReducer } from './user/slice';
import { currencyReducer } from './currency/slice';

const authPersistConfig = {
  key: 'auth',
  storage,
  whitelist: ['token'],
};

const productsPersistConfig = {
  key: 'products',
  storage,
  whitelist: ['activeItem', 'barcodes'],
}

const inventoryCheckPersistConfig = {
  key: 'inventory',
  storage,
  whitelist: ['activeItem', 'draft'],
}

const receiveProductsPersistConfig = {
  key: 'receive',
  storage,
  whitelist: ['activeItem', 'draft'],
}

const ordersPersistConfig = {
  key: 'orders',
  storage,
  whitelist: ['active'],
}

const currencyPersistConfig = {
  key: 'currency',
  storage,
  whitelist: ['rates', 'lastUpdate'],
}

export const store = configureStore({
  reducer: {
    auth: persistReducer(authPersistConfig, authReducer),
    products: persistReducer(productsPersistConfig, productsReducer),
    inventory: persistReducer(inventoryCheckPersistConfig, inventoryCheckReducer),
    receive: persistReducer(receiveProductsPersistConfig, receivesReducer),
    orders: persistReducer(ordersPersistConfig, ordersReducer),
    user: userReducer,
    currency: persistReducer(currencyPersistConfig, currencyReducer),
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: {
        warnAfter: 128,
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['products.barcodes']
      },
      immutableCheck: {
        ignoredPaths: ['products.barcodes.map'],
      }
    }).concat(refreshTokenMiddleware),
  devTools: process.env.NODE_ENV === 'development',
});

export const persistor = persistStore(store);
