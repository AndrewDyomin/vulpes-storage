import { NavLink } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from 'hooks';
// import { useTranslation } from 'react-i18next';
import css from './Footer.module.css';
import logo from '../../images/vulpes_internet_magazyn 2.jpeg'

export const Footer = () => {
  // const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const isMobile = useMediaQuery({ query: '(max-width: 833px)' });

  return (
    <nav className={css.navBlock}>
      {isLoggedIn && !isMobile && (
        <div>
            {/* <NavLink className={css.link} to="/orders">
            {t('orders')}
            </NavLink> */}
        </div>
      )}
      <NavLink className={css.link} to="/">
        <img src={logo} alt='logo' className={css.logo}/>
        <p>Vulpes Moto™</p>
      </NavLink>
    </nav>
  );
};