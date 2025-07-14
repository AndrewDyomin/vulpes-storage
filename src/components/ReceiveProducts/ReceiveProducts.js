import css from './ReceiveProducts.module.css';
import { ClockLoader } from 'react-spinners';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useEffect, useState, useRef } from 'react';
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner';
import BarcodeScannerHtml5 from '../BarcodeScanner Html5/BarcodeScannerHtml5';
import { selectActiveProduct } from '../../redux/products/selectors';
import {
  selectAllReceives,
  selectLoading,
} from '../../redux/receives/selectors';
import { clearActiveProduct } from '../../redux/products/slice';
import { selectUser } from '../../redux/auth/selectors';
import { addReceive, getAllReceives } from '../../redux/receives/operations';
import { useDispatch, useSelector } from 'react-redux';
import { PopUp } from '../PopUp/PopUp';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getProductByBarcode } from '../../redux/products/operations';

export const ReceiveProducts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeItem = useSelector(selectActiveProduct);
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectLoading);
  const allReceives = useSelector(selectAllReceives);
  const scannerRef = useRef();
  const [addMode, setAddMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const [count, setCount] = useState();
  const [addItemsList, setAddItemsList] = useState([]);
  const [article, setArticle] = useState();
  const [addArticleModal, setAddArticleModal] = useState();
  const [selectedScanner, setSelectedScanner] = useState('1');

  const changeMode = mode => {
    if (mode === 'add') {
      addMode ? setAddMode(false) : setAddMode(true);
    }
    if (mode === 'select') {
      selectMode ? setSelectMode(false) : setSelectMode(true);
      setSelected([]);
    }
  };

  const changeScanner = () => {
    selectedScanner === '1' ? setSelectedScanner('2') : setSelectedScanner('1');
  };

  const selectItem = index => {
    if (selected.includes(allReceives[index]._id)) {
      setSelected(prev => [
        ...prev.filter(id => id !== allReceives[index]._id),
      ]);
    }
    if (!selected.includes(allReceives[index]._id)) {
      setSelected(prev => [...prev, allReceives[index]._id]);
    }
  };

  const combine = async () => {
    await axios.post('/inventory-check/combine', { array: selected });
    changeMode('select');
    dispatch(getAllReceives());
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAddArticleModal(false);
  };

  const addItemToList = () => {
    setAddItemsList(prevState => [
      ...prevState,
      { article: !article ? activeItem.article : article, count },
    ]);
    closeModal();
    setArticle();
    setCount();
    dispatch(clearActiveProduct());
    scannerRef.current?.startScan();
  };

  const listDate = () => {
    const now = new Date();
    const today = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    const month =
      now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    const year = now.getFullYear();
    const baseName = `${today}.${month}.${year}`;

    let suffix = 0;
    let finalName = baseName;

    const existingNames = allReceives.map(check => check.name);

    while (existingNames.includes(finalName)) {
      suffix += 1;
      finalName = `${baseName} (${suffix})`;
    }

    return finalName;
  };

  const saveList = () => {
    const check = { name: listDate(), items: addItemsList };
    try {
      dispatch(addReceive(check));
      setAddMode(false);
      setAddItemsList([]);
    } catch (err) {
      toast.error(err);
    }
  };

  const calculatePcs = arr => {
    let i = 0;
    for (const item of arr) {
      i += Number(item.count);
    }
    return i;
  };

  const onNewScanResult = (decodedText, decodedResult) => {
    if (decodedText[0] !== 'H') {
      setLastResult(decodedText);
      dispatch(getProductByBarcode(decodedText));
    }
  };

  useEffect(() => {
    if (lastResult === '') return;

    if (activeItem && activeItem.article) {
      setIsModalOpen(true);
    }
    if (activeItem === null) {
      setIsModalOpen(true);
    }
  }, [activeItem, lastResult]);

  useEffect(() => {
    if (!addMode) {
      dispatch(getAllReceives());
    }
  }, [addMode, dispatch]);

  return (
    <>
      {!addMode && (
        <>
          <div className={css.modeButtons}>
            <button className={css.addButton} onClick={() => changeMode('add')}>
              <AddCircleOutlineIcon fill="transparent" fontSize="large" />
            </button>
            {user.role === 'owner' && (
              <button
                className={`${css.addButton} ${css.selectButton} ${
                  selectMode && css.activeSelect
                }`}
                onClick={() => changeMode('select')}
              >
                <CheckCircleOutlineIcon fill="transparent" fontSize="large" />
              </button>
            )}
          </div>
          <div>
            {isLoading && (
              <div className={css.listWrapper}>
                <ClockLoader color="#c04545" />
              </div>
            )}
            {!isLoading && allReceives && (
              <div className={css.listWrapper}>
                <ul className={css.list}>
                  {allReceives.map((receive, index) => (
                    <li
                      key={index}
                      className={`${css.listItem} ${
                        selected.includes(receive._id) && css.selectedItem
                      }`}
                    >
                      {!selectMode ? (
                        <Link
                          className={css.link}
                          to={`/get-products-in/${receive._id}`}
                        >
                          <p>{receive.name}</p>
                          <p className={css.count}>
                            {calculatePcs(receive.items)}
                            {t('pcs')}.
                          </p>
                        </Link>
                      ) : (
                        <div
                          className={css.link}
                          onClick={() => selectItem(index)}
                        >
                          <p>{receive.name}</p>
                          <p className={css.count}>
                            {calculatePcs(receive.items)}
                            {t('pcs')}.
                          </p>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {user.role === 'owner' &&
                  selectMode &&
                  selected?.length > 1 && (
                    <div>
                      <button
                        onClick={combine}
                        className={`${css.button} ${css.combineButton}`}
                      >
                        {t('combine')}
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>
        </>
      )}
      {addMode && (
        <>
          <div className={css.modeButtons}>
            <button
              className={`${css.addButton} ${css.closeButton}`}
              onClick={() => changeMode('add')}
            >
              <HighlightOffIcon fill="transparent" fontSize="large" />
            </button>
            <button onClick={changeScanner} className={css.selectButton}>
              {selectedScanner}
            </button>
          </div>
          <div className={css.controlArea}>
            {selectedScanner === '1' && (
              <BarcodeScanner setLastResult={setLastResult} ref={scannerRef} />
            )}
            {selectedScanner === '2' && (
              <BarcodeScannerHtml5
                fps={10}
                qrbox={250}
                disableFlip={false}
                qrCodeSuccessCallback={onNewScanResult}
              />
            )}
            <button
              className={`${css.addButton} ${css.addArtBtn}`}
              onClick={() => setAddArticleModal(true)}
            >
              <AddCircleOutlineIcon fill="transparent" fontSize="large" />
            </button>
          </div>
          {activeItem && activeItem.article && (
            <button className={css.button} onClick={() => setIsModalOpen(true)}>
              {t('last scan')}
            </button>
          )}
          {addItemsList?.length > 0 && (
            <div className={css.addListArea}>
              <p>{listDate()}</p>
              <ul className={css.list}>
                {addItemsList.map((item, index) => (
                  <li key={index} className={css.listItem}>
                    <p>
                      {t('article')}: {item.article}
                    </p>
                    <p className={css.count}>
                      {t('count')}: {item.count}
                      {t('pcs')}.
                    </p>
                  </li>
                ))}
              </ul>
              <button className={css.button} onClick={saveList}>
                {t('save')}
              </button>
            </div>
          )}
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
                    />
                    <button className={css.countAddBtn} onClick={addItemToList}>
                      {t('add')}
                    </button>
                  </div>
                </div>
              ) : activeItem === null ? (
                <div>
                  <p>{t('product not found')}!</p>
                  <p>
                    {'barcode'}: {lastResult}
                  </p>
                  <div className={css.countArea}>
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
                    />
                    <button className={css.countAddBtn} onClick={addItemToList}>
                      {t('add')}
                    </button>
                  </div>
                </div>
              ) : null
            }
          />
          <PopUp
            isOpen={addArticleModal}
            close={closeModal}
            body={
              <div className={`${css.countArea} ${css.notFoundArea}`}>
                <input
                  placeholder={t('article')}
                  onChange={e => setArticle(e.target.value)}
                  className={css.countInput}
                />
                <input
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
        </>
      )}
    </>
  );
};
