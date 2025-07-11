import css from './ForShipping.module.css';
import { ClockLoader } from 'react-spinners';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { fetchOrdersByFilter } from '../../../redux/orders/operations';
import { selectAllOrders, selectIsLoading } from '../../../redux/orders/selectors';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

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
    <ul>
      {resolvedProducts.map((sku, index) => (
        <li key={`${sku}-${index}`}>
          <p>{sku}</p>
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

  useEffect(() => {
    if (firstMounting) {
      dispatch(fetchOrdersByFilter(ordersFilter))
      setFirstMounting(false);
    }
  }, [dispatch, firstMounting])

  

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <p>Эта страница сейчас в разработке</p>
        {isLoading && <ClockLoader color="#c04545" />}
        {(allOrders?.length > 0) && 
        <ul>
          {allOrders.map((order, index) => (
            <li key={index}>
              <p>№{order.id}</p>
              <p>{t('products')}:</p>
              {order?.products && <ListOfProducts products={order.products}/>}
            </li>
          ))}
        </ul>
        }
      </div>
    </div>
  );
};
