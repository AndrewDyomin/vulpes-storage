import { useEffect, useRef, useState } from 'react';
import css from './ProductByBarcode.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  getProductByBarcode,
  searchProduct,
  setActiveProduct,
} from '../../../redux/products/operations';
import {
  selectActiveProduct,
  selectProductsBarcodes,
  selectProductsError,
} from '../../../redux/products/selectors';
import { ClipLoader } from 'react-spinners';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import logo from 'images/logo 2.png';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { PopUp } from '../../PopUp/PopUp';
import QRCode from 'react-qr-code';
import Select from 'react-select';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const ProductByBarcodeV2 = () => {
  const [searchValue, setSearchValue] = useState('');
  const [barcodes, setBarcodes] = useState([]);
  const [mode, setMode] = useState('search');
  const [pending, setPending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [shelves, setShelves] = useState([]);
  const [currentShelf, setCurrentShelf] = useState(null);
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const beepRef = useRef(null);
  const dispatch = useDispatch();
  const activeProduct = useSelector(selectActiveProduct);
  const error = useSelector(selectProductsError);
  const allBarcodes = useSelector(selectProductsBarcodes);

  const createShelf = async () => {
    setPending(true);
    await axios.get('/shelves/add');
    setPending(false);
    setShelves([]);
  };

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

  const normalizeBarcode = value => {
    const ruToEn = {
      ё: '`',
      й: 'q',
      ц: 'w',
      у: 'e',
      к: 'r',
      е: 't',
      н: 'y',
      г: 'u',
      ш: 'i',
      щ: 'o',
      з: 'p',
      х: '[',
      ъ: ']',

      ф: 'a',
      ы: 's',
      в: 'd',
      а: 'f',
      п: 'g',
      р: 'h',
      о: 'j',
      л: 'k',
      д: 'l',
      ж: ';',
      э: "'",

      я: 'z',
      ч: 'x',
      с: 'c',
      м: 'v',
      и: 'b',
      т: 'n',
      ь: 'm',
      б: ',',
      ю: '.',
    };

    return [...value].map(char => ruToEn[char.toLowerCase()] || char).join('');
  };

  // ADD BEEP SOUND
  useEffect(() => {
    beepRef.current = new Audio('/vulpes-storage/beep.m4a');
    beepRef.current.preload = 'auto';

    return () => {
      beepRef.current?.pause();
      beepRef.current = null;
    };
  }, []);

  useEffect(() => {
    dispatch(setActiveProduct({}));
  }, [dispatch]);

  useEffect(() => {
    if (error === 'Request failed with status code 404') {
      setNotFound(true);
    } else {
      setNotFound(false);
    }
  }, [activeProduct, error]);

  useEffect(() => {
    async function getAllShelves() {
      try {
        setPending(true);
        const { data } = await axios.get('/shelves/all');
        setShelves(data);
      } catch (err) {
        toast.error(err);
      } finally {
        setPending(false);
      }
    }

    if (!shelves?.length) {
      getAllShelves();
    }
  }, [shelves]);

  // ---- SCANNER LISTENER ----
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

        const barcode = normalizeBarcode(buffer);
        buffer = '';

        try {
          if (barcode.includes('shelf')) {
            const id = barcode.replace('shelf-', '');
            setCurrentShelf({ _id: id });
          } else {
            const product = allBarcodes.map[barcode];
            if (!product?.article) {
              throw new Error();
            }

            if (barcodes.some(p => p.article === product.article)) {
              setBarcodes(prev =>
                prev.map(p =>
                  p.article === product.article
                    ? { ...p, count: Number(p.count + 1) }
                    : p
                )
              );
            } else {
              setBarcodes(prev => [...prev, { ...product, count: 1 }]);
            }
          }
          await playBeep(1);
        } catch (error) {
          await playBeep(3);
          toast.error(t('product not found'));
        }

        return;
      }

      // Добавляем символы штрихкода
      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    if (mode === 'add to shelf') {
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mode, t, allBarcodes, barcodes]);

  // ---- SAVE SHELF PRODUCTS ----
  useEffect(() => {
    async function saveShelf() {
      try {
        setPending(true);
        const { data } = await axios.post('/shelves/update', {
          products: barcodes,
          shelf: currentShelf,
        });
        toast.success(data.message);
        setBarcodes([]);
        setCurrentShelf(null);
      } catch (err) {
        toast.error('something went wrong');
      } finally {
        setPending(false);
      }
    }

    if (!barcodes?.length || !currentShelf) return;
    saveShelf();
  }, [barcodes, currentShelf]);

  // ---- PRODUCT SEARCH ----
  useEffect(() => {
    if (searchValue === '') {
      dispatch(setActiveProduct({}));
      setNotFound(false);
      return;
    }

    async function search() {
      const product = allBarcodes.map[searchValue];
      if (!product?.article) {
        const { payload } = await dispatch(
          searchProduct({ value: searchValue, limit: 1, page: 1 })
        );

        if (!payload?.products?.length) {
          setNotFound(true);
        }
        dispatch(setActiveProduct(payload.products[0]));
      } else {
        dispatch(getProductByBarcode(searchValue));
      }
    }

    // if (searchValue !== '') {
    //   search();
    // }
    search();
  }, [searchValue, allBarcodes, dispatch]);

  return (
    <div>
      <div className={css.search}>
        {mode === 'search' && (
          <form
            className={css.searchForm}
            onSubmit={e => {
              e.preventDefault();
              setSearchValue(e.target[0].value);
            }}
          >
            <input
              ref={inputRef}
              name="searchInput"
              className={css.searchInput}
              autoComplete="off"
              onChange={e => {
                if (e.target.value === '') {
                  setSearchValue('');
                }
              }}
            />
            <button type="submit" className={css.searchBtn}>
              <SearchIcon />
            </button>
          </form>
        )}
        <Select
          name="mode-selector"
          className={css.modeSelector}
          onChange={e => setMode(e.value)}
          value={{ value: mode, label: t(mode) }}
          options={[
            { value: 'search', label: t('search') },
            { value: 'add to shelf', label: t('add to shelf') },
          ]}
        />
      </div>

      {pending && (
        <div className={css.loader}>
          <ClipLoader color="#c04545" size="30px" />
        </div>
      )}
      {notFound && <p className={css.notFound}>{t('product not found')}</p>}
      {activeProduct?._id && (
        <div className={css.productCard}>
          <img
            className={css.productImg}
            src={activeProduct.images?.[0] || logo}
            onError={e => {
              e.currentTarget.src = logo;
            }}
            alt={activeProduct.name?.UA || 'Изображение'}
          />
          <div className={css.productInfo}>
            <p>
              {`(${activeProduct?.article}) `}
              {activeProduct.name.UA !== '' && activeProduct.name.UA !== null
                ? activeProduct.name.UA
                : activeProduct.name.DE}
            </p>

            <div>
              <p>
                {t('quantity in stock')}: {activeProduct.quantityInStock}
              </p>
              <p>
                {t('availability in motea')}:{' '}
                {t(activeProduct.availabilityInMotea) || t('unknown')}
              </p>
            </div>
          </div>
        </div>
      )}
      <div className={css.shelvesArea}>
        {/* WITHOUT SEARCH FILTER */}
        {shelves?.length > 0 && !activeProduct?._id && (
          <ul className={css.shelvesList}>
            {shelves.map(shelf => (
              <li key={shelf._id} className={css.shelf}>
                <p className={css.shelfName}>{shelf.name}</p>
                <p className={css.shelfItems}>
                  {shelf.items.reduce(
                    (acc, item) => acc + Number(item.count),
                    0
                  )}
                  {t('pcs')}.
                </p>
                <button
                  className={css.qrBtn}
                  onClick={() => setCurrentShelf(shelf)}
                >
                  <QrCode2Icon fontSize="large" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {/* WITH SEARCH FILTER */}
        {shelves?.length > 0 && activeProduct?._id && (
          <ul className={css.shelvesList}>
            {shelves
              .filter(s =>
                s.items.some(i => i.article === activeProduct.article)
              )
              .map(shelf => (
                <li key={shelf._id} className={css.shelf}>
                  <p className={css.shelfName}>{shelf.name}</p>
                  <p className={css.shelfItems}>
                    {shelf.items.reduce(
                      (acc, item) =>
                        item.article === activeProduct.article
                          ? acc + Number(item.count)
                          : acc,
                      0
                    )}
                    {t('pcs')}.
                  </p>
                  <button
                    className={css.qrBtn}
                    onClick={() => setCurrentShelf(shelf)}
                  >
                    <QrCode2Icon fontSize="large" />
                  </button>
                </li>
              ))}
          </ul>
        )}
        <button className={css.addShelfBtn} onClick={createShelf}>
          <AddCircleOutlineIcon fontSize="large" />
        </button>
      </div>

      {/* QR - MODAL */}
      <PopUp
        isOpen={currentShelf && mode !== 'add to shelf' ? true : false}
        close={() => setCurrentShelf(null)}
        body={
          <div className={css.qrArea}>
            <QRCode
              size={256}
              style={{
                height: 'auto',
                maxWidth: '100%',
                width: '100%',
              }}
              value={`shelf-${currentShelf?._id}`}
              viewBox="0 0 256 256"
              title={currentShelf?.name}
            />

            <button className={css.printBtn} onClick={() => window.print()}>
              <PrintIcon />
            </button>
          </div>
        }
      />

      {/* ADD TO SHELF MODAL */}
      <PopUp
        isOpen={mode === 'add to shelf' ? true : false}
        close={() => {
          setShelves([]);
          setMode('search');
        }}
        body={
          <div className={css.qrArea}>
            {!barcodes?.length ? (
              <p>{t('scan any product')}</p>
            ) : (
              <>
                <ul>
                  {barcodes.map((p, index) => (
                    <li key={p.article + index}>
                      {p.article} - {p.count}
                      {t('pcs')}.
                    </li>
                  ))}
                </ul>

                {!currentShelf && <p>{t("if that's all, scan the shelf.")}</p>}
              </>
            )}
          </div>
        }
      />

      {/* --- AREA TO PRINT --- */}
      {currentShelf && (
        <div className={css.printArea}>
          <div className={css.printName}>{currentShelf.name}</div>
          <QRCode
            size={256}
            value={`shelf-${currentShelf._id}`}
            viewBox="0 0 256 256"
          />
        </div>
      )}
    </div>
  );
};
