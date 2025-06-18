import { Helmet, HelmetProvider } from 'react-helmet-async';
import { HeroPage } from 'components/HeroPage/HeroPage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllProducts } from '../redux/products/operations';

  
  export default function Home() {

    const dispatch = useDispatch();

    useEffect(() => {
      dispatch(fetchAllProducts());
    }, [dispatch]);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <HeroPage />
      </div>
    </HelmetProvider>

    );
  }