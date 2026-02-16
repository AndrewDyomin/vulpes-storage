import { useParams } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { ProductInfo } from '../components/PuigApi/Product/PuigProduct';

export default function PuigProductPage() {
  const { productId } = useParams();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Product</title>
        </Helmet>
        <ProductInfo id={productId} />
      </HelmetProvider>
    </>
  );
}