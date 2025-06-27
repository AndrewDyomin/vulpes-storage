import { Helmet, HelmetProvider } from 'react-helmet-async';
import { HeroPage } from 'components/HeroPage/HeroPage';
import { useSelector } from 'react-redux';
import { selectUser } from '../redux/auth/selectors';
import { QuickAccessPanel } from '../components/QuickAccessPanel/QuickAccessPanel';
import { useEffect, useState } from 'react';
  
  export default function Home() {

    const user = useSelector(selectUser);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
      if (user.role === 'owner' && !visible) {
        setVisible(true);
      }
    }, [user.role, visible])

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <HeroPage />
        {visible && 
        <QuickAccessPanel />}
      </div>
    </HelmetProvider>
    );
  }