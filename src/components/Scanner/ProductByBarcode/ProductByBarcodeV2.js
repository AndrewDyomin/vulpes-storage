import { useEffect, useRef, useState } from 'react';
import css from './ProductByBarcode.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { getProductByBarcode, setActiveProduct, } from '../../../redux/products/operations';
import { selectActiveProduct, selectProductsError } from '../../../redux/products/selectors';
import { ClipLoader } from 'react-spinners';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import PrintIcon from '@mui/icons-material/Print';
import logo from 'images/logo 2.png';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import axios from 'axios';
import { PopUp } from '../../PopUp/PopUp';
import QRCode from "react-qr-code";
import Select from 'react-select';

export const ProductByBarcodeV2 = () => {
  const [searchValue, setSearchValue] = useState('');
  const [barcode, setBarcode] = useState(null);
  const [mode, setMode] = useState('search')
  const [pending, setPending] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [shelves, setShelves] = useState([]);
  const [currentShelf, setCurrentShelf] = useState(null);
  const { t } = useTranslation();
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const activeProduct = useSelector(selectActiveProduct);
  const error = useSelector(selectProductsError);

  const createShelf = async() => {
    setPending(true);
    await axios.get("/shelves/add");
    setPending(false);
    setShelves([]);
  }

  useEffect(() => {
    dispatch(setActiveProduct({}))
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
      } catch(err) {
        toast.error(err)
      } finally {
        setPending(false);
      }
    }

    if (!shelves?.length) {
      getAllShelves();
    }
  }, [shelves])

  return (
    <div>
      <div className={css.search}>
        {mode === 'search' && 
        <input
          ref={inputRef}
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          className={css.searchInput}
        />}
        <Select 
          name='mode-selector' 
          className={css.modeSelector}
          onChange={(e) => (setMode(e.value))}
          placeholder={t(mode)}
          options={[
            {value: 'search', label: t('search')}, 
            {value: 'add to shelf', label: t('add to shelf')}
          ]}
        />
      </div>
      
      {pending && 
      <div className={css.loader}>
        <ClipLoader color="#c04545" size="30px"/>
      </div>
      }
      {notFound && 
        <p className={css.notFound}>{t('product not found')}</p>
      }
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
        {shelves?.length > 0 &&
        <ul className={css.shelvesList}>
          {shelves.map(shelf => (
            <li key={shelf._id} className={css.shelf}>
              <p className={css.shelfName}>{shelf.name}</p>
              <p className={css.shelfItems}>{shelf.items.reduce((acc, item) => acc + Number(item.count), 0)}{t('pcs')}.</p>
              <button className={css.qrBtn} onClick={() => setCurrentShelf(shelf)}>
                <QrCode2Icon fontSize='large'/>
              </button>
            </li>
          ))}
        </ul>
        }
        <button 
          className={css.addShelfBtn}
          onClick={createShelf}
        >
          <AddCircleOutlineIcon fontSize='large'/>
        </button>
      </div>
      <PopUp
        isOpen={currentShelf ? true : false}
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

            <button
              className={css.printBtn}
              onClick={() => window.print()}
            >
              <PrintIcon />
            </button>
          </div>
        }
      />
      {currentShelf && (
        <div className={css.printArea}>
          <div className={css.printName}>
            {currentShelf.name}
          </div>
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
