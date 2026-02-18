import axios from 'axios';
import { useEffect, useState } from 'react';
import css from './Category.module.css';
import { useTranslation } from 'react-i18next';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PopUp } from 'components/PopUp/PopUp';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import puigLogo from '../../../images/puig.png';

export const CategoryInfo = ({ id }) => {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;
  const [category, setCategory] = useState(null);
  const [productsArray, setProductsArray] = useState([]);
  const [editModal, setEditModal] = useState(false);

  //   категория и товары
  useEffect(() => {
    async function getCategory() {
      const catInfo = await axios.get(`/puig-api/categories/${id}`);
      setCategory(catInfo.data);
    }
    async function getProducts() {
      const catInfo = await axios.get(`/puig-api/products-by-category/${id}`);
      setProductsArray(catInfo.data);
    }
    if (!category) {
      getCategory();
    }
    if (category && productsArray.length < 1) {
      getProducts();
    }
  }, [id, category, productsArray]);

  const name =
    currentLang === 'uk'
      ? category?.titleUk
      : currentLang === 'ru'
        ? category?.titleRu
        : category?.title;

  const title = category?.title;
  const titleRu = category?.titleRu;
  const titleUk = category?.titleUk;

  const finalName = name || `{${category?.title}*}`;

  async function translate(string) {
    const response = await axios.post('/puig-api/translate', { string });
    return response.data;
  }

  useEffect(() => {
    if (!category || !editModal) return;

    const needsTitleTranslate = title && (titleRu === '' || titleUk === '');

    if (!needsTitleTranslate) return;

    const run = async () => {
      const titleTr = await translate(title);
      setCategory(prev => ({ ...prev, titleRu: titleTr[0], titleUk: titleTr[1] }))
    }

    run();
  }, [category, title, titleRu, titleUk, editModal])

  async function saveCategoryChanges() {
    try {
      await axios.post(`/puig-api/categories`, category);
      toast.success('Изменения сохранены');
      setEditModal(false);
    } catch (err) {
      toast.error(err);
    }
  }

  return (
    <div>
      <div className={css.categoryInfo}>
        <h1>{finalName}</h1>
        <button className={css.editBtn} onClick={() => setEditModal(true)}>
          <MoreHorizIcon fontSize="large" />
        </button>
      </div>
      <ul className={css.productsList}>
        {productsArray.map(p => (
          <li key={p.id}>
            <Link to={`/puig-api/product/${p.id}`} className={css.productCard}>
              <img src={!p?.images || p.images?.length < 1 ? puigLogo : p.images[0]} alt='' className={css.productImage}/>
              <p className={css.productName}>
                {currentLang === 'uk' && p?.titleUk !== ''
                ? p?.titleUk
                : currentLang === 'ru' && p?.titleRu !== ''
                  ? p?.titleRu
                  : p?.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <div>
        <PopUp
          isOpen={editModal}
          close={() => setEditModal(false)}
          body={
            <div>
              <h3>{finalName}</h3>
              <div className={css.modalForm}>
                <label className={css.modalLabel}>
                  en
                  <input
                    className={css.modalInput}
                    value={category?.title}
                    disabled
                  />
                </label>
                <label className={css.modalLabel}>
                  ru
                  <input
                    className={css.modalInput}
                    value={category?.titleRu}
                    onChange={e =>
                      setCategory(prev => ({
                        ...prev,
                        titleRu: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className={css.modalLabel}>
                  uk
                  <input
                    className={css.modalInput}
                    value={category?.titleUk}
                    onChange={e =>
                      setCategory(prev => ({
                        ...prev,
                        titleUk: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className={css.modalLabel}>
                  image
                  <input
                    className={css.modalInput}
                    defaultValue={category?.image}
                    onChange={e =>
                      setCategory(prev => ({ ...prev, image: e.target.value }))
                    }
                  />
                </label>
                <button
                  className={css.modalButton}
                  onClick={() => saveCategoryChanges()}
                >
                  {t('save')}
                </button>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
};
