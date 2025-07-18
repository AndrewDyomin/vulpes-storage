import { Helmet, HelmetProvider } from 'react-helmet-async';
import { HeroPage } from 'components/HeroPage/HeroPage';
import { QuickAccessPanel } from '../components/QuickAccessPanel/QuickAccessPanel';
  
  export default function Home() {

    return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>Home</title>
        </Helmet>
        <HeroPage />
        <QuickAccessPanel />
      </div>
    </HelmetProvider>
    );
  }