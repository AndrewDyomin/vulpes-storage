import { useEffect, useRef, useState } from 'react';
import css from './ProductByBarcode.module.css';
import { BrowserMultiFormatReader } from '@zxing/library';
import { getProductByBarcode } from '../../../redux/products/operations';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveProduct } from '../../../redux/products/selectors';
// import { clearActiveProduct } from '../../../redux/products/slice';
import { PopUp } from 'components/PopUp/PopUp';
import { useTranslation } from 'react-i18next';

export const ProductByBarcode = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeItem = useSelector(selectActiveProduct);
  const videoRef = useRef(null);
  const selectRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [result, setResult] = useState(null);
  const [lastResult, setLastResult] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeScanner, setActiveScanner] = useState(false);

  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const reader = codeReader.current;

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then(() => {
        return reader.listVideoInputDevices();
      })
      .then(videoInputDevices => {
        setDevices(videoInputDevices);
        if (videoInputDevices.length > 0) {
          setSelectedDeviceId(videoInputDevices[0].deviceId);
        }
      })
      .catch(err => {
        console.error('Ошибка доступа к камере:', err);
      });

    return () => {
      reader.reset();
    };
  }, []);

  const startScan = () => {
    setActiveScanner(true);
    if (!selectedDeviceId) return;

    codeReader.current.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.current,
      async (result, err) => {
        if (result) {
          try {
            setLastResult(result.text);
            dispatch(getProductByBarcode(result.text));

            // const res = await fetch(`/api/products/${result.text}`);
            // const contentType = res.headers.get('content-type');

            // if (contentType && contentType.includes('application/json')) {
            //   const data = await res.json();

            //   if (res.status === 200) {
            //     setResult({
            //       name: data.name,
            //       article: data.article,
            //       barcode: data.barcode,
            //     });
            //   } else {
            //     setResult({ error: data.message });
            //   }
            // } else {
            //   const text = await res.text();
            //   console.error('Сервер вернул не JSON:', text);
            // }
          } catch (error) {
            console.error(error);
            setResult({ error: 'Ошибка запроса к серверу' });
          }
        }
      }
    );
  };

  const stopScan = () => {
    setActiveScanner(false);
    codeReader.current.reset();
    setResult(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (activeItem && activeItem.article) {
      stopScan();
      setIsModalOpen(true);
    }
    if (activeItem === null) {
      setIsModalOpen(true);
      stopScan();
    }
  }, [activeItem, result]);

  return (
    <div className={css.container}>
      <div className={css.scanBlock}>
        <video ref={videoRef} className={activeScanner ? css.videoArea : css.hide} />
      </div>

      <div className={css.buttonsBlock}>
        <button className={css.button} onClick={startScan}>
          {t('start')}
        </button>
        <button className={css.button} onClick={stopScan}>
          {t('reset')}
        </button>
      </div>

      <div className={css.scanBlock}>
        <label htmlFor="sourceSelect">{t('change video source')}:</label>
        <select
          ref={selectRef}
          id="sourceSelect"
          value={selectedDeviceId}
          onChange={e => setSelectedDeviceId(e.target.value)}
        >
          {devices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label || `Camera ${device.deviceId}`}
            </option>
          ))}
        </select>
      </div>
      <PopUp
        isOpen={isModalOpen}
        close={closeModal}
        body={
          activeItem && activeItem.article ? (
            <div className={css.modalArea}>
              {Array.isArray(activeItem.images) &&
              activeItem.images.length > 0 ? (
                <img
                  className={css.modalImage}
                  alt="scanned product"
                  src={activeItem.images[0]}
                />
              ) : (
                <p>No image</p>
              )}
              <p>{`${activeItem.name?.UA || 'Без названия'} (${
                activeItem.article
              })`}</p>
              <p>
                {activeItem.price?.UAH
                  ? `${activeItem.price.UAH} грн.`
                  : 'Цена не указана'}
              </p>
            </div>
          ) : activeItem === null ? (
            <div>
              <p>Товар не найден!</p>
              <p>Штрихкод: {lastResult}</p>
            </div>
          ) : null
        }
      />
    </div>
  );
};
