import css from './ProductsList.module.css';
import axios from 'axios';
import { selectAllProducts } from '../../redux/products/selectors';
import { selectUser } from '../../redux/auth/selectors';
import {
  fetchAllProducts,
  setActiveProduct,
  searchProduct,
} from '../../redux/products/operations';
import { useDispatch, useSelector } from 'react-redux';
import logo from 'images/logo 2.png';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { ClockLoader } from 'react-spinners';
import Select from 'react-select';
import { PopUp } from '../PopUp/PopUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { ActiveProductDetails } from '../ActiveProductDetails/ActiveProductDetails';
import toast from 'react-hot-toast';

export const ProductsList = () => {
  const productsArray = useSelector(selectAllProducts)?.products;
  const user = useSelector(selectUser);
  const searchAreaRef = useRef(null);
  const pagination = useSelector(state => state.products.items.pagination);
  const currentPage = pagination?.currentPage || 1;
  const totalPages = pagination?.totalPages || 1;
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [detailsModal, setDetailsModal] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [query, setQuery] = useState({ search: "", page: 1, limit: 20, inStock: false, sort: 'null' });
  const [editMode, setEditMode] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [next, setNext] = useState(false);
  const [bikeBrands, setBikeBrands] = useState([{value: '', label: 'Brand'}]);
  const [bikeModelsArray, setBikeModelsArray] = useState([]);
  const [bikeModels, setBikeModels] = useState([{value: '', label: 'Model'}]);
  const [bikeYear, setBikeYear] = useState([{value: '', label: 'Year'}]);

  const limitList = [
    { value: 20, label: '20' },
    { value: 80, label: '80' },
    { value: 160, label: '160' }
  ];
  const sortList = [
    { value: 'null', label: t('default') },
    { value: 'availability', label: t('availability') },
  ];
  let access = false;
  if (user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') {
      access = true;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  const prevStreamProductHandler = () => {
    setActiveProductIndex(prev => prev - 1);
    setNext(true)
  }

  const nextStreamProductHandler = () => {
    setActiveProductIndex(prev => prev + 1);
    setNext(true)
  }

  useEffect(() => {
    async function getProducts() {
      if (query.search === '') {
        await dispatch(fetchAllProducts({ filter: { inStock: query.inStock }, ...query }));
      } else {
        await dispatch(searchProduct({value: query.search, filter: { inStock: query.inStock }, ...query }));
      }
    }
    async function getBikes() {
      if (bikeModelsArray.length === 0) {
        if (!query.brand || query.brand === '') {
          const res = await axios.get("/products/bikes");
          if (res?.data.length > 0) {
            setBikeBrands([ ...res?.data.map(b => ({ value: b, label: b.toUpperCase() })) ]);
          }
        } else if (query.brand && query.brand !== '') {
          const res = await axios.get(`/products/bikes?brand=${query.brand}`);
          if (res?.data.length > 0) {
            setBikeModelsArray(res?.data);
            setBikeModels([ ...res?.data.map(m => ({ value: m.name, label: m.name.toUpperCase() })) ])
          }
        }
      } else if (query?.model && query.model !== '') {
        const targetModel = bikeModelsArray.find(m => m.name === query.model);
        setBikeYear([ ...targetModel.years.map(y => ({ value: y, label: y })) ]);
      }
    }
    setIsLoading(true);
    getProducts();
    getBikes();
    setIsLoading(false);
  }, [query, bikeModelsArray, dispatch]);

  useEffect(() => {
    if (!streaming) return;

    async function showNext() {
      await sleep(100);
      // const nextProduct = productsArray.find(product =>
      //   product.name.UA === '' ||
      //   product.name.RU === '' ||
      //   product.description.RU === '' ||
      //   product.description.UA === '' ||
      //   product.color === ''
      // );
      // if (nextProduct) {
      //   dispatch(setActiveProduct(nextProduct));
      //   await sleep(100);
      // } else {
      //   toast.success('All products ok')
      // }
      if (productsArray?.length >= activeProductIndex + 1) {
        dispatch(setActiveProduct(productsArray[activeProductIndex]));
        await sleep(100);
        setEditMode(true);
        setDetailsModal(true);
        setNext(false);
      } else {
        setActiveProductIndex(0);
        setEditMode(false);
        setDetailsModal(false);
        setNext(false);
        toast.success(t('open the next page'))
      }
    }
    
    if (next) {
      showNext()
    }
  }, [streaming, productsArray, dispatch, next, activeProductIndex, t])

  // СЛУШАТЕЛЬ НА КЛАВИШИ
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        prevStreamProductHandler();
      }

      if (event.key === 'ArrowRight') {
        nextStreamProductHandler();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeProductIndex]);

  const handleSearch = (value) => {
    setQuery(prev => ({
      ...prev,
      search: value,
      page: 1
    }));
  };

  const changePage = (page) => {
    setQuery(prev => ({
      ...prev,
      page
    }));

    searchAreaRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  };

  const toggleInStock = () => {
    setQuery(prev => ({
      ...prev,
      inStock: !prev.inStock,
      page: 1
    }));
  };

  function filterToggle() {
    const value = !openFilter;
    setOpenFilter(value);
  }

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <div className={css.searchArea} ref={searchAreaRef}>
          <input
            placeholder={`${t('search')}...`}
            value={query.search}
            onChange={e => handleSearch(e.target.value)}
            className={css.searchInput}
          />
          {isLoading && (
            <ClockLoader
              color="#c04545"
              size="30px"
              cssOverride={{ marginLeft: 'auto' }}
            />
          )}
          <button
            className={css.btn}
            onClick={() => filterToggle()}
          >{t('filter')}</button>
          <Select 
            name='limit' 
            options={limitList}
            placeholder={query.limit}
            value={query.limit}
            onChange={e => setQuery(prev => ({ ...prev, limit: e.value}))}
            className={css.limitInput}
          />
        </div>
        {/* FILTER */}
        <div className={`${css.filterBlock} ${openFilter ? css.open : ""}`}>
          <div className={css.filterRow}>
            <label 
              className={css.filterLabel}
              onClick={() => toggleInStock()}
            >
              {t('in stock')}
              <CheckCircleOutlineIcon className={`${css.filterCheck} ${query.inStock && css.checked}`}/>
            </label>
            {access && <label 
              className={css.filterLabel}
              onClick={() => {setActiveProductIndex(0); setStreaming(prev => !prev); setNext(true)}}
            >
              {t('streaming editing')}
              <CheckCircleOutlineIcon className={`${css.filterCheck} ${streaming && css.checked}`}/>
            </label>}
            <Select 
              name='sort' 
              options={sortList}
              onChange={e => setQuery(prev => ({ ...prev, sort: e.value}))}
              className={css.sortInput}
            />
          </div>
          <div className={css.modelFilter}>
            <div className={css.modelItem}>
              <span className={css.modelLabel}>
                {t('make')}
              </span>
              <Select 
                name='brand' 
                options={bikeBrands}
                onChange={(e) => {setBikeModelsArray([]); setQuery(prev => ({ ...prev, brand: e.value, model: null, year: null}))}}
              />
            </div>
            <div className={css.modelItem}>
              <span className={css.modelLabel}>
                {t('model')}
              </span>
              <Select 
                name='model' 
                options={bikeModels}
                onChange={e => setQuery(prev => ({ ...prev, model: e.value}))}
                isDisabled={bikeModels[0].value === '' ? true : false}
              />
            </div>
            <div className={css.modelItem}>
              <span className={css.modelLabel}>
                {t('year')}
              </span>
              <Select 
                name='year' 
                options={bikeYear}
                onChange={e => setQuery(prev => ({ ...prev, year: e.value}))}
                isDisabled={bikeYear[0].value === '' ? true : false}
              />
            </div>
          </div>
        </div>

        <ul className={css.productList}>
          {productsArray &&
            productsArray.map((product, index) => (
              <li
                className={css.listItem}
                key={`${product.article}-${index}`}
                onClick={() => { 
                  setActiveProductIndex(index);
                  dispatch(setActiveProduct(product)); 
                  setDetailsModal(true);
                }}
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
        <div className={css.pagination}>
          {currentPage - 3 > 0 && <button className={css.prevButton} onClick={() => changePage(1)}>{t('first page')}</button>}
          {currentPage - 2 > 0 && <button className={css.prevButton} onClick={() => changePage(currentPage - 2)}>{currentPage - 2}</button>}
          {currentPage - 1 > 0 && <button className={css.prevButton} onClick={() => changePage(currentPage - 1)}>{currentPage - 1}</button>}
          <button className={css.currentPage}>{currentPage}</button>
          {currentPage < totalPages && <button className={css.nextButton} onClick={() => changePage(currentPage + 1)}>{currentPage + 1}</button>}
          {currentPage + 1 < totalPages && <button className={css.nextButton} onClick={() => changePage(currentPage + 2)}>{currentPage + 2}</button>}
          {currentPage < totalPages && <button className={css.nextButton} onClick={() => changePage(totalPages)}>{t('last page')}</button>}
        </div>
      </div>
      <PopUp
        isOpen={detailsModal}
        close={() => {
          setDetailsModal(false); 
          setEditMode(false); 
          dispatch(setActiveProduct({}))
        }}
        body={
          <div className={css.activeProductWrapper}>
            <ActiveProductDetails 
              editMode={editMode}
              setEditMode={setEditMode}
              setDetailsModal={setDetailsModal}
              user={user?.role}
              streaming={streaming}
              setStreaming={setStreaming}
              setNext={setNext}
            />
            {streaming && <button className={css.prevProductBtn} onClick={prevStreamProductHandler}>{'<'}</button>}
            {streaming && <button className={css.nextProductBtn} onClick={nextStreamProductHandler}>{'>'}</button>}
          </div>
        }
      />
    </div>
  );
};
