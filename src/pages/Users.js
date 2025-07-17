import { Users } from '../components/Users/Users';
import { Helmet, HelmetProvider } from 'react-helmet-async';
  
  export default function UsersPage() {

    // const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Users</title>
        </Helmet>
        <Users />
      </div>
    </HelmetProvider>
    );
  }