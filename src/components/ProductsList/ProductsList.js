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
import { useEffect, useRef, useState } from 'react';
import { ClockLoader } from 'react-spinners';

export const ProductsList = () => {
  const productsArray = useSelector(selectAllProducts)?.products;
  const user = useSelector(selectUser);
  const searchAreaRef = useRef(null);
  const pagination = useSelector(state => state.products.items.pagination);
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [prevSearchValue, setPrevSearchValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      if (searchValue === '' && productsArray?.length < 20) {
        dispatch(fetchAllProducts({page: 1, limit: 20}));
      }

      if (searchValue !== '' && searchValue !== prevSearchValue) {
        dispatch(searchProduct({value: searchValue, page: 1, limit: 20}));
        setPrevSearchValue(searchValue);
      }
      setIsLoading(false);
    };

    fetchProducts();
  }, [searchValue, dispatch, prevSearchValue, productsArray]);

  const changePage = async(query) => {
    if (searchAreaRef.current) {
      searchAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (searchValue === '') {
      dispatch(fetchAllProducts(query));
    } else {
      dispatch(searchProduct({ value: searchValue, ...query }));
    }
  }

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <div className={css.searchArea} ref={searchAreaRef}>
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
              >
                <div className={css.productCard}>
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
        {(currentPage && currentPage > 1) ? 
        (<div className={css.pagination}>
          <button className={css.prevButton} onClick={() => changePage({page: currentPage - 1})}>{currentPage - 1}</button>
          <button className={css.currentPage}>{currentPage}</button>
          {currentPage < totalPages && 
            <button className={css.nextButton} onClick={() => changePage({page: currentPage + 1})}>{currentPage + 1}</button>}
        </div>) : 
        (<div className={css.pagination}>
          <button className={css.currentPage}>{currentPage}</button>
          {currentPage < totalPages && 
            <button className={css.nextButton} onClick={() => changePage({page: currentPage + 1})}>{currentPage + 1}</button>}
        </div>)}
      </div>
    </div>
  );
};
