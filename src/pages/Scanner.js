import { ProductByBarcode } from '../components/Scanner/ProductByBarcode/ProductByBarcode';
import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../redux/auth/selectors';

  
  export default function Home() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Scanner</title>
        </Helmet>
        <ProductByBarcode />
      </div>
    </HelmetProvider>
    );
  }