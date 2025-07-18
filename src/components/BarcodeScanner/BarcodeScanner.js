import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import css from './BarcodeScanner.module.css';
import { BrowserMultiFormatReader } from '@zxing/library';
import { getProductByBarcode } from '../../redux/products/operations';
import { useDispatch, useSelector } from 'react-redux';
import { selectActiveProduct } from '../../redux/products/selectors';
import { useTranslation } from 'react-i18next';

export const BarcodeScanner = forwardRef(({ setLastResult }, ref) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeItem = useSelector(selectActiveProduct);
  const videoRef = useRef(null);
  const selectRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [result, setResult] = useState(null);
  const [activeScanner, setActiveScanner] = useState(false);

  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
    const reader = codeReader.current;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      })
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

  useImperativeHandle(ref, () => ({
    startScan,
    stopScan,
  }));

  const startScan = () => {
    setActiveScanner(true);
    if (!selectedDeviceId) return;

    codeReader.current.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.current,
      async (result, err) => {
        if (result) {
          try {
            if (result?.text[0] !== 'H') {
              setLastResult(result.text);
              dispatch(getProductByBarcode(result.text));
            }
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

  useEffect(() => {
    if (activeItem && activeItem.article) {
      stopScan();
    }
    if (activeItem === null) {
      stopScan();
    }
  }, [activeItem, result]);

  useEffect(() => {
    if (activeScanner) {
      stopScan();
      startScan();
    }
  }, [selectedDeviceId]);

  return (
    <div className={css.container}>
      <div className={css.scanBlock}>
        <video
          ref={videoRef}
          className={activeScanner ? css.videoArea : css.hide}
        />
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
    </div>
  );
});
