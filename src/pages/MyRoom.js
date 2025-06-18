import { Helmet, HelmetProvider } from 'react-helmet-async';
import { fetchAllProducts } from '../redux/products/operations';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { getAllUsers } from '../redux/user/operations';

export default function MyRoom() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllProducts());
    toast.success('All products fetch requested');
    dispatch(getAllUsers());
    toast.success('All users fetch requested');
  }, [dispatch]);

  return (
    <>
      <HelmetProvider>
          <Helmet>
              <title>My room</title>
          </Helmet>
          <h1>It's your private room</h1>
          
      </HelmetProvider>
    </>
  );
}