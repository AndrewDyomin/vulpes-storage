import { Helmet, HelmetProvider } from 'react-helmet-async';
import { HeroPage } from 'components/HeroPage/HeroPage';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/auth/selectors';
import { QuickAccessPanel } from '../components/QuickAccessPanel/QuickAccessPanel';
  
  export default function Home() {

    const user = useSelector(selectUser);

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <HeroPage />
        {user.role === 'owner' && 
        <QuickAccessPanel />}
      </div>
    </HelmetProvider>
    );
  }