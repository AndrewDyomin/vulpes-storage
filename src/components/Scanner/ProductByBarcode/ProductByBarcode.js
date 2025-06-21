import { useEffect, useRef, useState } from 'react';
import css from './ProductByBarcode.module.css';
import { BrowserMultiFormatReader } from '@zxing/library';

export const ProductByBarcode = () => {
  const videoRef = useRef(null);
  const selectRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [result, setResult] = useState(null);

  const codeReader = useRef(new BrowserMultiFormatReader());

  useEffect(() => {
  const reader = codeReader.current;

  reader.listVideoInputDevices().then(videoInputDevices => {
    setDevices(videoInputDevices);
    if (videoInputDevices.length > 0) {
      setSelectedDeviceId(videoInputDevices[0].deviceId);
    }
  });

  return () => {
    reader.reset();
  };
}, []);

  const startScan = () => {
    if (!selectedDeviceId) return;

    codeReader.current.decodeFromVideoDevice(
      selectedDeviceId,
      videoRef.current,
      async (result, err) => {
        if (result) {
          try {
            const res = await fetch(`/api/products/${result.text}`);
            const contentType = res.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
              const data = await res.json();

              if (res.status === 200) {
                setResult({
                  name: data.name,
                  article: data.article,
                  barcode: data.barcode,
                });
              } else {
                setResult({ error: data.message });
              }
            } else {
              const text = await res.text();
              console.error('Сервер вернул не JSON:', text);
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
    codeReader.current.reset();
    setResult(null);
  };

  return (
    <div className={css.container}>
      <div className={css.scanBlock}>
        <video ref={videoRef} className={css.videoArea} />
      </div>

      <div className={css.buttonsBlock}>
        <button className={css.button} onClick={startScan}>Start</button>
        <button className={css.button} onClick={stopScan}>Reset</button>
      </div>

      <div className={css.scanBlock}>
        <label htmlFor="sourceSelect">Change video source:</label>
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

      <div className={css.scanBlock}>
        <label>Result:</label>
        {result ? (
          result.error ? (
            <p>{result.error}</p>
          ) : (
            <>
              <p>Название: {result.name}</p>
              <p>Артикул: {result.article}</p>
              <p>Штрихкод: {result.barcode}</p>
            </>
          )
        ) : (
          <p>Нет результата</p>
        )}
      </div>
    </div>
  );
};
