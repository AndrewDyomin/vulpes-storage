import css from './ProductsList.module.css';
// import { Link } from 'react-router-dom';
import { selectAllProducts } from '../../redux/products/selectors';
import { useSelector } from 'react-redux';

export const ProductsList = () => {

const productsArray = useSelector(selectAllProducts).products;

console.log(productsArray)

  return (
    <div className={css.container}>
        <div className={css.wrapper}>
            {productsArray.map((product) => (
                <div>
                    <p>{product.name.UA}</p>
                </div>
            ))}
        </div>
    </div>
  );
};