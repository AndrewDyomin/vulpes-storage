import { RoasStat } from '../components/RoasStat/RoasStat';
import { Helmet, HelmetProvider } from 'react-helmet-async';
  
  export default function Shipping() {

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Statistic</title>
        </Helmet>
        <RoasStat />
      </div>
    </HelmetProvider>
    );
  }