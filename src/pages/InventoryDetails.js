import { InventoryCheckDetails } from '../components/InventoryCheckDetails/InventoryCheckDetails';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectLoading } from '../redux/inventory/selectors';
import { ClockLoader } from 'react-spinners';
// import { selectUser } from '../redux/auth/selectors';

export default function InventoryCheck() {
  const isLoading = useSelector(selectLoading);
  const { inventoryId } = useParams();

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Inventory check details</title>
        </Helmet>
        {isLoading ? <ClockLoader color="#c04545" /> : <InventoryCheckDetails id={inventoryId} />}
      </div>
    </HelmetProvider>
  );
}