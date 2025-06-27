import css from './ProductsList.module.css';
// import { Link } from 'react-router-dom';
import { selectAllProducts } from '../../redux/products/selectors';
import { useSelector } from 'react-redux';
import logo from 'images/logo 2.png'

export const ProductsList = () => {
  const productsArray = useSelector(selectAllProducts).products;

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        <ul className={css.productList}>
          {productsArray &&
            productsArray.map(product => (
              <li key={product.art} className={css.productCard}>
                <div>
                  <img
                    className={css.productImg}
                    src={product.images?.[0] || logo}
                    onError={e => {
                      e.currentTarget.src = logo;
                    }}
                    alt={product.name?.UA || 'Изображение'}
                  />
                  <p>{product.name.UA !== '' && product.name.UA !== null ? product.name.UA : product.name.DE}</p>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};
