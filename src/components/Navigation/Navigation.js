import { NavLink } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useAuth } from 'hooks';
import { useTranslation } from 'react-i18next';
import css from './Navigation.module.css';
import logo from '../../images/logo 2.png'

export const Navigation = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useAuth();
  const isMobile = useMediaQuery({ query: '(max-width: 833px)' });

  return (
    <nav className={css.navBlock}>
      <NavLink className={css.link} to="/">
        <img src={logo} alt='logo' className={css.logo}/>
      </NavLink>
      {isLoggedIn && !isMobile && (
        <>
          <NavLink className={css.link} to="/orders">
            {t('orders')}
          </NavLink>
          <NavLink className={css.link} to="/products">
            {t('catalog')}
          </NavLink>
          {user.description !== "guest" && <NavLink className={css.link} to="/drufts">
            {t('my drufts')}
          </NavLink>}
          {user.description === "administrator" && (
            <NavLink className={css.link} to="/room">{t('my room')}</NavLink>
          )}
        </>
      )}
    </nav>
  );
};