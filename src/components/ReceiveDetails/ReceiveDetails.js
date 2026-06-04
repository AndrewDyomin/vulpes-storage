import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { selectAllInvoices, selectAllReceives } from '../../redux/receives/selectors';
import { selectActiveProduct } from '../../redux/products/selectors';
import { clearActiveProduct } from '../../redux/products/slice';
import { getAllInvoices, getAllReceives } from '../../redux/receives/operations';
import { selectUser } from '../../redux/auth/selectors';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PopUp } from '../PopUp/PopUp';
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner';
import css from './ReceiveDetails.module.css';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { updateInvoices } from '../../redux/receives/slice';

export const ReceiveDetails = ({ id }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allReceives = useSelector(selectAllReceives);
  const allInvoices = useSelector(selectAllInvoices);
  const activeItem = useSelector(selectActiveProduct);
  const scannerRef = useRef();
  const target = allReceives.find(check => check._id === id);
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
  const [invoiceSelectList, setInvoiceSelectList] = useState([]);
  const [inView, setInView] = useState([]);
  const [shouldSave, setShouldSave] = useState(false);
  const [notEnough, setNotEnough] = useState([]);
  const [extra, setExtra] = useState([]);

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
      await axios.post('/receive-products/delete', { id });
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
      invoices: target?.invoices || [],
    };

    if (editableItems?.length > 0) {
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
    } else {
      result.items = target.items;
    }
    

    try {
      await axios.post('/receive-products/update', result);
      toast.success('Документ обновлён');
      window.history.back();
      dispatch(getAllReceives())
      setShouldSave(false);
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
        '/receive-products/download',
        { id },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receive-${id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Ошибка при скачивании:', error.message);
      toast.error(`Ошибка при скачивании: ${error.message}`);
    }
  };

  const resultReport = async () => {
    try {
      const response = await axios.post(
        '/receive-products/report',
        { invoices: target?.invoices, notEnough, extra, receive: target?.name }
      );
      toast.success(response.data.message)
    } catch(err) {
      toast.error(err.message)
    }
  }

  const addInvoice = async (i) => {
    dispatch(updateInvoices({ ...target, invoices: [ ...target.invoices, i ] }));
    setShouldSave(true);
  }

  const removeInvoice = async (i) => {
    dispatch(updateInvoices({ ...target, invoices: [ ...target.invoices.filter(n => n !== i ) ] }));
    setShouldSave(true);
  }

  const CheckProductCount = ({ item }) => {
    if (inView?.length > 0) {
      const result = [];
      let total = 0;
      for (const i of target.items) {
        if (i.article === item.article) {
          total += i.count;
        }
      }

      for(const invoice of inView) {
        const targetArr = invoice.items.filter(i => String(i.article) === String(item.article));
        if (!targetArr?.length) continue;
        let t = 0;
        for (const p of targetArr) {
          if (p?.count > 0) {
            t += Number(p.count);
          }
        }
        total -= t;
        const isEnough = total >= 0 ? true : false;
        result.push({ name: invoice.name, count: t, enough: isEnough})
      }

      return (
        <>
          {result.length > 0 ? result.map((invoice, index) =>  (
            <p key={index} className={invoice.enough ? css.invoiceGreen : css.invoiceRed}>{invoice.name} - {invoice.count}{t('pcs')}</p>
          )) : 
          <>
            {t('not found')}
          </>
          }
        </>
      )
    }
  }

  // --- fetch all products and invoices
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

    dispatch(getAllInvoices());
    fetchAllProducts();
  }, [target, dispatch]);

  // --- show last scan
  useEffect(() => {
    if (lastResult === '') return;

    if (activeItem && activeItem.article) {
      setIsScanModalOpen(true);
    }
    if (activeItem === null) {
      setIsScanModalOpen(true);
    }
  }, [activeItem, lastResult]);

  // calc invoice item sets and add invoices to select
  useEffect(()=> {
    if (allInvoices && allInvoices?.length && invoiceSelectList?.length === 0) {
      const freeInv = allInvoices.filter(i => !i.verified);
      setInvoiceSelectList([ ...freeInv.map(i => ({ value: i.name, label: i.name })) ])
    } 

    if (allInvoices?.length && target?.invoices?.length) {
      const targetInvoices = allInvoices.filter(i => target.invoices.includes(i.name));
      const result = [];
      const totalProducts = [];
      const totalItems = [];
      const extraItems = [];
      const notEnoughProducts = [];

      for(const invoice of targetInvoices) {
        const updated = { ...invoice, items: [] };
        for (const item of invoice.items) {
          if (item?.set?.length > 0) {
            for (const set of item.set) {
              updated.items.push({ article: String(set.article), count: Number(set.count) * Number(item.count) })
              const target = totalProducts.find(i => i.article === set.article);
              if (!target) {
                totalProducts.push({ article: String(set.article), count: Number(set.count) * Number(item.count) })
              } else {
                target.count += Number(set.count) * Number(item.count)
              }
            }
          } else {
            updated.items.push(item)
            const target = totalProducts.find(i => i.article === item.article);
            if (!target) {
              totalProducts.push({ article: String(item.article), count: Number(item.count) })
            } else {
              target.count += Number(item.count)
            }
          }
        }
        result.push(updated);
      }

      for (const item of target.items) {
        const target = totalItems.find(i => i.article === item.article);
        if (!target) {
          totalItems.push({ article: String(item.article), count: Number(item.count) })
        } else {
          target.count += Number(item.count)
        }
      }

      for(const product of totalProducts) {
        const item = { ...target.items.find(i => String(i.article) === product.article) };
        if (item) {
          item.count = target.items.reduce(
            (sum, i) => i.article === product.article
              ? sum + Number(i.count)
              : sum,
            0
          );
          if (Number(item.count) < product.count) {
            const diff = Number(product.count) - Number(item.count);
            notEnoughProducts.push({ article: product.article, count: diff });
          }
        } else {
          notEnoughProducts.push(product);
        }
      }

      for (const item of totalItems) {
        const product = totalProducts.find(i => i.article === item.article);
        if (!product || item.count > product?.count) {
          const diff = Number(item.count) - Number(product?.count) || Number(item.count);
          extraItems.push({ article: item.article, count: diff });
        }
      }

      setExtra(extraItems)
      setNotEnough(notEnoughProducts);
      setInView(result);
    }

  }, [allInvoices, invoiceSelectList, target])

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
              <div className={css.checkWrapper}>
                <CheckProductCount item={item}/>
              </div>
            </li>
          );
        })}
      </ul>
      {/* -------------------- CHECK RESULT -------------------- */}
      {(notEnough?.length > 0 || extra?.length > 0) && <h3 className={css.resultTitle}>{t('result')}</h3>}
      <div className={css.resultWrapper}>
        {notEnough?.length > 0 && 
          <div className={css.resultColumn}>
            <p>{t('not enough')}</p>
            <ul>
              {notEnough.map((i, index) => (
                <li key={i.article+index}  className={css.resultItem}>
                  <p>{i.article}</p>
                  <p>{i.count}{t('pcs')}.</p>
                </li>
              ))}
            </ul>
          </div>
        }
        {extra?.length > 0 && 
          <div className={css.resultColumn}>
            <p>{t('extra products')}</p>
            <ul>
              {extra.map((i, index) => (
                <li key={i.article+index}  className={css.resultItem}>
                  <p>{i.article}</p>
                  <p>{i.count}{t('pcs')}.</p>
                </li>
              ))}
            </ul>
          </div>
        }
      </div>
      {!editMode && user.role === 'owner' && 
      <div className={css.finalButtons}>
        <button className={css.downloadButton} onClick={downloadXlsx}>{t('download')} .xlsx</button>
        {inView.length > 0 && <button className={css.reportButton} onClick={resultReport}>{t('report')}</button>}
      </div>
      }
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
          <>
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
            {target?.invoices?.length > 0 &&
              <>
                <p className={css.invList}>{t('invoices')}:</p>
                <ul>
                  {target.invoices.map((i, index) => (
                    <li key={i+index}>
                      <span>{i}</span>
                      <button className={css.miniRemoveBtn} onClick={()=>removeInvoice(i)}>
                        <HighlightOffIcon fill="transparent" fontSize="small"/>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            }
            {shouldSave && <SaveAsOutlinedIcon className={css.miniSaveBtn} onClick={handleSave}/>}
            {invoiceSelectList?.length > 0 && 
              <div className={css.invSelect}>
                <Select 
                  name='invoiceSelect' 
                  onChange={(e) => (addInvoice(e.value))}
                  placeholder={t('select invoice')}
                  options={invoiceSelectList}
                />
              </div>
            }
          </>
          
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
