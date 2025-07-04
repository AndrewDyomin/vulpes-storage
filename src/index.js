import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from 'components/App';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider } from 'react-redux';
import { store, persistor } from './redux/store';
import { I18nextProvider } from 'react-i18next';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import enTranslation from './Locales/en/translation.json';
import ruTranslation from './Locales/ru/translation.json';
import ukTranslation from './Locales/uk/translation.json';
import 'modern-normalize';
import './styles.css';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .init({
    fallbackLng: 'uk',
    debug: false,
    detection: {
      order: [
        'cookie', 
        'localStorage', 
        'navigator', 
        'htmlTag', 
        'path', 
        'subdomain'],
    },
    interpolation: {
      escapeValue: false,
    },
    resources: {
      en: {
        translation: enTranslation,
      },
      uk: {
        translation: ukTranslation,
      },
      ru: {
        translation: ruTranslation,
      },
    },
  });

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter basename="/vulpes-storage">
        {/* <BrowserRouter > */}
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
