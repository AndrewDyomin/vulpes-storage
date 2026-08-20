import { ProductByBarcodeV2 } from '../components/Scanner/ProductByBarcode/ProductByBarcodeV2';
// import { ProductByBarcode } from '../components/Scanner/ProductByBarcode/ProductByBarcode';
import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../redux/auth/selectors';

  
  export default function Scanner() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Scanner</title>
        </Helmet>
        {/* <ProductByBarcode /> */}
        <ProductByBarcodeV2 />
      </div>
    </HelmetProvider>
    );
  }