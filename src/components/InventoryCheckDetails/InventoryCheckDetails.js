import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { selectAllInventoryChecks } from '../../redux/inventory/selectors';
import { selectActiveProduct } from '../../redux/products/selectors';
import { clearActiveProduct } from '../../redux/products/slice';
import { selectUser } from '../../redux/auth/selectors';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PopUp } from '../PopUp/PopUp';
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner';
import css from './InventoryCheckDetails.module.css';
import { useTranslation } from 'react-i18next';

export const InventoryCheckDetails = ({ id }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allChecks = useSelector(selectAllInventoryChecks);
  const activeItem = useSelector(selectActiveProduct);
  const scannerRef = useRef();
  const target = allChecks.find(check => check._id === id);
  const user = useSelector(selectUser);
  const [activeItems, setActiveItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableItems, setEditableItems] = useState([]);
  const [scan, setScan] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const [count, setCount] = useState();
  const [article, setArticle] = useState()

  const fetchProductByArticle = async article => {
    const res = await axios.post('/products/byarticle', { article });
    return res.data.product;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDelModalOpen(false);
    setIsScanModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.post('/inventory-check/delete', { id });
      toast.success('Документ удалён');
      closeModal();
      window.history.back();
    } catch (err) {
      console.error('Ошибка при удалении:', err.message);
      toast.error('Ошибка при удалении');
    }
  };

  const handleSave = async () => {
    const result = {
      id: target._id,
      items: [],
    };

    editableItems.forEach((item, index) => {
      const input = document.getElementById(`${index}Count`);
      const count = input ? Number(input.value) : 0;
      const article =
        item.article !== ''
          ? item.article
          : document.getElementById(`${index}Article`).value;

      result.items.push({
        article,
        count,
      });
    });

    try {
      await axios.post('/inventory-check/update', result);
      toast.success('Документ обновлён');
      window.history.back();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleScan = () => {
    setScan(true)
  }

  const startEdit = () => {
    setEditableItems([...target.items]);
    setEditMode(true);
    closeModal();
  };

  const handleAdd = () => {
    setEditableItems(prev => [...prev, { article: '', count: '' }]);
  };

  const addItemToList = () => {
      setEditableItems(prevState => [...prevState, {article: !article ? activeItem.article : article, count}])
      setIsScanModalOpen(false);
      setArticle();
      setCount();
      dispatch(clearActiveProduct());
      scannerRef.current?.startScan()
    }

  const downloadXlsx = async () => {
  try {
    const response = await axios.post(
      '/inventory-check/download',
      { id },
      { responseType: 'blob' }
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Ошибка при скачивании:', error.message);
    toast.error(`Ошибка при скачивании: ${error.message}`);
  }
};

  useEffect(() => {
    if (!target || !target.items?.length) return;

    const fetchAllProducts = async () => {
      const results = [];
      for (const item of target.items) {
        try {
          const product = await fetchProductByArticle(item.article);
          results.push(product);
        } catch (err) {
          console.error(
            `Ошибка загрузки артикула ${item.article}:`,
            err.message
          );
        }
      }
      setActiveItems(results);
    };

    fetchAllProducts();
  }, [target]);

    useEffect(() => {
    if (lastResult === '') return;

    if (activeItem && activeItem.article) {
      setIsScanModalOpen(true);
    }
    if (activeItem === null) {
      setIsScanModalOpen(true);
    }
  }, [activeItem, lastResult]);

  return (
    <>
      <div className={css.titleArea}>
        <h1>{target?.name}</h1>
        <button className={css.moreButton} onClick={() => setIsModalOpen(true)}>
          <MoreHorizIcon fontSize="large" />
        </button>
      </div>
      {scan && 
        <div>
          <BarcodeScanner setLastResult={setLastResult} ref={scannerRef}/>
        </div>}
      <p>{t('items')}:</p>
      <ul className={css.list}>
        {(editMode ? editableItems : target.items)?.map((item, index) => {
          const product = activeItems.find(p => p?.article === item.article);
          return (
            <li key={index} className={css.item}>
              <img
                className={css.itemImage}
                alt={product?.name?.UA}
                src={product?.images[0]}
              />
              {editMode && item.article === '' ? (
                <input
                  id={`${index}Article`}
                  placeholder={t('article')}
                  className={css.itemArticle}
                />
              ) : (
                <p className={css.itemArticle}>{t('article')}: {item.article}</p>
              )}
              {editMode ? (
                <input
                  id={`${index}Count`}
                  defaultValue={item.count}
                  placeholder={t('count')}
                  className={`${css.itemCount} ${css.itemCountInput}`}
                />
              ) : (
                <p className={css.itemCount}>{item.count} {t('pcs')}.</p>
              )}
            </li>
          );
        })}
      </ul>
      {user.role === 'owner' && 
      <button className={css.downloadButton} onClick={downloadXlsx}>{t('download')} .xlsx</button>}
      {editMode && (
        <div className={css.editButtons}>
          <button className={css.addButton} onClick={handleAdd}>
            <AddCircleOutlineIcon fill="transparent" fontSize="large" />
          </button>
          <div className={css.saveBtnWrapper}>
            <button className={css.saveButton} onClick={handleSave}>
              {t('save')}
            </button>
            <button className={`${css.saveButton} ${css.scanButton}`} onClick={handleScan}>
              {t('scan')}
            </button>
          </div>
        </div>
      )}
      <PopUp
        isOpen={isModalOpen}
        close={closeModal}
        body={
          <div className={css.moreModal}>
            <button className={css.modalButton} onClick={startEdit}>
              {t('edit')}
            </button>
            <button
              className={`${css.modalButton} ${css.delButton}`}
              onClick={() => setIsDelModalOpen(true)}
            >
              {t('delete')}
            </button>
          </div>
        }
      />
      <PopUp
        isOpen={isDelModalOpen}
        close={closeModal}
        body={
          <>
            <p>{t('are you sure')}?</p>
            <div className={css.moreModal}>
              <button className={css.modalButton} onClick={closeModal}>
                {t('cancel')}
              </button>
              <button
                className={`${css.modalButton} ${css.delButton}`}
                onClick={handleDelete}
              >
                {t('delete')}
              </button>
            </div>
          </>
        }
      />
      <PopUp
            isOpen={isScanModalOpen}
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
                  <p>{`${activeItem.name?.UA || t('no name')} (${
                    activeItem.article
                  })`}</p>
                  <p>
                    {activeItem.price?.UAH
                      ? `${activeItem.price.UAH} грн.`
                      : 'Цена не указана'}
                  </p>
                  <div className={css.countArea}>
                    <input
                        placeholder={t('count')} 
                        onChange={e => setCount(e.target.value)}
                        defaultValue={count}
                        className={css.countInput}
                        type='number'
                    />
                    <button className={css.countAddBtn} onClick={addItemToList}>{t('add')}</button>
                  </div>
                </div>
              ) : activeItem === null ? (
                <div>
                  <p>{t('product not found')}</p>
                  <p>{t('barcode')}: {lastResult}</p>
                  <div className={`${css.countArea} ${css.notFoundArea}`}>
                    <input
                        placeholder={t('article')} 
                        onChange={e => setArticle(e.target.value)}
                        defaultValue={article}
                        className={css.countInput}
                    />
                    <input
                        placeholder={t('count')}
                        onChange={e => setCount(e.target.value)}
                        defaultValue={count}
                        className={css.countInput}
                        type='number'
                    />
                    <button className={css.countAddBtn} onClick={addItemToList}>{t('add')}</button>
                  </div>
                </div>
              ) : null
            }
          />
    </>
  );
};
