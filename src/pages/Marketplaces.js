import { Marketplaces } from 'components/Marketplaces/Marketplaces';
import { Helmet, HelmetProvider } from 'react-helmet-async';


export default function MarketplacesPage() {

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Marketplaces</title>
        </Helmet>
        <div>
          <Marketplaces />
        </div>
      </div>
    </HelmetProvider>
  );
}