import { ForShipping } from '../components/Orders/ForShipping/ForShipping';
import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../redux/auth/selectors';

  
  export default function Shipping() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Shipping</title>
        </Helmet>
        <ForShipping />
      </div>
    </HelmetProvider>
    );
  }