import css from './HeroPage.module.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const HeroPage = () => {

  const { t } = useTranslation();

  return (
    <div className={css.container}>
        <div className={css.wrapper}>
            <h1 className={css.heroTitle}>{t('hero title')}</h1>
            <Link to="/products">
            <button className={css.heroBtn}>{t('hero button')}</button>
            </Link>
        </div>
    </div>
  );
};