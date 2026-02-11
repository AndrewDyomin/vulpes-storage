import { MoteaOrderTemplate } from '../components/MoteaOrderTemplate/MoteaOrderTemplate';
import { Helmet, HelmetProvider } from 'react-helmet-async';

export default function SendOrderToMotea() {
  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>SendOrderToMotea</title>
        </Helmet>
        <MoteaOrderTemplate />
      </div>
    </HelmetProvider>
  );
}
