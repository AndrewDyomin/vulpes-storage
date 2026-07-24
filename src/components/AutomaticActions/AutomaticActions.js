import css from './AutomaticActions.module.css';
import axios from 'axios';
import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClockLoader } from 'react-spinners';
import BackupTableOutlinedIcon from '@mui/icons-material/BackupTableOutlined';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
// import UpdateIcon from '@mui/icons-material/Update';
import { PopUp } from '../PopUp/PopUp';
import { EditableTable } from '../EditableTable/EditableTable';
import { useGoogleLogin } from '@react-oauth/google';

export function useGoogleReauth() {
  const promiseRef = useRef(null);

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/drive',

    onSuccess: async ({ code }) => {
      try {
        await axios.post('/marketplaces/refresh-google-oauth-token', { code });

        promiseRef.current?.resolve();
      } catch (err) {
        promiseRef.current?.reject(err);
      } finally {
        promiseRef.current = null;
      }
    },

    onError: (err) => {
      promiseRef.current?.reject(err);
      promiseRef.current = null;
    },
  });

  return () => {
    if (promiseRef.current) {
      return Promise.reject(new Error('Google auth already in progress'));
    }

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      login();
    });
  };
}

export const AutomaticActions = () => {
  const { t } = useTranslation();
  const googleReauth = useGoogleReauth();
  const [isPending, setIsPending] = useState(false);
  // const [articlesSended, setArticlesSended] = useState(false);
  const [isBrokerTableOpen, setIsBrokerTableOpen] = useState(false);

  const closeModal = () => {
    setIsBrokerTableOpen(false);
  };

  const downloadAvailabilityTableHandler = async () => {
    setIsPending(true);
    await axios
      .post('/products/availability')
      .then(response => toast.success(t(response.data.message)))
      .catch(response => toast.success(t(response.data.message)));
    setIsPending(false);
  };

  const sendTableValues = async (values, invoice) => {
    const data = { values, invoiceName: invoice?.name || '' }
    try {
      const response = await axios.post(
        '/files/download-table-for-broker',
        { data },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', "Zoll_Vulpes_Motea.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при скачивании:', error.message);
      toast.error(`Ошибка при скачивании: ${error.message}`);
    }
  };

  const checkOutdatedImagesHandler = async () => {
    try {
      const res = await axios.get('/marketplaces/check-images-from-outdated-products');
      if (res?.data?.error === 'invalid_grant') {
        await googleReauth();
        return checkOutdatedImagesHandler();
      }
      toast.success("Проверка изображений запущена. О результатах отчитаюсь в телеграм.");
    } catch(err) {
      toast.error("Что-то пошло не так. Попробуй позже.");
    }
  }

  // const updatePromTableHandler = async () => {
  //   setIsPending(true);
  //   toast.success("Это может занять несколько минут");
  //   await axios
  //     .post('/products/update-prom-base')
  //     .then(response => toast.success(t(response.data.message)))
  //     .catch(response => toast.error(t(response.data.message)));
  //   setIsPending(false);
  // }

  // const updateZakupkaXmlHandler = async () => {
  //   setIsPending(true);
  //   try {
  //     await axios.get('/files/update-zakupka');
  //     toast.success('XML file to Zakupka.com updated.')
      
  //   } catch (err) {
  //     toast.error('Error! Please try again later...');
  //   }
    
  //   setIsPending(false);
  // }

  return (
    <>
      <div className={css.buttonsArea}>
        <div className={css.button} onClick={downloadAvailabilityTableHandler}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <BackupTableOutlinedIcon />
              <p>{t('download availability table')}</p>
            </>
          )}
        </div>
        <div className={css.button} onClick={() => setIsBrokerTableOpen(true)}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <BackupTableOutlinedIcon />
              <p>{t('create table for broker')}</p>
            </>
          )}
        </div>
        <div className={css.button} onClick={() => checkOutdatedImagesHandler()}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <ImageNotSupportedIcon />
              <p>{t('check images from outdated products')}</p>
            </>
          )}
        </div>
        {/* <div className={css.button} onClick={updatePromTableHandler}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <BackupTableOutlinedIcon />
              <p>{t('update prom table')}</p>
            </>
          )}
        </div> */}
        {/* <div className={css.button} onClick={updateZakupkaXmlHandler}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <UpdateIcon />
              <p>{t('update zakupka xml')}</p>
            </>
          )}
        </div> */}
      </div>
      <PopUp
        isOpen={isBrokerTableOpen}
        close={closeModal}
        body={
          <>
            <p className={css.tableTitle}>{t('articles list')}</p>
            <EditableTable send={sendTableValues}/>
          </>
        }
      />
    </>
  );
};
