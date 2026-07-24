import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppBar } from './AppBar/AppBar';
import { Suspense, useEffect, useState } from 'react';
import { Footer } from './Footer/Footer';
import css from './Layout.module.css'
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const Layout = () => {
  const [searchParams] = useSearchParams();
  const { i18n } = useTranslation();

  // isIframe?
  const embedded = searchParams.get('embedded') === 'true';

  // set Language
  useEffect(() => {
    const lang = searchParams.get('lang');

    if (lang) {
      i18n.changeLanguage(lang);
    }
  }, [searchParams, i18n]);

  // change height if add block
  useEffect(() => {
    if (!embedded) return;
    const observer = new ResizeObserver(() => {
      window.parent.postMessage(
        {
          type: 'resize',
          height: document.documentElement.scrollHeight,
        },
        '*'
      );
    });
    observer.observe(document.body);
    return () => observer.disconnect();
  }, [embedded]);

  return (
    embedded ? 
    <div className={css.layout}>
      <div className={css.main}>
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </div>
      <Toaster position="top-center" reverseOrder={false} />
    </div>
     : 
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
