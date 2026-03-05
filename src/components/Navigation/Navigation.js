import { NavLink } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from 'hooks';
import { useTranslation } from 'react-i18next';
import { ClipLoader } from 'react-spinners';
import css from './Navigation.module.css';
import logo from '../../images/logo 2.png'
import { selectProductsBarcodes, selectProductsLoading } from '../../redux/products/selectors';
import { useEffect } from 'react';
import { fetchProductsBarcodes } from '../../redux/products/operations';

export const Navigation = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn } = useAuth();
  const isMobile = useMediaQuery({ query: '(max-width: 833px)' });
  const dispatch = useDispatch();
  const lastBarcodes = useSelector(selectProductsBarcodes);
  const isProductsLoading = useSelector(selectProductsLoading);
  const now = Date.now();

  // 86400000

  useEffect(() => {
    if (!isProductsLoading && isLoggedIn && (!lastBarcodes || now - lastBarcodes?.date > 20000)) {
      dispatch(fetchProductsBarcodes());
    }
  }, [lastBarcodes, dispatch, now, isLoggedIn, isProductsLoading])

  return (
    <nav className={css.navBlock}>
      <NavLink className={css.link} to="/">
        <img src={logo} alt='logo' className={css.logo}/>
      </NavLink>
      {isProductsLoading && <ClipLoader color="#c04545" size="30px" className={css.loader}/>}
      {isLoggedIn && !isMobile && (
        <>
          
          {user.description === "administrator" && (
            <NavLink className={css.link} to="/room">{t('my room')}</NavLink>
          )}
        </>
      )}
    </nav>
  );
};