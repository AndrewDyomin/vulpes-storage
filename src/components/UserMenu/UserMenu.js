import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { logOut } from '../../redux/auth/operations';
import { useAuth } from 'hooks';
import { useTranslation } from 'react-i18next';
import css from './UserMenu.module.css';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';

export const UserMenu = ({ close }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { user, isLoggedIn } = useAuth();
  const isMobile = useMediaQuery({ query: '(max-width: 833px)' });

  return (
    <div className={isMobile ? css.mobileWrapper : css.wrapper}>
      <p className={css.username}>{user.name}</p>
      {isLoggedIn && isMobile && (
        <div className={css.mobileMenuLinks}>
          <Link className={css.link} to="/orders" onClick={close}>
            {t('orders')}
          </Link>
          <Link className={css.link} to="/products" onClick={close}>
            {t('catalog')}
          </Link>
          {user.description === "administrator" && (
            <div className={css.mobileMenuLinks}>
              <Link className={css.link} to="/room" onClick={close}>{t('my room')}</Link>
            <Link className={css.link} to="/archive" onClick={close}>{t('archive')}</Link>
            </div>
          )}
          {user.description === "administrator" || user.description === "carpenter" || user.description === "seamstress" || user.description === "upholsterer" ? (
            <Link className={css.link} to="/drufts" onClick={close}>{t('my drufts')}</Link>
          ) : <></>}
        </div>
      )}
      <div className={isMobile ? css.propMob : css.prop}>
        <LanguageSelector />
        <button className={css.logoutBtn} type="button" onClick={() => dispatch(logOut())} >
        {t('logout')}
      </button>
      </div>
    </div>
  );
};