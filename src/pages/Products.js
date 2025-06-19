import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ProductsList } from '../components/ProductsList/ProductsList'

export default function Products() {
  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Products</title>
        </Helmet>
        <div>
            <p>Эта страница сейчас в разработке</p>
            <ProductsList />
        </div>
      </div>
    </HelmetProvider>
  );
}