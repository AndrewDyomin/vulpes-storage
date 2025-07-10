import { ReceiveDetails } from '../components/ReceiveDetails/ReceiveDetails';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectLoading } from '../redux/inventory/selectors';
import { ClockLoader } from 'react-spinners';

export default function InventoryCheck() {
  const isLoading = useSelector(selectLoading);
  const { receiveId } = useParams();

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>List of products received</title>
        </Helmet>
        {isLoading ? <ClockLoader color="#c04545" /> : <ReceiveDetails id={receiveId} />}
      </div>
    </HelmetProvider>
  );
}