import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectProductsBarcodes } from '../../redux/products/selectors';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { setDraft } from '../../redux/receives/slice';
import { OrdersByArticle } from '../OrdersByArticle/OrdersByArticle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import css from './BarcodeScanner.module.css';
import { PopUp } from 'components/PopUp/PopUp';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const BtBarcodeScanner = ({ listDate, setDraftLoaded }) => {
  const allBarcodes = useSelector(selectProductsBarcodes);
  const draft = useSelector(state => state.receive.draft);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const beepRef = useRef(null);
  const draftRef = useRef(draft);
  const [scannedBarcode, setScannedBarcode] = useState(null);
  const [notFoundModal, setNotFoundModal] = useState(false);
  const [article, setArticle] = useState('');
  const [count, setCount] = useState(0);

  // SYNC DRAFT
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // ADD BEEP SOUND
  useEffect(() => {
    beepRef.current = new Audio('/vulpes-storage/beep.m4a');
    beepRef.current.preload = 'auto';

    return () => {
      beepRef.current?.pause();
      beepRef.current = null;
    };
  }, []);

  const playBeep = async count => {
    const audio = beepRef.current;

    if (!audio) return;

    for (let i = 0; i < count; i++) {
      try {
        audio.currentTime = 0;
        await audio.play();
        await sleep(350);
      } catch (error) {
        console.error('Beep error:', error);
        break;
      }
    }
  };

  const addItemToList = () => {
    const currentDraft = draftRef.current;
    let newDraft;
    const item = {
      article,
      barcode: scannedBarcode,
      count: Number(count),
      newBarcode: true,
    };

    if (!currentDraft) {
      newDraft = {
        name: listDate(),
        items: [item],
      };
    } else {
      newDraft = {
        ...currentDraft,
        items: [...currentDraft.items, item],
      };
    }

    dispatch(setDraft(newDraft));
    draftRef.current = newDraft;
    setNotFoundModal(false);
    setArticle('');
    setCount(0);
  };

  // SCANNETR LISTENER
  useEffect(() => {
    let buffer = '';

    const handleKeyDown = async e => {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (!buffer) return;

        const barcode = buffer;
        setScannedBarcode(buffer);
        buffer = '';

        try {
          const product = allBarcodes.map[barcode];

          // Берем актуальный draft из ref
          const currentDraft = draftRef.current;

          if (!currentDraft) {
            const newDraft = {
              name: listDate(),
              items: [
                {
                  article: product.article,
                  barcode,
                  count: 1,
                },
              ],
            };

            dispatch(setDraft(newDraft));
            draftRef.current = newDraft;
          } else if (
            currentDraft.items.some(item => item.barcode === barcode)
          ) {
            const newDraft = {
              ...currentDraft,
              items: currentDraft.items.map(item =>
                item.barcode === barcode
                  ? {
                      ...item,
                      count: item.count + 1,
                    }
                  : item
              ),
            };

            dispatch(setDraft(newDraft));
            draftRef.current = newDraft;
          } else {
            const newDraft = {
              ...currentDraft,
              items: [
                ...currentDraft.items,
                {
                  article: product.article,
                  barcode,
                  count: 1,
                },
              ],
            };

            dispatch(setDraft(newDraft));
            draftRef.current = newDraft;
          }

          await playBeep(1);
          setDraftLoaded(false);
        } catch (error) {
          await playBeep(3);
          toast.error(t('product not found'));
          setNotFoundModal(true);
        }

        return;
      }

      // Добавляем символы штрихкода
      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, listDate, setDraftLoaded, t, allBarcodes]);

  if (scannedBarcode) {
    const product = allBarcodes.map[scannedBarcode];

    return (
      <div className={css.orderInfo}>
        <InfoOutlinedIcon className={css.infoIcon} />
        <p className={css.orderInfoTitle}>{product?.article}</p>
        <OrdersByArticle item={product} />
        {/* HAND-ADD ARTICLE */}
        <PopUp
          isOpen={notFoundModal}
          close={() => setNotFoundModal(false)}
          body={
            <div className={`${css.countArea} ${css.notFoundArea}`}>
              <p>{t('product not found')}</p>
              <input
                value={scannedBarcode}
                placeholder={t('barcode')}
                onChange={e => {}}
                className={css.countInput}
                disabled={true}
              />
              <input
                value={article}
                placeholder={t('article')}
                onChange={e => setArticle(e.target.value)}
                className={css.countInput}
              />
              <input
                value={count}
                placeholder={t('count')}
                onChange={e => setCount(e.target.value)}
                type="number"
                className={css.countInput}
              />
              <button className={css.countAddBtn} onClick={addItemToList}>
                {t('add')}
              </button>
            </div>
          }
        />
      </div>
    );
  }
};
