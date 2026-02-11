import { useTranslation } from 'react-i18next';
import css from './MoteaOrderTemplate.module.css';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { ClockLoader } from 'react-spinners';
import toast from 'react-hot-toast';

export const MoteaOrderTemplate = () => {
  const { t } = useTranslation();
  const [ordersArray, setOrdersArray] = useState([]);
  const [ordersToOrderArray, setOrdersToOrderArray] = useState({ toOrder: [], cancel: []});
  const [firstMount, setFirstMount] = useState(true);
  const [awaitOrders, setAwaitOrders] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setAwaitOrders(true)
      const res = await axios.get('/orders/orders-from-template');
      setOrdersArray(res.data);
      setAwaitOrders(false)
    }
    if (firstMount) {
      fetchOrders();
      setFirstMount(false);
    }
    if (ordersArray.length > 0) {
      const fullArr = [];
      const cancelArr = [];
      const arr = [];

      for (const row of ordersArray) {
        const num = row.numbers.split(', ')
        for (const order of num) {
          const target = fullArr.find((i) => i.number === order)
          if (!target) {
            fullArr.push({number: order, items: [row.bestand]})
          } else {
            target.items.push(row.bestand)
          }
        }
      }

      for (const order of fullArr) {
        if (!order.items.includes("NEIN") && !order.items.includes("")) {
          arr.push(order.number)
        } else if (order.items.includes("NEIN")) {
          cancelArr.push(order.number)
        }
      }
      setOrdersToOrderArray({ toOrder: arr, cancel: cancelArr });
    }
  }, [ordersArray, firstMount])

  async function setBestand(value, row) {
    setOrdersArray((prev) => prev.map(r => r.row === row ? { ...r, pending: true } : r));
    const res = await axios.post('/orders/update-row-from-template', {value, row});
    setOrdersArray((prev) => prev.map(r => r.row === row ? { ...r, bestand: res.data, pending: false } : r));
  }

  async function changeStatusHandler(bool) {
    const changeStatuses = async () => {
      let body = { orders: ordersToOrderArray.toOrder, cancel: bool }
      if (bool) {
        body.orders = ordersToOrderArray.cancel;
      }
      const res = await axios.post('/orders/from-table', body);

      if (!res.status === 200) throw new Error('Fail');

      return;
    };

    toast.promise(
      changeStatuses(),
      {
        loading: t('sending orders'),
        success: <b>{t('statuses changed')}</b>,
        error: <b>{t('statuses not changed, try again for a minute')}</b>,
      }
    );
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(String(text));
    toast.success(t('sku copied'));
  };

  async function recalcOrders() {
    const calculateStatuses = async () => {
      const res = await axios.get('/orders/recalc-orders-to-motea');

      if (!res.status === 200) throw new Error('Fail');

      setFirstMount(true)
      return;
    };

    toast.promise(
      calculateStatuses(),
      {
        loading: t('recalc orders'),
        success: <b>{t('orders recalculated')}</b>,
        error: <b>{t('error, try again for a minute')}</b>,
      }
    );
  }

  return (
    <div className={css.container}>
        <h1>{t('order template')}</h1>
        <table className={css.table}>
            <thead>
                <tr>
                    <th scope="col" className={css.cell}>Numbers</th>
                    <th scope="col" className={css.cell}>SKU</th>
                    <th scope="col" className={css.cell}>Amount</th>
                    <th scope="col" className={css.cell}>Bestand</th>
                    <th scope="col" className={css.cell}>Name</th>
                </tr>
            </thead>
            <tbody>
                {awaitOrders ? 
                <tr key={'loader'}>
                  <td className={css.cell} colSpan={5}>
                    <div className={css.loaderCell}>
                      <ClockLoader color="#c04545" />
                    </div>
                  </td>
                </tr> :
                (ordersArray.map((row) => (
                    <tr key={`${row.sku}-${row.numbers}`}>
                        <th scope="row" className={css.cell}>{row.numbers}</th>
                        <td className={`${css.cell} ${css.skuSell}`} onClick={() => copyToClipboard(row.sku)}>{row.sku}</td>
                        <td className={css.cell}>{row.amount}</td>
                        <td className={css.cell}>
                          {row.pending ? <div className={css.loaderCell}><ClockLoader color="#c04545" /></div> : <button className={css.bestandBtn} onClick={() => setBestand(row.bestand, row.row)} style={row.bestand === '' ? {color: '#353535', background: '#9e9e9e'} : row.bestand === 'JA' ? {background: '#3f8e3a'} : {background: '#c04545'}}>{row.bestand === '' ? 'SET' : row.bestand}</button>}
                        </td>
                        <td className={css.cell}>{row.name}</td>
                    </tr>
                )))}
            </tbody>
        </table>
        <div className={css.buttonsArea}>
          <button onClick={() => setFirstMount(true)} className={`${css.btn} ${css.greenBtn}`}>{t('reload')}</button>
          <button onClick={() => recalcOrders()} className={css.btn}>{t('recalc')}</button>
          <button onClick={() => changeStatusHandler(false)} className={`${css.btn} ${css.greenBtn}`}>{t('change status')}</button>
          <button onClick={() => changeStatusHandler(true)} className={css.btn}>{t('cancel status')}</button>
        </div>
        <div>
          <b>Примечание:</b>
          <p>
            {t('reload')}* - простая синхронизация таблиц (если что-то заглючило или пошло не так)<br/>
            {t('recalc')}* - полный пересчёт списка артикулов из заказов в SalesDrive (около 1 минуты)<br/>
            {t('change status')}* - изменить статусы заказов на "Замовлено" (для тех артикулов, у кого JA)<br/>
            {t('cancel status')}* - изменить статусы заказов на "Замовити" (для тех артикулов, у кого NEIN) если оказалось, что товара нет в наличии<br/>
          </p>
        </div>
    </div>
  );
};