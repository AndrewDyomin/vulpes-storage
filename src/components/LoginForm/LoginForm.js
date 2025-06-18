import { useDispatch } from 'react-redux';
import { logIn } from '../../redux/auth/operations';
import css from './LoginForm.module.css';
import { useTranslation } from 'react-i18next';

export const LoginForm = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const handleSubmit = e => {
    e.preventDefault();
    const form = e.currentTarget;
    dispatch(
      logIn({
        email: form.elements.email.value,
        password: form.elements.password.value,
      })
    );
    form.reset();
  };

  return (
    <form className={css.form} onSubmit={handleSubmit} autoComplete="off">
      <label className={css.label}>
      {t('email')}
        <input type="email" name="email" />
      </label>
      <label className={css.label}>
      {t('password')}
        <input type="password" name="password" />
      </label>
      <button type="submit" className={css.btn}>{t('log in')}</button>
    </form>
  );
};