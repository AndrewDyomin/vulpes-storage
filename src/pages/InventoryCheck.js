import { InventoryCheckList } from '../components/InventoryCheckList/InventoryCheckList';
import { Helmet, HelmetProvider } from 'react-helmet-async';
// import { useSelector } from 'react-redux';
// import { selectUser } from '../redux/auth/selectors';

  
  export default function InventoryCheck() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Inventory check</title>
        </Helmet>
        <InventoryCheckList />
      </div>
    </HelmetProvider>
    );
  }