import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useEffect, useState } from 'react';
import headImage from '../../images/puigHead.jpg';
import puigLogo from '../../images/puig.png'
import css from './PuigApi.module.css'
import { Link } from 'react-router-dom';

export const PuigApiHome = () => {
  const [categ, setCateg] = useState([]);
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    async function getCateg() {
      const categArray = await axios.get('/puig-api/categories');
      setCateg(categArray.data);
    }

    if (categ.length === 0) {
      getCateg();
    }
  }, [categ]);

  function getName(category) {
    const name =
    currentLang === "uk"
      ? category?.titleUk
      : currentLang === "ru"
      ? category?.titleRu
      : category?.title;

    const finalName = name || `{${category?.title}*}`;
    return finalName;
  }

  return (
    <>
      <div className={css.heroArea}>
        <h1 className={css.title}>Hello from Puig</h1>
        <img src={headImage} alt='title bike' className={css.heroImage}/>
      </div>
      <ul className={css.categoriesList}>
        {categ.map(i => (
          <li key={i.id}>
            <Link
              to={`category/${i.id}`}
              className={css.categoryCard}
            >
              <img src={!i.image || i.image === '' ? puigLogo : i.image} alt='category' className={css.categoryImage}/>
              <p className={css.categoryName}>{getName(i)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
};
