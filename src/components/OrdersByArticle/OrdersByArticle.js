import axios from 'axios';
import css from './OrdersByArticle.module.css';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { selectActiveProduct } from '../../redux/products/selectors';
import { ClipLoader } from 'react-spinners';

export const OrdersByArticle = ({ item }) => {
  const { t } = useTranslation();
  const activeItem = useSelector(selectActiveProduct);

  const [ordersWithArticle, setOrdersWithArticle] = useState(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const fetchOrders = async article => {
      setIsPending(true);
      const targetOrders = await axios.post('/orders/by-article', {
        article,
      });
      setOrdersWithArticle(targetOrders.data.result);
      setIsPending(false);
    };
    if (activeItem?.article) {
      fetchOrders(activeItem.article);
    } else if (item?.article) {
      fetchOrders(item.article);
    }
  }, [activeItem, item]);

  const articlesToList = list => {
    return (
      <ul>
        {list.map(art => (
          <li key={art.article} className={css.orderItem}>
            <p
              className={
                art.article === activeItem.article
                  ? `${css.target} ${css.parent}`
                  : css.parent
              }
            >
              {art.article}
            </p>
            {art.set.length > 0 && (
              <span>
                {'('}
                {art.set.map((sku, index) => (
                  <span
                    key={sku}
                    className={
                      sku === activeItem.article ? css.target : css.skuCild
                    }
                  >
                    {sku}
                    {index < art.set.length - 1 && ', '}
                  </span>
                ))}
                {')'}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {isPending ? (
        <div className={css.loader}>
          <ClipLoader color="#c04545" size="30px"/>
        </div>
      ) : (
        <>
          <p>{t('in orders')}:</p>
          {ordersWithArticle && ordersWithArticle.length > 0 ? (
            <ul>
              {ordersWithArticle.map(order => (
                <li key={order.number}>
                  <div className={css.orderTitle}>
                    <p>№: {order.number}</p>
                    <p css={css.orderStatus}>'{order.status}'</p>
                  </div>
                  {articlesToList(order.articles)}
                </li>
              ))}
            </ul>
          ) : (
            <p>{t('not found')}</p>
          )}
        </>
      )}
    </>
  );
};
