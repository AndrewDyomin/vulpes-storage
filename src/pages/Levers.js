import { Helmet, HelmetProvider } from 'react-helmet-async';
import { LeversConstructor } from 'components/LeversConstructor/LeversConstructor';
import { useTranslation } from 'react-i18next';

export default function Levers() {
    const { t } = useTranslation();
  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{t('levers')}</title>
        </Helmet>
        <LeversConstructor />
      </div>
    </HelmetProvider>
  );
}