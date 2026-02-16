import { useParams } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { CategoryInfo } from '../components/PuigApi/Category/Category';

export default function PuigCategoryPage() {
  const { categoryId } = useParams();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>Category</title>
        </Helmet>
        <CategoryInfo id={categoryId} />
      </HelmetProvider>
    </>
  );
}
