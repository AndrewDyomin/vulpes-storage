import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useEffect, useState } from 'react';
import headImage from '../../images/puigHead.jpg';
import puigLogo from '../../images/puig.png'
import css from './PuigApi.module.css'
import { Link } from 'react-router-dom';
import { Paper, Tabs, Tab, Box } from '@mui/material';

export const PuigApiHome = () => {
  const [categ, setCateg] = useState([]);
  const [tab, setTab] = useState(0); 
  const { i18n, t } = useTranslation();
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
      <Paper className={css.paperCard} elevation={10}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          variant="standard"
          sx={{
            minHeight: 40,
            position: 'relative',
            marginBottom: 4,

            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              height: '2px',
              backgroundColor: '#8f8f8f',
              zIndex: 0,
            },

            '& .MuiTab-root': {
              textTransform: 'none',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              backgroundColor: '#ebebeb',
              marginRight: '4px',
              border: '1px solid #8f8f8f',
              borderBottomWidth: '2px',
              position: 'relative',
              zIndex: 1,
              transition: 'transform 0.25s ease, background-color 0.2s ease',
            },

            '& .Mui-selected': {
              backgroundColor: '#fff',
              fontWeight: 600,
              color: '#626262',
              transform: 'translateY(5px)',
              borderBottom: 'none',
              zIndex: 2,
            },

            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab label={t("Categories")} />
          <Tab label="Orders" />
          <Tab label="Invoices" />
        </Tabs>

        <Box
          key={tab}
          sx={{
            animation: 'fadeSlide 750ms ease',
            '@keyframes fadeSlide': {
              from: {
                opacity: 0,
                transform: 'translateY(-35px)',
              },
              to: {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          }}
        >
          {tab === 0 && 
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
            </ul>}
          {tab === 1 && <div>Orders content</div>}
          {tab === 2 && <div>Invoices content</div>}
        </Box>
      </Paper>
    </>
  );
};
