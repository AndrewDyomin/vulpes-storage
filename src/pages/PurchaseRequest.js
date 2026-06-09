import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { PurchaseList } from 'components/PurchaseRequest/PurchaseRequest';


export default function PurchaseRequest() {
  const { t } = useTranslation();

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{t('purchase requests')}</title>
        </Helmet>
        <div>
          <PurchaseList />
        </div>
      </div>
    </HelmetProvider>
  );
}