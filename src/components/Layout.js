import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppBar } from './AppBar/AppBar';
import { Suspense } from 'react';
import { Footer } from './Footer/Footer';
import css from './Layout.module.css'

export const Layout = () => {
  return (
    <div className={css.layout}>
      <AppBar className={css.header}/>
      <div className={css.main}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
      <Footer className={css.footer}/>
    </div>
  );
};
