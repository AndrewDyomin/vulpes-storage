import css from './ProductsList.module.css';
// import { Link } from 'react-router-dom';
import { selectAllProducts } from '../../redux/products/selectors';
import { selectUser } from '../../redux/auth/selectors';
import {
  fetchAllProducts,
  searchProduct,
} from '../../redux/products/operations';
import { useDispatch, useSelector } from 'react-redux';
import logo from 'images/logo 2.png';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ClockLoader } from 'react-spinners';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const ProductsList = () => {
  const productsArray = useSelector(selectAllProducts)?.products;
  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [prevSearchValue, setPrevSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      await sleep(3000);
      if (searchValue === '' && productsArray?.length < 20) {
        dispatch(fetchAllProducts());
      }

      if (searchValue !== '' && searchValue !== prevSearchValue) {
        dispatch(searchProduct(searchValue));
        setPrevSearchValue(searchValue);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [searchValue, dispatch, prevSearchValue, productsArray]);

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <div className={css.searchArea}>
          <input
            placeholder={`${t('search')}...`}
            defaultValue={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            className={css.searchInput}
          />
          {isLoading && (
            <ClockLoader
              color="#c04545"
              size="30px"
              cssOverride={{ marginLeft: 'auto' }}
            />
          )}
        </div>
        <ul className={css.productList}>
          {productsArray &&
            productsArray.map((product, index) => (
              <li
                key={`${product.article}-${index}`}
                className={css.productCard}
              >
                <div>
                  <img
                    className={css.productImg}
                    src={product.images?.[0] || logo}
                    onError={e => {
                      e.currentTarget.src = logo;
                    }}
                    alt={product.name?.UA || 'Изображение'}
                  />
                  <p>{`(${product?.article}) `}
                    {product.name.UA !== '' && product.name.UA !== null
                      ? product.name.UA
                      : product.name.DE}
                  </p>
                  {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
                    <div>
                      <p>{t('quantity in stock')}: {product.quantityInStock}</p>
                      <p>{t('availability in motea')}: {t(product.availabilityInMotea) || t('unknown')}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
