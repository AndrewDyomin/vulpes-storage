import css from './ReceiveProducts.module.css';
import { ClockLoader } from 'react-spinners';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DescriptionIcon from '@mui/icons-material/Description';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useEffect, useState, useRef } from 'react';
import { BarcodeScanner } from '../BarcodeScanner/BarcodeScanner';
import { selectActiveProduct } from '../../redux/products/selectors';
import {
  selectAllInvoices,
  selectAllReceives,
  selectLoading,
} from '../../redux/receives/selectors';
import { clearActiveProduct } from '../../redux/products/slice';
import { selectUser } from '../../redux/auth/selectors';
import { addReceive, getAllReceives, getAllInvoices } from '../../redux/receives/operations';
import { setDraft } from '../../redux/receives/slice';
import { useDispatch, useSelector } from 'react-redux';
import { PopUp } from '../PopUp/PopUp';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { OrdersByArticle } from '../OrdersByArticle/OrdersByArticle';

export const ReceiveProducts = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const activeItem = useSelector(selectActiveProduct);
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectLoading);
  const allReceives = useSelector(selectAllReceives);
  const allInvoices = useSelector(selectAllInvoices);
  const draft = useSelector(state => state.receive.draft);
  const scannerRef = useRef();
  const [addMode, setAddMode] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [invoiceMode, setInvoiceMode] = useState(false);
  const [selected, setSelected] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastResult, setLastResult] = useState('');
  const [count, setCount] = useState();
  const [addItemsList, setAddItemsList] = useState([]);
  const [article, setArticle] = useState();
  const [addArticleModal, setAddArticleModal] = useState();
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [filePending, setFilePending] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [invoiceUpdateMode, setInvoiceUpdateMode] = useState(false);

  const changeMode = mode => {
    if (mode === 'add') {
      addMode ? setAddMode(false) : setAddMode(true);
    }
    if (mode === 'select') {
      selectMode ? setSelectMode(false) : setSelectMode(true);
      setSelected([]);
    }
    if (mode === 'invoice') {
      setInvoiceMode(!invoiceMode);
    }
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
    await axios.post('/receive-products/combine', { array: selected });
    changeMode('select');
    dispatch(getAllReceives());
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setAddArticleModal(false);
    setActiveInvoice(null);
    setInvoiceModal(false);
  };

  const addItemToList = () => {
    const newList = [
      ...addItemsList,
      { article: !article ? activeItem.article : article, count },
    ];
    setAddItemsList(newList);
    dispatch(setDraft({ name: listDate(), items: newList }));
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

  const saveList = async () => {
    const check = { name: listDate(), items: addItemsList };
    try {
      await dispatch(addReceive(check));
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

  const addPdf = async(file) => {
    if (file.type !== "application/pdf") {
      alert("Пожалуйста, выберите PDF-файл.");
      return;
    }
    setFilePending(true);
    const formData = new FormData();
    formData.append('invoice', file);
    const response = await axios.post('/files/invoiceParser/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    const fileUrl = URL.createObjectURL(file);
    setInvoice({ ...response.data.invoice, url: fileUrl });
    setFilePending(false);
  }

  const saveInvoice = async(inv) => {
    setFilePending(true);
    try {
      const isAllArticles = inv.items.some(i => i.article === '');
      const isAllPcs = inv.items.some(i => i.count === '' || i.count === '0');
      if (isAllArticles) {
        toast.error('У всех позиций должны быть артикулы');
        setFilePending(false);
        return;
      }
      if (isAllPcs) {
        toast.error('У всех позиций должно быть количество');
        setFilePending(false);
        return;
      }

      const res = await axios.post('/receive-products/add-invoice', inv);
      toast.success(t(res.data.message));
      setInvoice(null);
      dispatch(getAllInvoices());
    } catch(err) {
      toast.error(err.message)
    }
    
    setFilePending(false);
  }

  const removeInvoice = async() => {
    try {
      const res = await axios.post('/receive-products/del-invoice', { _id: activeInvoice._id });
      toast.success(t(res.data.message));
      closeModal();
      dispatch(getAllInvoices());
    } catch(err) {
      toast.error(err.message)
    }
  }

  const closeInvoice = async() => {
    
    try {
      const res = await axios.post('/receive-products/close-invoice', { _id: activeInvoice?._id });
      toast.success(t(res.data.message));
      closeModal();
      dispatch(getAllInvoices());
    } catch(err) {
      toast.error(err.message)
    }
  }

  const updateInvoice = async() => {
    // toast.error("Эта кнопка еще не работает.")
    setActiveInvoice(invoice);
    setInvoiceUpdateMode(true);
  }

  const handleItemChange = (index, field, value) => {
    setActiveInvoice(prev => {
      const items = [...prev.items];

      items[index] = {
        ...items[index],
        [field]: value.replace(',', '.'),
      };

      const total = items.reduce((sum, item) => {
        return (
          sum +
          Number(item.price || 0) *
          Number(item.count || 0)
        );
      }, 0);

      return {
        ...prev,
        items,
        total: Math.round(total * 100) / 100,
      };
    });
  };

  const addInvoiceItem = () => {
    setActiveInvoice(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          article: "",
          position: String(Number(prev.items[prev.items.length - 1]?.position || '0') + 1),
          count: "",
          price: "",
        },
      ],
      total: prev.total,
    }));
  };

  const handleItemDel = (index) => {setActiveInvoice(prev => {
    const items = [...prev.items];
    items.splice(index, 1);

    const total = items.reduce((sum, item) => {
      return (
        sum +
        Number(item.price || 0) *
        Number(item.count || 0)
      );
    }, 0);

    return {
      ...prev,
      items,
      total: Math.round(total * 100) / 100,
    };
  });}

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

  useEffect(() => {
    if (!draftLoaded && draft) {
      setAddMode(true);
      setAddItemsList(draft.items || []);
      setDraftLoaded(true);
    }
  }, [draft, draftLoaded]);

  useEffect(()=> {
    if (!allInvoices && invoiceMode) {
      dispatch(getAllInvoices());
    }
  }, [allInvoices, invoiceMode, dispatch])

  return (
    <>
      {!addMode && (
        <>
          <div className={css.modeButtons}>
            <button className={css.addButton} onClick={() => changeMode('add')}>
              <AddCircleOutlineIcon fill="transparent" fontSize="large" />
            </button>
            <button 
                className={`${css.addButton} ${css.selectButton} ${
                  invoiceMode && css.activeSelect
                }`}
                onClick={() => changeMode('invoice')}>
              <DescriptionIcon fill="transparent" fontSize="large" />
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
            {!isLoading && allReceives && !invoiceMode && (
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
            {!isLoading && allInvoices && invoiceMode && (
              <div>
                <h3>{t('Invoices')}:</h3>
                <ul>
                  {allInvoices.map(i => (
                    <li key={i._id} className={css.listItem}>
                      <div
                        className={css.link}
                        onClick={() => {setActiveInvoice(i); setInvoiceModal(true)}}
                      >
                        <p>{i.name}</p>
                        <p className={css.count}>
                          EUR {i.total}
                        </p>
                        {i?.verified && 
                        <span className={css.verified}>
                          <CheckCircleOutlineIcon fill="transparent" fontSize="medium" />
                        </span>}
                      </div>
                    </li>
                  ))}
                </ul>
                <PopUp
                  isOpen={invoiceModal}
                  close={closeModal}
                  body={
                    <div className={css.modalArea}>
                      <h3 className={css.invoiceTitle}>{activeInvoice?.name || t('no name')}</h3>
                      {activeInvoice?.verified && <span className={css.verified}>
                        <CheckCircleOutlineIcon fill="transparent" fontSize="medium" />
                      </span>}
                      {activeInvoice?.items?.length ?
                      <ul className={css.invoiceList}>
                        <li key={'000'} className={css.invoiceHeader}>
                          <p>Pos.</p>
                          <p>SKU</p>
                          <p>Qty</p>
                          <p>Price</p>
                          <p>Total</p>
                        </li>
                        {activeInvoice.items.map(i => (
                          <li key={i?.position + i?.article}>
                            <div className={css.invoiceItem}>
                              <p>{i?.position || ''}</p>
                              <p>{i?.article || ''}</p>
                              <p>{i?.count}</p>
                              <p>{i?.price}</p>
                              <p>{Math.round(Number(i?.price)*Number(i?.count)*100)/100}</p>
                            </div>
                            {i?.set?.length > 0 && 
                            <div>
                              <p className={css.consist}>consisting of</p>
                              <ul>
                                {i.set.map(s => (
                                  <li key={s?.article+s?.count} className={css.invoiceItem}>
                                    <p></p>
                                    <p>{s?.article}</p>
                                    <p>{s?.count}</p>
                                  </li>
                                ))}
                              </ul>
                            </div>}
                          </li>
                        ))}
                      </ul> : <p>{t('empty')}</p>}
                      <p className={css.invoiceTotal}>Total EUR: <strong>{activeInvoice?.total}</strong></p>
                      <div className={css.invoiceButtons}>
                        <button 
                          className={css.button}
                          onClick={()=> {removeInvoice()}}
                        >
                          {t('delete')}
                        </button>
                        {!activeInvoice?.verified && 
                        <button
                          className={`${css.button} ${css.saveButton}`}
                          onClick={()=> closeInvoice(activeInvoice?.name)}
                        >
                          {t('close invoice')}
                        </button>}
                      </div>
                    </div>
                  }
                />
              </div>
            )}
          </div>
        </>
      )}
      {addMode && !invoiceMode && (
        <>
          <div className={css.modeButtons}>
            <button
              className={`${css.addButton} ${css.closeButton}`}
              onClick={() => changeMode('add')}
            >
              <HighlightOffIcon fill="transparent" fontSize="large" />
            </button>
          </div>
          <div className={css.controlArea}>
              <BarcodeScanner setLastResult={setLastResult} ref={scannerRef} />
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
                  <div className={css.inOrders}>
                    <OrdersByArticle />
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
      {addMode && invoiceMode && (
        <>
          <div className={css.modeButtons}>
            <button
              className={`${css.addButton} ${css.closeButton}`}
              onClick={() => changeMode('add')}
            >
              <HighlightOffIcon fill="transparent" fontSize="large" />
            </button>
          </div>
          <div className={css.controlArea}>
            Add invoice
            <input onChange={e => addPdf(e.target.files[0])} className={css.addFile} type='file'/>
            {filePending && <ClockLoader color="#c04545" />}
            {invoice && !filePending &&
            <div>
              <iframe 
                title={invoice?.name}
                src={invoice.url}
                className={css.pdfView}
              />
              <div>
                <p>Сумма счёта: EUR {invoice.total}. Верно?</p>
                <div>
                  <button
                    onClick={() => saveInvoice(invoice)}
                    className={`${css.button} ${css.saveButton}`}
                  >всё верно. сохранить</button>
                  <button 
                    className={css.button}
                    onClick={()=> updateInvoice()}
                  >
                    Сумма не совпадает
                  </button>
                </div>
                {/* ------ Режим изменения инвойса ------ */}
                {invoiceUpdateMode &&
                  <div className={css.modalArea}>
                    <input 
                      className={css.invoiceTitle}
                      value={activeInvoice?.name || t('no name')}
                      onChange={(e)=>{setActiveInvoice(prev => ({...prev, name: e.target.value}))}}
                    />
                    {activeInvoice?.items?.length ?
                    <ul className={css.invoiceList}>
                      <li key={'000'} className={css.invoiceHeader}>
                        <p>Pos.</p>
                        <p>SKU</p>
                        <p>Qty</p>
                        <p>Price</p>
                        <p>Total</p>
                      </li>
                      {activeInvoice.items.map((i, index) => (
                        <li key={i?.position + i?.index}>
                          <div className={css.invoiceItem}>
                            <p>{i?.position || ''}</p>
                            <input 
                              value={i?.article || ''}
                              onChange={e => handleItemChange(index, 'article', e.target.value)}
                            />
                            <input 
                              value={i?.count || ''}
                              type='number'
                              onChange={e => handleItemChange(index, 'count', e.target.value)}
                            />
                            <input
                              value={i?.price || ''}
                              onChange={e => handleItemChange(index, 'price', e.target.value)}
                            />
                            <p>{Math.round(Number(i?.price)*Number(i?.count)*100)/100}</p>
                            <button
                              className={css.delItemBtn}
                              onClick={()=>handleItemDel(index)}
                            >
                              <HighlightOffIcon fill="transparent" fontSize="small" />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul> : <p>{t('empty')}</p>}
                    <button onClick={addInvoiceItem} className={css.addItemBtn}>
                      <AddCircleOutlineIcon fill="transparent" fontSize="medium" />
                    </button>
                    <p className={css.invoiceTotal}>Total EUR: <strong>{activeInvoice?.total}</strong></p>
                    <div>
                      <button 
                        className={`${css.button} ${css.saveButton}`}
                        onClick={async()=> {saveInvoice(activeInvoice)}}
                      >
                        {t('save')}
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>}
          </div>
        </>
      )}
    </>
  );
};
