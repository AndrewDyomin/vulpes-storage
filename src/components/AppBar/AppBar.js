import { Navigation } from '../Navigation/Navigation';
import { MobileMenuBtn } from '../MobileMenu/MobileMenuBtn'
import { UserMenu } from '../UserMenu/UserMenu';
import { AuthNav } from '../AuthNav/AuthNav';
import { useAuth } from 'hooks';
import { useMediaQuery } from 'react-responsive';
import css from './AppBar.module.css';

export const AppBar = () => {
  const { isLoggedIn } = useAuth();

  const isMobile = useMediaQuery({ query: '(max-width: 833px)' });

  return (
    <header className={css.header}>
      <Navigation />
      {isMobile ? <MobileMenuBtn /> : isLoggedIn ? <UserMenu /> : <AuthNav />}
    </header>
  );
};