import css from './AllOrders.module.css';
import { ClockLoader } from 'react-spinners';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchOrdersByFilter } from '../../../redux/orders/operations';
import { selectAllOrders, selectIsLoading } from '../../../redux/orders/selectors';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
// import axios from 'axios';
import { PopUp } from '../../PopUp/PopUp';

export const AllOrders = () => {
  const ordersFilter = 'in-work';
  const isLoading = useSelector(selectIsLoading);
  const allOrders = useSelector(selectAllOrders);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [firstMounting, setFirstMounting] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [filter, setFilter] = useState({value: 0, label: 'Все'});
  const [lastResponse, setLastResponse] = useState(0)
  const statusArray = [{value: 0, label: 'Все'}];
  const filteredOrders = filter.value === 0 ? allOrders : allOrders.filter(order => order.statusId === filter.value)

  useEffect(() => {
    if (firstMounting) {
      dispatch(fetchOrdersByFilter(ordersFilter))
      setFirstMounting(false);
    }
  }, [dispatch, firstMounting]);

  useEffect(() => {
    if (!firstMounting && filter.value === 0 && lastResponse !== 0) {
      dispatch(fetchOrdersByFilter(filter.value))
      setLastResponse(filter.value)
    }

    if (filteredOrders && filteredOrders?.length < 25 && !firstMounting && filter.value !== lastResponse) {
      dispatch(fetchOrdersByFilter(filter.value))
      setLastResponse(filter.value)
    }
  }, [filteredOrders, dispatch, filter, firstMounting, lastResponse])

  if (allOrders && allOrders?.length > 0) {
    for (const order of allOrders) {
      if (statusArray.some(obj => obj.value === order.statusId)) {
        continue;
      }
      statusArray[order.statusId] = ({value: order.statusId, label: order.statusLabel})
    }
  }

  const openOrder = (order) => {
    setActiveOrder(order)
    setOrderModal(true)
  }

  const closeModal = () => {
    setOrderModal(false);
    setActiveOrder(null)
  }

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <Select onChange={(e) => { setFilter(e)}} className={css.filter} options={statusArray} defaultValue={filter}/>
        {isLoading && <ClockLoader color="#c04545" />}
        {(allOrders?.length > 0) && 
        <ul className={css.ordersList}>
          {filteredOrders.map((order, index) => (
            <li key={index} className={css.ordersListItem} onClick={() => openOrder(order)}>
              <div className={css.orderTitle}>
                <p className={css.orderNumber}>№{order.id}</p>
                <p className={css.orderStatus}>"{order.statusLabel}"</p>
              </div>
              <div>
                <p>{t('items')}:</p>
                <ul className={css.productsList}>
                  {order?.products && order.products.map(product => (
                    <li key={product.productId}>
                      <p>{`(${product.sku}) ${product.text}`}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
        }
      </div>
      <PopUp
        isOpen={orderModal}
        close={closeModal}
        body={
        <div className={css.modalBody}>
          {activeOrder?.ord_delivery_data[0]?.trackingNumber && <img alt={activeOrder?.ord_delivery_data[0]?.trackingNumber} src={activeOrder?.ord_delivery_data[0]?.marking} style={{ width: '100%', height: '60px' }} />}
          <h3>№ {activeOrder?.id}</h3>
          <ul className={css.modalProductsList}>
            {activeOrder?.products && 
              activeOrder?.products.map(product => (
                <li key={product.sku}>
                  <p>{`${product.documentName} ${product.text}`}</p>
                </li>
              ))
            }
          </ul>
          <p>{t('delivery info')}:</p>
          <p>{activeOrder?.ord_delivery_data[0]?.provider}</p>
          <p>ТТН: {activeOrder?.ord_delivery_data[0]?.trackingNumber}</p>
          <p>{t('adress')}: {activeOrder?.ord_delivery_data[0]?.cityName}, {activeOrder?.ord_delivery_data[0]?.address}</p>
          <p>{t('phone')}: +{activeOrder?.contacts[0]?.phone[0]}</p>
          <p>{t('rest pay')}: {activeOrder?.restPay}грн.</p>
        </div>}
      />
    </div>
  );
};
