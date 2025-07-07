import css from './InventoryCheckList.module.css';
import { ClockLoader } from 'react-spinners';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useEffect, useState, useRef } from 'react';
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner';
import { selectActiveProduct } from '../../redux/products/selectors';
import { selectAllInventoryChecks, selectLoading } from '../../redux/inventory/selectors';
import { clearActiveProduct } from '../../redux/products/slice';
import { addInventoryCheck, getAllInventoryChecks } from '../../redux/inventory/operations';
import { useDispatch, useSelector } from 'react-redux';
import { PopUp } from '../PopUp/PopUp';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export const InventoryCheckList = () => {
  const dispatch = useDispatch();
  const activeItem = useSelector(selectActiveProduct);
  const isLoading = useSelector(selectLoading);
  const allChecks = useSelector(selectAllInventoryChecks);
  const scannerRef = useRef();
  const [addMode, setAddMode] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const [count, setCount] = useState();
  const [addItemsList, setAddItemsList] = useState([]);
  const [article, setArticle] = useState()

  const changeMode = () => {
    addMode ? setAddMode(false) : setAddMode(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addItemToList = () => {
    setAddItemsList(prevState => [...prevState, {article: !article ? activeItem.article : article, count}])
    setIsModalOpen(false);
    setArticle();
    setCount();
    dispatch(clearActiveProduct());
    scannerRef.current?.startScan()
  }

  const listDate = () => {
    const now = new Date();
    const today = now.getDate() < 10 ? '0' + now.getDate() : now.getDate();
    const month = now.getMonth() < 9 ? '0' + (now.getMonth() + 1) : now.getMonth() + 1;
    const year = now.getFullYear();

    return (`${today}.${month}.${year}`)
  }

  const saveList = () => {
    const check = {name: listDate(), items: addItemsList}
    try {
       dispatch(addInventoryCheck(check));
       setAddMode(false);
       setAddItemsList([])
    } catch(err) {
        toast.error(err)
    }
  }

  const calculatePcs = (arr) => {
    let i = 0
    for (const item of arr) {
        i += Number(item.count)
    }
    return i;
  }

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
        dispatch(getAllInventoryChecks())
    }
  }, [addMode, dispatch])

  return (
    <>
      {!addMode && (
        <>
          <button className={css.addButton} onClick={changeMode}>
            <AddCircleOutlineIcon fill="transparent" fontSize="large" />
          </button>
          <div className={css.listWrapper}>
            {isLoading && <ClockLoader color="#c04545" />}
            {(!isLoading && allChecks) && (
                <ul className={css.list}>
                    {allChecks.map((check, index) => (
                        <li key={index} className={css.listItem}>
                          <Link className={css.link} to={`/inventory-check/${check._id}`}>
                            <p>{check.name}</p>
                            <p className={css.count}>{calculatePcs(check.items)}шт.</p>
                          </Link>
                        </li>
                    ))}
                </ul>
            )}
          </div>
        </>
      )}
      {addMode && (
        <>
          <button
            className={`${css.addButton} ${css.closeButton}`}
            onClick={changeMode}
          >
            <HighlightOffIcon fill="transparent" fontSize="large" />
          </button>
          <div>
            <BarcodeScanner setLastResult={setLastResult} ref={scannerRef}/>
          </div>
          {(activeItem && activeItem.article) && (<button className={css.button} onClick={() => setIsModalOpen(true)}>Last Scan</button>)}
          {addItemsList?.length > 0 && (
            <div className={css.addListArea}>
                <p>{listDate()}</p>
                <ul className={css.list}>
                    {addItemsList.map((item, index) => (
                        <li key={index} className={css.listItem}>
                            <p>Артикул: {item.article}</p>
                            <p className={css.count}>Кол-во: {item.count}шт.</p>
                        </li>
                    ))}
                </ul>
                <button className={css.button} onClick={saveList}>Apply</button>
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
                  <p>{`${activeItem.name?.UA || 'Без названия'} (${
                    activeItem.article
                  })`}</p>
                  <p>
                    {activeItem.price?.UAH
                      ? `${activeItem.price.UAH} грн.`
                      : 'Цена не указана'}
                  </p>
                  <div className={css.countArea}>
                    <input
                        placeholder='Сколько штук?' 
                        onChange={e => setCount(e.target.value)}
                        defaultValue={count}
                        className={css.countInput}
                    />
                    <button className={css.countAddBtn} onClick={addItemToList}>Add</button>
                  </div>
                </div>
              ) : activeItem === null ? (
                <div>
                  <p>Товар не найден!</p>
                  <p>Штрихкод: {lastResult}</p>
                  <div className={css.countArea}>
                    <input
                        placeholder='Артикул' 
                        onChange={e => setArticle(e.target.value)}
                        defaultValue={article}
                        className={css.countInput}
                    />
                    <input
                        placeholder='Сколько штук?' 
                        onChange={e => setCount(e.target.value)}
                        defaultValue={count}
                        className={css.countInput}
                    />
                    <button className={css.countAddBtn} onClick={addItemToList}>Add</button>
                  </div>
                </div>
              ) : null
            }
          />
        </>
      )}
    </>
  );
};
