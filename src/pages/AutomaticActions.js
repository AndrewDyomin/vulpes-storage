import { AutomaticActions } from '../components/AutomaticActions/AutomaticActions';
import { Helmet, HelmetProvider } from 'react-helmet-async';
  
  export default function Shipping() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Actions</title>
        </Helmet>
        <AutomaticActions />
      </div>
    </HelmetProvider>
    );
  }