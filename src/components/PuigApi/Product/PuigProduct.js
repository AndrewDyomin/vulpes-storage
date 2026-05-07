import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import css from './PuigProduct.module.css';
import puigLogo from '../../../images/puig.png';
import { useTranslation } from 'react-i18next';
import Paper from '@mui/material/Paper';
import ClearIcon from '@mui/icons-material/Clear';
import BeenhereIcon from '@mui/icons-material/Beenhere';
import BackspaceIcon from '@mui/icons-material/Backspace';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CachedIcon from '@mui/icons-material/Cached';
import { ClockLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useSelector } from 'react-redux';
import { selectEUR } from '../../../redux/currency/selectors';

export const ProductInfo = ({ id }) => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const { sell } = useSelector(selectEUR)
  const [product, setProduct] = useState(null);
  const [activeArticle, setActiveArticle] = useState(0);
  const [imageIndex, setImageIndex] = useState(0);
  const [translated, setTranslated] = useState({
    title: {
      ru: { translated: false, pending: false },
      uk: { translated: false, pending: false },
    },
    description: {
      ru: { translated: false, pending: false },
      uk: { translated: false, pending: false },
    },
  });
  const [saving, setSaving] = useState(true);
  const [pending, setPending] = useState(true);
  const [horoshopStatus, setHoroshopStatus] = useState('left');
  const [bikesLoading, setBikesLoading] = useState(false);
  const [bikeModelsList, setBikeModelsList] = useState([{ value: '-', label: '-' }]);
  const [activeBikeBrand, setActiveBikeBrand] = useState(null);

  const make = searchParams.get('make');
  const model = searchParams.get('model');
  const year = searchParams.get('year');
  const title = product?.title;
  const titleRu = product?.titleRu;
  const titleUk = product?.titleUk;
  const description = product?.description;
  const descriptionRu = product?.descriptionRu;
  const descriptionUk = product?.descriptionUk;

  async function translate(string) {
    const response = await axios.post('/puig-api/translate', { string });
    return response.data;
  }

  useEffect(() => {
    async function getProduct() {
      let response;
      if (!year) {
        response = await axios.get(`/puig-api/product-by-id/${id}`);
      } else {
        response = await axios.get(`/puig-api/product-by-id/${id}?make=${make}&model=${model}&year=${year}`);
      }
      
      setProduct(response.data);
      setPending(false);
    }
    getProduct();
  }, [id, make, model, year]);

  useEffect(() => {
    if (!title) return;

    const needsTitleTranslate = title && (titleRu === '' || titleUk === '');

    if (!needsTitleTranslate) return;

    const run = async () => {
      setTranslated(prev => ({
        ...prev,
        title: {
          ru: { ...prev.title.ru, pending: true },
          uk: { ...prev.title.uk, pending: true },
        },
      }));

      const titleTr = await translate(title);

      setProduct(prev => ({
        ...prev,
        titleRu: prev.titleRu === '' ? titleTr[0] : prev.titleRu,
        titleUk: prev.titleUk === '' ? titleTr[1] : prev.titleUk,
      }));

      setTranslated(prev => ({
        ...prev,
        title: {
          ru: { translated: true, pending: false },
          uk: { translated: true, pending: false },
        },
      }));
    };

    run();
    setSaving(false);
  }, [title, titleRu, titleUk]);

  useEffect(() => {
    if (!description || titleRu === '' || titleUk === '') return;

    const needsToTranslate =
      description && (descriptionRu === '' || descriptionUk === '');

    if (!needsToTranslate) return;

    const run = async () => {
      setTranslated(prev => ({
        ...prev,
        description: {
          ru: { ...prev.description.ru, pending: true },
          uk: { ...prev.description.uk, pending: true },
        },
      }));

      const descriptionTr = await translate(description);

      setProduct(prev => ({
        ...prev,
        descriptionRu:
          prev.descriptionRu === '' ? descriptionTr[0] : prev.descriptionRu,
        descriptionUk:
          prev.descriptionUk === '' ? descriptionTr[1] : prev.descriptionUk,
      }));

      setTranslated(prev => ({
        ...prev,
        description: {
          ru: { translated: true, pending: false },
          uk: { translated: true, pending: false },
        },
      }));
    };

    run();
    setSaving(false);
  }, [titleRu, titleUk, description, descriptionRu, descriptionUk]);

  useEffect(()=>{
    if (product?.articles[activeArticle]?.horoshopStatus === 'on') {
      setHoroshopStatus('right')
    } else {
      setHoroshopStatus('left')
    }
    if (product?.articles[activeArticle]?.bikesArray?.length > 0) {
      setBikeModelsList([ ...product.articles[activeArticle].bikesArray.map((b, i) => ({ value: i, label: b.brand })) ])
    } else {
      setBikeModelsList([{ value: '-', label: '-' }]);
    }
  }, [activeArticle, product?.articles])

  let fallbackImage = product?.images?.[0] || puigLogo;

  const imageCandidates = [
    product?.images?.[0],
    ...(product?.articles?.map(a => a.images?.[0]) || []),
  ];

  const handleImageError = () => {
    if (imageIndex < imageCandidates.length - 1) {
      setImageIndex(prev => prev + 1);
    } else {
      setImageIndex(null);
    }
  };

  async function saveChanges() {
    setSaving(true);
    try {
      const response = await axios.post('/puig-api/update-product', {
        ...product, articles: [ product.articles[activeArticle] ]
      });
      return response;
    } finally {
      setSaving(false);
      setTranslated({
        title: {
          ru: { translated: false, pending: false },
          uk: { translated: false, pending: false },
        },
        description: {
          ru: { translated: false, pending: false },
          uk: { translated: false, pending: false },
        },
      });
    }
  }

  async function toggleHoroshop() {
    if (horoshopStatus === 'left') {
      if (translated.title.ru.translated) {
        toast.error('save the translation first');
        return;
      } else if (!product.articles[activeArticle].priceUAH || product.articles[activeArticle].priceUAH === '') {
        toast.error('save your price first');
        return;
      }
      try {
        setHoroshopStatus('middle');
        const response = await axios.get(`puig-api/horoshop/${product?.articles[activeArticle]?.code}/${product?.articles[activeArticle]?.colour.code}/on`)
        setProduct(prev => ({ ...prev, articles: prev.articles.map((a, index) => (index === activeArticle ? { ...a, horoshopStatus: 'on' } : a)) }))
        toast.success(response.data.message)
        setHoroshopStatus('right');
      } catch(err) {
        toast.error(err)
        setHoroshopStatus('left');
      }
    } else if (horoshopStatus === 'right') {
      try {
        const response = await axios.get(`puig-api/horoshop/${product?.articles[activeArticle]?.code}/${product?.articles[activeArticle]?.colour.code}/off`)
        setProduct(prev => ({ ...prev, articles: prev.articles.map((a, index) => (index === activeArticle ? { ...a, horoshopStatus: 'off' } : a)) }))
        toast.success(response.data.message)
        setHoroshopStatus('left');
      } catch(err) {
        toast.error(err)
      }
    } else {
      toast.error('error! reload page...')
    }
  }

  async function toggleSplitting() {
    if (product?.enableSplitting) {
      setProduct(prev => ({ ...prev, enableSplitting: false }))
    } else {
      setProduct(prev => ({ ...prev, enableSplitting: true }))
    }
  }
  
  async function reloadBikes() {
    if (!bikesLoading) {
      setBikesLoading(true)
      try {
        const response = await axios.post('/puig-api/update-bikes-by-article', { code: product.articles[activeArticle].code, link: product.articles[activeArticle].bikes })
        setProduct(prev => ({ ...prev, articles: [ ...prev.articles.map((a, i) => (i === activeArticle ? { ...a, bikesArray: response.data } : a)) ] }))
        setBikeModelsList([ ...response.data.map((b, i) => ({ value: i, label: b.brand })) ])
        setBikesLoading(false);
        setSaving(false);
      } catch(err) {
        toast.error(err)
        setBikesLoading(false) 
      }
    } else {
      toast.error('Please, wait.')
    }
  }

  return (
    <>
      {pending && (
        <ClockLoader size={50} color="#c04545" className={css.startLoader} />
      )}
      {product && (
        <div>
          <div className={css.topArea}>
            <div className={css.imageWrapper}>
              <img
                src={
                  imageIndex !== null
                    ? imageCandidates[imageIndex]
                    : fallbackImage
                }
                alt={product.title}
                className={css.productImage}
                onError={handleImageError}
                onClick={() => setImageIndex(0)}
              />
            </div>
            <div>
              <Paper className={css.paperCard} elevation={10}>
                <p className={css.paperTitle}>{t('title')}</p>
                <p>{product.title}</p>
                <label className={css.paperLabel}>
                  ru:
                  <input
                    className={
                      translated.title.ru.translated
                        ? `${css.paperInput} ${css.greenBorder}`
                        : css.paperInput
                    }
                    value={product.titleRu}
                    onChange={e =>
                      setProduct(prev => ({ ...prev, titleRu: e.target.value }))
                    }
                  />
                  {translated.title.ru.pending && (
                    <ClockLoader
                      size={25}
                      color="#c04545"
                      className={css.loader}
                    />
                  )}
                </label>
                <label className={css.paperLabel}>
                  uk:
                  <input
                    className={
                      translated.title.uk.translated
                        ? `${css.paperInput} ${css.greenBorder}`
                        : css.paperInput
                    }
                    value={product.titleUk}
                    onChange={e =>
                      setProduct(prev => ({ ...prev, titleUk: e.target.value }))
                    }
                  />
                  {translated.title.uk.pending && (
                    <ClockLoader
                      size={25}
                      color="#c04545"
                      className={css.loader}
                    />
                  )}
                </label>
                <div className={css.splitting}>
                  Enable splitting:
                  <AddBoxIcon onClick={() => toggleSplitting()} className={`${css.plusIcon} ${product.enableSplitting && css.plusActive}`}/>
                </div>
              </Paper>
              <div className={css.articlesWrapper}>
                {product.articles.map((art, index) => (
                  <div
                    key={art.code + art.colour.code}
                    className={css.articleCard}
                    style={
                      activeArticle === index ? { borderColor: '#db4924' } : {}
                    }
                    onClick={() => {
                      setActiveArticle(index);
                      setImageIndex(index + 1);
                    }}
                  >
                    {art.images.length > 0 && (
                      <img
                        src={art.images[0]}
                        alt={art.code}
                        className={css.artImage}
                      />
                    )}
                    <p>{art.code + art.colour.code}</p>
                    <p>{art.colour.description}</p>
                    {art.outdated === 1 && <ClearIcon fontSize='large' className={css.outdated}/>}
                    {art.horoshopStatus === 'on' && <BeenhereIcon fontSize='medium' className={css.horoshopOk}/>}
                    {art.horoshopStatus === 'canceled' && <BackspaceIcon fontSize='medium' className={css.horoshopCancel}/>}
                  </div>
                ))}
              </div>
              <div className={css.stockInfoWrapper}>
                <p>
                  stock: {product.articles[activeArticle].stock}.{' '}
                  {product.articles[activeArticle].stock_prevision !== '' &&
                    `${product.articles[activeArticle].stock_prevision}`}
                </p>
                <p>self price: €{product.articles[activeArticle].pvp}</p>
                <p>
                  recommended price: €
                  {product.articles[activeArticle].pvp_recommended} {`(${Math.round(product.articles[activeArticle].pvp_recommended * sell)}грн.)`}
                </p>
                <p>
                  Measures:{' '}
                  {product.articles[activeArticle].mesures.packaging.width || 0}
                  x
                  {product.articles[activeArticle].mesures.packaging.height ||
                    0}
                  x
                  {product.articles[activeArticle].mesures.packaging.depth || 0}{' '}
                  -{' '}
                  {product.articles[activeArticle].mesures.packaging.weight ||
                    0}
                  kg
                </p>
                <div className={css.priceUahArea}>
                  <p>{t('price')}:</p>
                  <input
                    value={product.articles[activeArticle].priceUAH || ''}
                    onChange={e => {
                      setProduct(prev => ({
                        ...prev,
                        articles: [
                          ...prev.articles.map((a, index) =>
                            index === activeArticle
                              ? { ...a, priceUAH: e.target.value }
                              : a
                          ),
                        ],
                      }));
                      setSaving(false);
                    }}
                    className={css.priceField}
                    size={
                      (product.articles[activeArticle].priceUAH || '').length ||
                      1
                    }
                  />
                  грн.
                </div>
              </div>
            </div>
          </div>

          <div>
            <Paper className={css.paperCard} elevation={10}>
              <p>{t('description')}:</p>
              <p>{product.description}</p>
              <label className={css.paperLabel}>
                ru:
                <textarea
                  rows={7}
                  className={
                    translated.description.ru.translated
                      ? `${css.paperInput} ${css.greenBorder}`
                      : css.paperInput
                  }
                  value={product.descriptionRu}
                  onChange={e =>
                    setProduct(prev => ({
                      ...prev,
                      descriptionRu: e.target.value,
                    }))
                  }
                />
                {translated.description.ru.pending && (
                  <ClockLoader
                    size={25}
                    color="#c04545"
                    className={css.loader}
                  />
                )}
              </label>
              <label className={css.paperLabel}>
                uk:
                <textarea
                  rows={7}
                  className={
                    translated.description.uk.translated
                      ? `${css.paperInput} ${css.greenBorder}`
                      : css.paperInput
                  }
                  value={product.descriptionUk}
                  onChange={e =>
                    setProduct(prev => ({
                      ...prev,
                      descriptionUk: e.target.value,
                    }))
                  }
                />
                {translated.description.uk.pending && (
                  <ClockLoader
                    size={25}
                    color="#c04545"
                    className={css.loader}
                  />
                )}
              </label>
            </Paper>
          </div>
          <div className={css.buttons}>
            <div className={css.horoshopWrapper} onClick={() => toggleHoroshop()}>
              ХОРОШОП
              <div className={css.progress}>
                <div className={css.progressLine}>
                  <div className={`${css.progressPoint} ${horoshopStatus === 'middle' && css.progressMiddlePoint} ${horoshopStatus === 'right' && css.progressRightPoint}`}></div>
                </div>
              </div>
            </div>
            <button
              className={saving ? `${css.btn} ${css.grayBtn}` : css.btn}
              onClick={() =>
                toast.promise(saveChanges(), {
                  loading: t('sending product'),
                  success: <b>{t('product saved')}</b>,
                  error: <b>{t('ERROR. Product not saved')}</b>,
                })
              }
              disabled={saving}
            >
              {t('save')}
            </button>
          </div>
          <Paper className={css.paperCard} elevation={10}>
            <div className={css.bikesHeader}>
              Bikes:
              <CachedIcon className={`${css.reloadIcon} ${bikesLoading && css.reloadActive}`} onClick={() => reloadBikes()}/>
            </div>
            <div className={css.bikesList}>
              {product?.articles[activeArticle]?.bikesArray?.length > 0 && 
                <Select 
                  name='brand' 
                  onChange={(e) => setActiveBikeBrand(e.value)}
                  placeholder={bikeModelsList[0].label}
                  options={bikeModelsList}
                />
              }
              {activeBikeBrand !== null && 
                <ul className={css.modelsList}>
                  {product?.articles[activeArticle]?.bikesArray[activeBikeBrand]?.models.map((m, i) => (
                    <li key={`${m.model}${i}`} className={css.modelCard}>
                      <p>{m.model}: {m.year.join(', ')}</p>
                    </li>
                  ))}
                </ul>
              }
            </div>
          </Paper>
        </div>
      )}
    </>
  );
};
