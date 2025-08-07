import { RoiStat } from '../components/RoiStat/RoiStat';
import { Helmet, HelmetProvider } from 'react-helmet-async';
  
  export default function Shipping() {

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Statistic</title>
        </Helmet>
        <RoiStat />
      </div>
    </HelmetProvider>
    );
  }