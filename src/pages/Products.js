import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ProductsList } from '../components/ProductsList/ProductsList';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllProducts } from '../redux/products/operations';

export default function Products() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllProducts({page: 1, limit: 20}));
  }, [dispatch]);

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
