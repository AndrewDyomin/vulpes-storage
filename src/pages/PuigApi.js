import { PuigApiHome } from 'components/PuigApi/PuigApi';
import { Helmet, HelmetProvider } from 'react-helmet-async';


export default function PuigApi() {

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Puig API</title>
        </Helmet>
        <div>
          <PuigApiHome />
        </div>
      </div>
    </HelmetProvider>
  );
}