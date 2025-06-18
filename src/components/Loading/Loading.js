import css from './Loading.module.css';
import logo from '../../images/logo 2.png'

export const Loading = () => {

  return (
    <div className={css.wrapper}>
      <div className={css.container}>
        <img className={css.logo} src={logo} alt='Vulpes Moto'/>
      </div>
    </div>
  );
};