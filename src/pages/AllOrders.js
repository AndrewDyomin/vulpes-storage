import { AllOrders } from '../components/Orders/All/AllOrders';
import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../redux/auth/selectors';

  
  export default function Orders() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Orders</title>
        </Helmet>
        <AllOrders />
      </div>
    </HelmetProvider>
    );
  }