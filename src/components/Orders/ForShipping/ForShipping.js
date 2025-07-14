import css from './ForShipping.module.css';
import { ClockLoader } from 'react-spinners';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchOrdersByFilter } from '../../../redux/orders/operations';
import { selectAllOrders, selectIsLoading } from '../../../redux/orders/selectors';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { PopUp } from '../../PopUp/PopUp';

export const ListOfProducts = ({ products }) => {
  const [resolvedProducts, setResolvedProducts] = useState([]);

  useEffect(() => {
    const fetchSetItems = async () => {
      const result = [];

      for (const product of products) {
        try {
          const { sku } = product;
          const res = await axios.post('/products/byarticle', { article: sku });
          const dbProduct = res.data.product;

          if (dbProduct?.isSet?.length > 0) {
            for (const setItem of dbProduct.isSet) {
              result.push(setItem ?? sku); 
            }
          } else {
            result.push(sku);
          }
        } catch (err) {
          console.error('Ошибка при получении продукта:', err.message);
          result.push(product.sku);
        }
      }

      setResolvedProducts(result);
    };

    fetchSetItems();
  }, [products]);

  return (
    <ul className={css.productsList}>
      {resolvedProducts.map((sku, index) => (
        <li key={`${sku}-${index}`}>
          <p>{sku};</p>
        </li>
      ))}
    </ul>
  );
};

export const ForShipping = () => {
  const ordersFilter = 'for-shipping';
  const isLoading = useSelector(selectIsLoading);
  const allOrders = useSelector(selectAllOrders);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [firstMounting, setFirstMounting] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderModal, setOrderModal] = useState(false)

  useEffect(() => {
    if (firstMounting) {
      dispatch(fetchOrdersByFilter(ordersFilter))
      setFirstMounting(false);
    }
  }, [dispatch, firstMounting])

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
        <p>Эта страница сейчас в разработке</p>
        {isLoading && <ClockLoader color="#c04545" />}
        {(allOrders?.length > 0) && 
        <ul className={css.ordersList}>
          {allOrders.map((order, index) => (
            <li key={index} className={css.ordersListItem} onClick={() => openOrder(order)}>
              <p className={css.orderNumber}>№{order.id}</p>
              <p>TTH: {order.ord_delivery_data[0].trackingNumber}</p>
              <div>
                <p>{t('items')}:</p>
                {order?.products && <ListOfProducts products={order.products}/>}
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
          <p>{activeOrder?.ord_delivery_data[0]?.payForDelivery === "Recipient" ? "*Доставку оплачивает получатель." : "*Доставку оплачивает отправитель."}</p>
        </div>}
      />
    </div>
  );
};
