import { ReceiveProducts } from '../components/ReceiveProducts/ReceiveProducts';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
  
  export default function GetProductsIn() {
    const { t } = useTranslation();

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{t('add products')}</title>
        </Helmet>
        <ReceiveProducts />
      </div>
    </HelmetProvider>
    );
  }