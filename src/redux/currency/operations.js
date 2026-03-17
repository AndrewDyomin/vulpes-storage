import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { selectUpdate } from './selectors';

export const fetchCurrency = createAsyncThunk(
  'currency/fetchCurrency',
  async (_, thunkAPI) => {
    try {
        const { data } = await axios.get('https://api.monobank.ua/bank/currency');

        const findRate = (codeA, codeB) =>
            data.find(
            item =>
                item.currencyCodeA === codeA &&
                item.currencyCodeB === codeB
            );

        function normalize(num) {
            return Math.round((num + Number.EPSILON) * 100) / 100
        }

        const usd = findRate(840, 980); // USD → UAH
        const eur = findRate(978, 980); // EUR → UAH

        return {
            USD: {
            buy: normalize(usd?.rateBuy) || normalize(usd?.rateCross),
            sell: normalize(usd?.rateSell) || normalize(usd?.rateCross),
            },
            EUR: {
            buy: normalize(eur?.rateBuy) || normalize(eur?.rateCross),
            sell: normalize(eur?.rateSell) || normalize(eur?.rateCross),
            },
            UAH: {
            buy: 1,
            sell: 1,
            },
        };
    } catch (err) {
      console.log(err)
      return thunkAPI.rejectWithValue(err.message);
    }
  }, {
    condition: (_, { getState }) => {
      const state = getState();
      const lastUpdate = selectUpdate(state);
      const isLoading = state.currency.isLoading;

      if (isLoading) return false;
      if (!lastUpdate) return true;

      const diff = Date.now() - lastUpdate;

      return diff > 600000;
    }
  }
);