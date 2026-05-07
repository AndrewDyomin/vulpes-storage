import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useEffect, useState } from 'react';
import headImage from '../../images/puigHead.jpg';
import puigLogo from '../../images/puig.png'
import css from './PuigApi.module.css'
import { Link } from 'react-router-dom';
import { Paper, Tabs, Tab, Box } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { PopUp } from 'components/PopUp/PopUp';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { Search } from './Search/Search';
import { ClipLoader } from 'react-spinners';

export const PuigApiHome = () => {
  const [categ, setCateg] = useState([]);
  const [tab, setTab] = useState(0); 
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const [bike, setBike] = useState({ make: null, model: null, year: null })
  const [bikeBrands, setBikeBrands] = useState([{value: '', label: 'Brand'}]);
  const [bikeModelsArray, setBikeModelsArray] = useState([]);
  const [bikeModels, setBikeModels] = useState([{value: '', label: 'Model'}]);
  const [bikeYear, setBikeYear] = useState([{value: '', label: 'Year'}]);
  const [pending, setPending] = useState(false);
  const [prevBike, setPrevBike] = useState(null)
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  useEffect(() => {
    let isBike = false
    if (bike?.year && JSON.stringify(bike) !== JSON.stringify(prevBike)) {
      isBike = true;
    }

    async function getCateg() {
      setPending(true)
      const categArray = await axios.get('/puig-api/categories');
      setCateg(categArray.data);
      setPending(false)
    }
    async function getCategByBike() {
      setPending(true)
      const categByBike = await axios.get(`/puig-api/categories?make=${bike.make}&model=${bike.model}&year=${bike.year}`);
      setCateg(categByBike.data)
      setPrevBike(bike)
      setPending(false)
    }

    if (categ.length === 0 && !isBike) {
      getCateg();
    }
    if (isBike) {
      getCategByBike();
    }
  }, [categ, bike, prevBike]);

  useEffect(() => {
    async function getBikeBrands() {
      setPending(true)
      const res = await axios.get('/puig-api/bike-brands');
      setBikeBrands([ ...res?.data.map(b => ({ value: b, label: b })) ]);
      setPending(false)
    }

    async function getBikeModels() {
      setPending(true)
      const res = await axios.get(`/puig-api/bike-models?brand=${bike.make}`);
      setBikeModelsArray(res?.data);
      setBikeModels([ ...res?.data.map(b => ({ value: b.model, label: b.model })) ]);
      setPending(false)
    }

    if (bikeBrands[0].value === '') {
      getBikeBrands();
    } else if (bike?.make && !bike.model && !bike.year && !bikeModelsArray.length) {
      getBikeModels();
    } else if (bike?.make && bike?.model && !bike?.year) {
      const targetModel = bikeModelsArray.find(m => m.model === bike.model);
      setBikeYear([ ...targetModel.years.map(m => ({ value: m, label: m })) ]);
    }
  }, [bike, bikeBrands, bikeModelsArray]);

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

  async function startCheckUpdates() {
    setCatMenuOpen(false);
    const response = await axios.get('/puig-api/check-articles-updates')
    
    return response.data
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
              transition: 'transform 0.25s ease, background-color 0.2s ease',
            },

            '& .Mui-selected': {
              backgroundColor: '#fff',
              fontWeight: 600,
              color: '#818181',
              transform: 'translateY(5px)',
              borderBottom: 'none',
              zIndex: 1,
            },

            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab label={t("categories")} />
          <Tab label={t("orders")} />
          <Tab label={t("invoices")} />
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
            <div>
              <div className={css.catMenuWrapper}>
                <Search />
                <button className={css.catMenuBtn} onClick={() => setCatMenuOpen(true)}>
                  <MoreHorizIcon />
                </button>
              </div>
              <div className={css.modelFilter}>
                <div className={css.modelItem}>
                  <span className={css.modelLabel}>
                    {t('make')}
                  </span>
                  <Select 
                    name='brand' 
                    options={bikeBrands}
                    onChange={(e) => {setBike({ make: e.value, model: null, year: null }); setBikeModelsArray([])}}
                  />
                </div>
                <div className={css.modelItem}>
                  <span className={css.modelLabel}>
                    {t('model')}
                  </span>
                  <Select 
                    name='model' 
                    options={bikeModels}
                    value={bikeModels.find(i => i.value === bike.model) || null}
                    onChange={(e) => {setBike(prev => ({ ...prev, model: e.value, year: null }))}}
                  />
                </div>
                <div className={css.modelItem}>
                  <span className={css.modelLabel}>
                    {t('year')}
                  </span>
                  <Select 
                    name='year' 
                    options={bikeYear}
                    value={bikeYear.find(i => i.value === bike.year) || null}
                    onChange={(e) => {setBike(prev => ({ ...prev, year: e.value }))}}
                  />
                </div>
                {pending && <ClipLoader color="#c04545" size="30px" className={css.loader}/>}
              </div>
              <ul className={css.categoriesList}>
                {categ.map(i => (
                  <li key={i.id}>
                    <Link
                      to={bike.year ? `category/${i.id}?make=${bike.make}&model=${bike.model}&year=${bike.year}` : `category/${i.id}`}
                      className={css.categoryCard}
                    >
                      <img src={!i.image || i.image === '' ? puigLogo : i.image} alt='category' className={css.categoryImage}/>
                      <p className={css.categoryName}>{getName(i)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <PopUp 
                isOpen={catMenuOpen}
                close={() => setCatMenuOpen(false)}
                body={
                  <div className={css.catMenu}>
                    <button onClick={() => toast.promise(startCheckUpdates(), { loading: 'loading...', success: (data) => data.message, error: 'Error: try again later.' })} className={css.btn}>Update items from Puig</button>
                    {/* <button className={css.btn}>Download products table</button> */}
                  </div>
                }
              />
            </div>}
          {tab === 1 && <div>Orders content</div>}
          {tab === 2 && <div>Invoices content</div>}
        </Box>
      </Paper>
    </>
  );
};
