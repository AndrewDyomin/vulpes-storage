import { NavLink } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';
import { useTranslation } from 'react-i18next';
import css from './AuthNav.module.css';
import { LanguageSelector } from '../LanguageSelector/LanguageSelector';

export const AuthNav = ({ close }) => {

  const { t } = useTranslation();
  const isMobile = useMediaQuery({ query: '(max-width: 833px)' });

  return (
    <div className={isMobile ? css.mobileLinkBlock : css.linkBlock}>
      <NavLink className={css.link} to="/register" onClick={close}>
        {t('register')}
      </NavLink>
      <NavLink className={css.link} to="/login" onClick={close}>
        {t('log in')}
      </NavLink>
      <LanguageSelector />
    </div>
  );
};
