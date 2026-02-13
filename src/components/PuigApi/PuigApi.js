import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useEffect, useState } from 'react';

export const PuigApiHome = () => {
  const { t } = useTranslation();
  const [categ, setCateg] = useState([]);

  useEffect(() => {
    async function getCateg() {
      const categArray = await axios.get('/puig-api/categories');
      setCateg(categArray.data);
    }

    if (categ.length === 0) {
      getCateg();
    }

    console.log(categ);
  }, [categ]);

  return (
    <>
      helo Puig
      <ul>
        {categ.map(i => (
          <li key={i.id}>{i.title}</li>
        ))}
      </ul>
    </>
  );
};
