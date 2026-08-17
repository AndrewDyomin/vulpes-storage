import { useTranslation } from 'react-i18next';
import css from './LeversConstructor.module.css';
import Select from 'react-select';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { LeverDetailsEditor } from '../LeverDetailsEditor/LeverDetailsEditor';
import { selectUser } from '../../redux/auth/selectors';
import { ClipLoader } from 'react-spinners';
import notFound from '../../images/not_found.jpg';
import { LeversSelection } from '../LeversSelection/LeversSelection';
import toast from 'react-hot-toast';
import { PopUp } from '../PopUp/PopUp';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

export const LeversConstructor = () => {
  const { t, i18n } = useTranslation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const OrderSchema = Yup.object().shape({
    firstName: Yup.string()
      .min(2, t('first name too short'))
      .max(20, t('first name too long'))
      .required(t('first name required')),
    lastName: Yup.string()
      .min(2, t('last name too short'))
      .max(50, t('last name too long'))
      .required(t('last name required')),
    phone: Yup.string()
      .min(10, t('phone number too short'))
      .max(20, t('phone number too long'))
      .required(t('phone number required')),
    cityRef: Yup.string()
      .required(t('select your city')),
    branchRef: Yup.string()
      .required(t('select your branch')),
  });

  const [query, setQuery] = useState({ brand: '', model: '', year: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [bikeBrands, setBikeBrands] = useState([{ value: '', label: 'Brand' }]);
  const [bikeModelsArray, setBikeModelsArray] = useState([]);
  const [bikeModels, setBikeModels] = useState([{ value: '', label: 'Model' }]);
  const [bikeYear, setBikeYear] = useState([{ value: '', label: 'Year' }]);
  const [details, setDetails] = useState(null);
  const [leverColor, setLeverColor] = useState('black');
  const [adjustorColor, setAdjustorColor] = useState('black');
  const [tipColor, setTipColor] = useState('black');
  const [topImage, setTopImage] = useState(null);
  const [topImageError, setTopImageError] = useState(false);
  const [contactModal, setContactModal] = useState(false);
  const [cities, setCities] = useState({show: false, array: []});
  const [branches, setBranches] = useState({show: false, array: []});
  const [orderId, setOrderId] = useState(null);
  const [thanksModal, setThanksModal] = useState(false);

  const leverGenerations = [
    {value: 'standart short', label: t('short 14,5cm')},
    {value: 'standart long', label: t('long 17,5cm')},
    {value: 'safety', label: 'Safety'},
    {value: 'vario', label: 'Vario'},
    {value: 'vario safety', label: 'Vario Safety'},
    {value: 'vario lll', label: 'Vario III'},
    // {value: 'vx short', label: 'VX short'},
    // {value: 'vx long', label: 'VX long'},
    // {value: 'vx safety', label: 'VX safety'},
    // {value: 'racing', label: 'Racing'}
  ];

  const btnColorStyle = {
    "black": {
      background: `linear-gradient(
        135deg,
        #000000a7 18%,
        #ffffff47 30%,
        #000 45%
      )`,
    },
    "black mat": {
      background: '#212121',
    },
    "blue": {
      background: `linear-gradient(
        135deg,
        #0022bca7 18%,
        #ffffff47 30%,
        #0022bc 45%
      )`,
    },
    "gold": {
      background: `linear-gradient(
        135deg,
        #edd23ca7 18%,
        #ffffff47 30%,
        #edd23c 45%
      )`,
    },
    "green": {
      background: `linear-gradient(
        135deg,
        #059007a7 18%,
        #ffffff47 30%,
        #059007 45%
      )`,
    },
    "orange": {
      background: `linear-gradient(
        135deg,
        #df6538a7 15%,
        #ffffff47 30%,
        #df6538 45%
      )`,
    },
    "red": {
      background: `linear-gradient(
        135deg,
        #e40b0ba7 15%,
        #ffffff47 30%,
        #e40b0b 45%
      )`,
    },
    "silver": {
      background: `linear-gradient(
        135deg,
        #b5b5b5a7 15%,
        #ffffff47 30%,
        #b5b5b5 45%
      )`,
    },
    "titanium": {
      background: `linear-gradient(
        135deg,
        #7c7c7ca7 15%,
        #ffffff47 30%,
        #7c7c7c 45%
      )`,
    },
  };

  let clutchLeversMap;
  let brakeLeversMap;
  let adjustorsMap;
  let clutchTipsMap;
  let brakeTipsMap;

  if (details?.clutchLevers?.length) {
    clutchLeversMap = new Map(
      details.clutchLevers.map(item => [item.color, item])
    );
    brakeLeversMap = new Map(
      details.brakeLevers.map(item => [item.color, item])
    );
    adjustorsMap = new Map(
      details.adjustor.map(item => [item.color, item])
    );
    clutchTipsMap = new Map(
      details.clutchTips.map(item => [item.color, item])
    );
    brakeTipsMap = new Map(
      details.brakeTips.map(item => [item.color, item])
    );
  }

  const sendOrder = async(credentials) => {
    setIsLoading(true)
    try {
      const data = {
        ...credentials,
        ...query,
        price: Math.round(Number(details?.price * 0.85)),
        oldPrice: details?.price,
        clutch: {
          adapter: details.clutch,
          lever: clutchLeversMap.get(leverColor),
          adjustor: adjustorsMap.get(adjustorColor),
          tip: query?.generation.includes('vario') ? clutchTipsMap.get(tipColor) : null,
        },
        brake: {
          adapter: details.brake,
          lever: brakeLeversMap.get(leverColor),
          adjustor: adjustorsMap.get(adjustorColor),
          tip: query?.generation.includes('vario') ? brakeTipsMap.get(tipColor) : null,
        },
      }

      const res = await axios.post('/levers/add-order', data);

      if (res?.data?.message === 'Order accepted') {

        setContactModal(false);
        setOrderId(res.data.data.data.orderId);
        setThanksModal(true);
      } else {
        toast.error(`${t('something went wrong')}. ${t('error, try again for a minute')}`)
      }
    } catch {
      toast.error(t('something went wrong'))
    } finally {
      setIsLoading(false);
    }
  }

  async function getCities(value) {
    const res = await axios.get(`/nova-poshta/cities/${value}`);
    setCities({show: true, array: res.data.map(i => ({ value: i.Ref, label: i18n.language === 'ru' ? `${i.SettlementTypeDescriptionRu} ${i.DescriptionRu}` : `${i.SettlementTypeDescription} ${i.Description}` }))})
  }

  async function getBranches(ref, value) {
    const res = await axios.get(`/nova-poshta/branches/${ref}/${value || null}`);
    setBranches({show: true, array: res.data.map(i => ({ value: i.Ref, label: i18n.language === 'ru' ? i.DescriptionRu : i.Description }))})
  }

  useEffect(() => {
    async function getBikes() {
      if (bikeModelsArray.length === 0) {
        if (!query.brand || query.brand === '') {
          const res = await axios.get("/products/bikes?filter=leverAdapters");
          if (res?.data.length > 0) {
            setBikeBrands([
              ...res?.data.map(b => ({ value: b, label: b.toUpperCase() })),
            ]);
          }
        } else if (query.brand && query.brand !== '') {
          const res = await axios.get(`/products/bikes?brand=${query.brand}&filter=leverAdapters`);
          if (res?.data.length > 0) {
            setBikeModelsArray(res?.data);
            setBikeModels([
              ...res?.data.map(m => ({
                value: m.name,
                label: m.name.toUpperCase(),
              })),
            ]);
          }
        }
      } else if (query?.model && query.model !== '') {
        const targetModel = bikeModelsArray.find(m => m.name === query.model);
        setBikeYear([...targetModel.years.map(y => ({ value: y, label: y }))]);
      }
    }
    setIsLoading(true);
    getBikes();
    setIsLoading(false);
  }, [query, bikeModelsArray, dispatch]);

//   FETCH ADAPTERS
  useEffect(() => {
    setIsLoading(true);

    async function fetchDetails() {
      const res = await axios.post('/levers/get-by-bike', query);
      if (res?.data?.brake?.length) {
        setDetails(res.data)
      }
    }

    if (query?.year && query?.year !== '' && query?.generation && query?.generation !== '') {
      fetchDetails();
      setLeverColor('black');
      setAdjustorColor('black');
      setTipColor('black');
    }

    setIsLoading(false);
  }, [query]);

  // GET TOP IMAGE
  useEffect(() => {
    async function getTopImage() {
      const set = {
        lever: leverColor || '',
        adjustor: adjustorColor || '',
        tip: tipColor || '',
        generation: query?.generation || '',
      };
      const res = await axios.post('/levers/get-image', set);
      setTopImage(res.data.link);
    }

    if (details?.clutchLevers?.length > 0) {
      getTopImage();
    }
  }, [details, leverColor, adjustorColor, tipColor, query.generation])

  //  RESET IMAGE ERROR
  useEffect(() => {
    setTopImageError(false);
  }, [topImage]);

  return (
    <>
      {(user?.role && user?.role !== 'guest') && <LeverDetailsEditor />}
      <div className={css.modelFilter}>
        <div className={css.modelItem}>
          <span className={css.modelLabel}>{t('make')}</span>
          <Select
            name="brand"
            options={bikeBrands}
            onChange={e => {
              setBikeModelsArray([]);
              setQuery(prev => ({
                ...prev,
                brand: e.value,
                model: null,
                year: null,
              }));
              setDetails(null);
            }}
          />
        </div>
        <div className={css.modelItem}>
          <span className={css.modelLabel}>{t('model')}</span>
          <Select
            name="model"
            options={bikeModels}
            onChange={e => {
              setQuery(prev => ({ ...prev, model: e.value })); 
              setDetails(null);
            }}
            isDisabled={bikeModels[0].value === '' ? true : false}
          />
        </div>
        <div className={css.modelItem}>
          <span className={css.modelLabel}>{t('year')}</span>
          <Select
            name="year"
            options={bikeYear}
            onChange={e => setQuery(prev => ({ ...prev, year: e.value }))}
            isDisabled={bikeYear[0].value === '' ? true : false}
          />
        </div>
        <div className={css.modelItem}>
          <span className={css.modelLabel}>{t('lever model')}</span>
          <Select
            name="generation"
            options={leverGenerations}
            onChange={e => setQuery(prev => ({ ...prev, generation: e.value }))}
            isDisabled={bikeYear[0].value === '' ? true : false}
          />
        </div>
      </div>
      {isLoading ? 
      <div className={css.loadSpinner}>
        <ClipLoader color='#8a2313'/>
      </div>
       : 
      (query.year && query.generation) ? <div className={css.leversWrapper}>
        {details?.brakeLevers?.length ? 
        <div>
          {/* CONSTRUCTOR */}
          <div className={css.secondSelectArea}>
            <div className={css.headImageWrapper}>
              {topImage ? 
              <img 
                src={topImage} 
                alt='config_img'
                className={topImageError ? css.notFound : css.topImage}
                onError={(e) => {
                  e.currentTarget.src = notFound;
                  setTopImageError(true);
                }}
              />
              :
              <>IMAGE</>}
            </div>
            <div className={css.constructorButtonsWrapper}>
              {/* LEVER COLOR */}
              {details?.clutchLevers?.length > 0 && 
              <div>
                <p>{t('lever')}</p>
                <div className={css.colorBtnsList}>
                {details.clutchLevers.map((l, index) => (
                  <button 
                    key={l._id}
                    onClick={() => setLeverColor(l.color)}
                    className={`${css.colorBtn} ${leverColor === l.color && css.activeColorBtn}`}
                    title={t(l.color)}
                    style={btnColorStyle[l.color]}
                  >
                    {/* {l.color} */}
                  </button>
                ))}
                </div>
              </div>}
              {/* ADJUSTOR COLOR */}
              {details?.adjustor?.length > 0 && 
              <div>
                <p>{t('adjustor')}</p>
                <div className={css.colorBtnsList}>
                {details.adjustor.map((l, index) => (
                  <button 
                    key={l._id}
                    onClick={() => setAdjustorColor(l.color)}
                    className={`${css.colorBtn} ${adjustorColor === l.color && css.activeColorBtn}`}
                    title={t(l.color)}
                    style={btnColorStyle[l.color]}
                  >
                    {/* {l.color} */}
                  </button>
                ))}
                </div>
              </div>}
              {/* TIPS COLOR */}
              {details?.clutchTips?.length > 0 && 
              <div>
                <p>{t('tip')}</p>
                <div className={css.colorBtnsList}>
                {details.clutchTips.map((l, index) => (
                  <button 
                    key={l._id}
                    onClick={() => setTipColor(l.color)}
                    className={`${css.colorBtn} ${tipColor === l.color && css.activeColorBtn}`}
                    title={t(l.color)}
                    style={btnColorStyle[l.color]}
                  >
                    {/* {l.color} */}
                  </button>
                ))}
                </div>
              </div>}
            </div>
          </div>
          {/* PRICE */}
          {details.price && 
          <div className={css.priceWrapper}>
            <p className={css.price}>{Math.round(details.price * 0.85)}грн.</p>
            <p className={css.oldPrice}>{Math.round(details.price)}грн.</p>
            <p className={css.saleCount}>-15%</p>
          </div>}
          {/* ADD ORDER */}
          <button
            className={css.orderButton}
            onClick={() => setContactModal(true)}
          >
            {t('add order')}
          </button>
          {/* DETAILS LIST */}
          {(user?.role && user?.role !== 'guest') && 
          <div className={css.targetDetailsWrapper}>
            <div className={css.targetDetailsColumn}>
              <h3>{t('clutch')}:</h3>
              <div className={css.targetDetailsItem}>
                {details.clutch.map(d => (
                  <div key={d._id} className={css.targetDetailsItem}>
                    <p className={css.detailArticle}>{d.article}</p>
                    {d?.images[0] && <img className={css.detailImage} src={d.images[0]} alt={d.name?.UA} />}
                    <p>{d.name.UA}</p>
                    <p className={css.detailQuantity}>{t('in stock')}: {d.quantityInStock}{t('pcs')}</p>
                  </div>
                ))}
              </div>
              {/* LEVER */}
              <div className={css.targetDetailsItem}>
                <p className={css.detailArticle}>{clutchLeversMap.get(leverColor)?.article || '???'}</p>
                {clutchLeversMap.get(leverColor)?.images[0] && <img className={css.detailImage} src={clutchLeversMap.get(leverColor).images[0]} alt={clutchLeversMap.get(leverColor).name?.UA} />}
                <p>{clutchLeversMap.get(leverColor)?.name?.UA || '???'}</p>
                <p className={css.detailQuantity}>{t('in stock')}: {String(clutchLeversMap.get(leverColor)?.quantityInStock) || '???'}{t('pcs')}</p>
              </div>
              {/* ADJUSTOR */}
              <div className={css.targetDetailsItem}>
                <p className={css.detailArticle}>{adjustorsMap.get(adjustorColor)?.article || '???'}</p>
                {adjustorsMap.get(adjustorColor)?.images[0] && <img className={css.detailImage} src={adjustorsMap.get(adjustorColor).images[0]} alt={adjustorsMap.get(adjustorColor).name?.UA} />}
                <p>{adjustorsMap.get(adjustorColor)?.name?.UA || '???'}</p>
                <p className={css.detailQuantity}>{t('in stock')}: {String(adjustorsMap.get(adjustorColor)?.quantityInStock) || '???'}{t('pcs')}</p>
              </div>
              {/* TIP */}
              {details?.clutchTips?.length > 0 &&
                <div className={css.targetDetailsItem}>
                <p className={css.detailArticle}>{clutchTipsMap.get(tipColor)?.article || '???'}</p>
                {clutchTipsMap.get(tipColor)?.images[0] && <img className={css.detailImage} src={clutchTipsMap.get(tipColor).images[0]} alt={clutchTipsMap.get(tipColor).name?.UA} />}
                <p>{clutchTipsMap.get(tipColor)?.name?.UA || '???'}</p>
                <p className={css.detailQuantity}>{t('in stock')}: {String(clutchTipsMap.get(tipColor)?.quantityInStock) || '???'}{t('pcs')}</p>
              </div>}
            </div>
            <div className={css.targetDetailsColumn}>
              <h3>{t('brake')}:</h3>
              <div className={css.targetDetailsItem}>
                {details.brake.map(d => (
                  <div key={d._id} className={css.targetDetailsItem}>
                    <p className={css.detailArticle}>{d.article}</p>
                    {d?.images[0] && <img className={css.detailImage} src={d.images[0]} alt={d.name?.UA} />}
                    <p>{d.name.UA}</p>
                    <p className={css.detailQuantity}>{t('in stock')}: {d.quantityInStock}{t('pcs')}</p>
                  </div>
                ))}
              </div>
              {/* LEVER */}
              <div className={css.targetDetailsItem}>
                <p className={css.detailArticle}>{brakeLeversMap.get(leverColor)?.article || '???'}</p>
                {brakeLeversMap.get(leverColor)?.images[0] && <img className={css.detailImage} src={brakeLeversMap.get(leverColor).images[0]} alt={brakeLeversMap.get(leverColor).name?.UA} />}
                <p>{brakeLeversMap.get(leverColor)?.name?.UA || '???'}</p>
                <p className={css.detailQuantity}>{t('in stock')}: {String(brakeLeversMap.get(leverColor)?.quantityInStock) || '???'}{t('pcs')}</p>
              </div>
              {/* ADJUSTOR */}
              <div className={css.targetDetailsItem}>
                <p className={css.detailArticle}>{adjustorsMap.get(adjustorColor)?.article || '???'}</p>
                {adjustorsMap.get(adjustorColor)?.images[0] && <img className={css.detailImage} src={adjustorsMap.get(adjustorColor).images[0]} alt={adjustorsMap.get(adjustorColor).name?.UA} />}
                <p>{adjustorsMap.get(adjustorColor)?.name?.UA || '???'}</p>
                <p className={css.detailQuantity}>{t('in stock')}: {String(adjustorsMap.get(adjustorColor)?.quantityInStock) || '???'}{t('pcs')}</p>
              </div>
              {/* TIP */}
              {details?.brakeTips?.length > 0 && 
              <div className={css.targetDetailsItem}>
                <p className={css.detailArticle}>{brakeTipsMap.get(tipColor)?.article || '???'}</p>
                {brakeTipsMap.get(tipColor)?.images[0] && <img className={css.detailImage} src={brakeTipsMap.get(tipColor).images[0]} alt={brakeTipsMap.get(tipColor).name?.UA} />}
                <p>{brakeTipsMap.get(tipColor)?.name?.UA || '???'}</p>
                <p className={css.detailQuantity}>{t('in stock')}: {String(brakeTipsMap.get(tipColor)?.quantityInStock) || '???'}{t('pcs')}</p>
              </div>}
            </div>
          </div>}
        </div>
        :
        <div>{`We don't have "${query.generation}" levers for that model.`}</div>
        }
      </div> 
      : 
      <></>
      }
      <LeversSelection query={query} color={{leverColor, adjustorColor, tipColor}}/>
      <PopUp
        isOpen={contactModal}
        close={() => setContactModal(false)}
        body={
          <div className={css.modalBody}>
            {query?.generation && 
            <div className={css.orderModalHeader}>
              <h3 className={css.orderModalTitle}>{query?.generation}</h3>
              <p className={css.orderModalTitle}>{query.brand} {query.model} {query.year}</p>
            </div>}
            {topImage && 
              <div className={css.topImageWrapper}>
                <img src={topImage} alt={`Levers for ${query?.brand} ${query?.model}`} className={css.topImage}/>
                {details?.price && 
                <div className={css.priceWrapper}>
                  <p className={css.price}>{Math.round(details.price * 0.85)}грн.</p>
                  <p className={css.oldPrice}>{Math.round(details.price)}грн.</p>
                  <p className={css.saleCount}>-15%</p>
                </div>}
              </div>
            }
            <Formik
              initialValues={{
                firstName: '',
                lastName: '',
                phone: '',
                city: '',
                cityRef: '',
                branch: '',
                branchRef: '',
              }}
              validationSchema={OrderSchema}
              onSubmit={async (values) => {await sendOrder(values)}}
            >
              {({ errors, touched }) => (
                <Form className={css.orderForm}>
                  <div className={css.field}>
                    <label htmlFor="firstName" className={css.inputLabel}>{t('name')}</label>
                    <Field id="firstName" name="firstName" className={css.inputField}/>
                    {errors.firstName && touched.firstName ? (
                      <div className={css.modalErrorMessage}>{errors.firstName}</div>
                    ) : null}
                  </div>

                  <div className={css.field}>
                    <label htmlFor="lastName" className={css.inputLabel}>{t('last name')}</label>
                    <Field id="lastName" name="lastName" className={css.inputField}/>
                    {errors.lastName && touched.lastName ? (
                      <div className={css.modalErrorMessage}>{errors.lastName}</div>
                    ) : null}
                  </div>

                  <div className={css.field}>
                    <label htmlFor="phone" className={css.inputLabel}>{t('phone')}</label>
                    <Field
                      id="phone"
                      name="phone"
                      placeholder="063 663 6363"
                      type="tel"
                      className={css.inputField}
                    />
                    {errors.phone && touched.phone ? (
                      <div className={css.modalErrorMessage}>{errors.phone}</div>
                    ) : null}
                  </div>

                  <div>
                    <p>{t('nova poshta')}</p>
                  </div>

                  <div className={css.field}>
                    <label htmlFor="city" className={css.inputLabel}>{t('city')}</label>
                    <Field name="city">
                      {({ field, form }) => (
                        <>
                          <input
                            {...field}
                            id="city"
                            className={css.inputField}
                            onChange={(e) => {
                              field.onChange(e);
                              form.setFieldValue('cityRef', '');
                              form.setFieldValue('branch', '');
                              form.setFieldValue('branchRef', '');

                              if (e.target.value.length >= 3) {
                                getCities(e.target.value);
                              }
                            }}
                          />
                          {errors.cityRef && touched.cityRef ? (
                            <div className={css.modalErrorMessage}>{errors.cityRef}</div>
                          ) : null}
                          {cities.show && 
                          <ul className={css.citiesList}>
                            {cities.array.length < 1 &&
                              <p className={css.citiesItem}>{t('city not found')}</p>}
                            {cities.array.map(c => (
                              <li 
                                key={c.value}
                                className={css.citiesItem}
                                onClick={() => {
                                  form.setFieldValue('city', c.label);
                                  form.setFieldValue('cityRef', c.value);

                                  setCities(prev => ({
                                    ...prev,
                                    show: false,
                                  }));
                                  getBranches(c.value);
                                }}
                              >
                                {c.label}
                              </li>
                            ))}
                          </ul>}
                        </>
                      )}
                    </Field>
                  </div>

                  <div className={css.field}>
                    <label htmlFor="branch" className={css.inputLabel}>{t('branch')}</label>
                    <Field name="branch">
                      {({ field, form }) => (
                        <>
                          <input
                            {...field}
                            id="branch"
                            className={css.inputField}
                            disabled={form.values.cityRef === '' ? true : false}
                            onChange={(e) => {
                              field.onChange(e);

                              if (e.target.value.length >= 1) {
                                getBranches(form.values.cityRef, e.target.value);
                              }
                            }}
                          />
                          {errors.branchRef && touched.branchRef ? (
                            <div className={css.modalErrorMessage}>{errors.branchRef}</div>
                          ) : null}
                          {branches.show && 
                          <ul className={css.citiesList}>
                            {branches.array.length < 1 &&
                              <p className={css.citiesItem}>{t('branch not found')}</p>}
                            {branches.array.map(b => (
                              <li 
                                key={b.value}
                                className={css.citiesItem}
                                onClick={() => {
                                  form.setFieldValue('branch', b.label);
                                  form.setFieldValue('branchRef', b.value);

                                  setBranches(prev => ({
                                    ...prev,
                                    show: false,
                                  }));
                                }}
                              >
                                {b.label}
                              </li>
                            ))}
                          </ul>}
                        </>
                      )}
                    </Field>
                  </div>
                  
                  <button 
                    type="submit"
                    className={css.orderButton}
                  >
                    {!isLoading ? t('add order') : <ClipLoader color='#8a2313' size={20}/>}
                  </button>
                </Form>
              )}
            </Formik>
          </div>
        }
      />
      <PopUp
        isOpen={thanksModal}
        close={() => setThanksModal(false)}
        body={
          <div className={css.thanksModalBody}>
            <h3>{t('thank you')}!</h3>
            {orderId && <p className={css.orderId}>#{orderId}</p>}
            <p>{t('Your request has been received. Our manager will contact you shortly.')}</p>
          </div>
        }
      />
    </>
  );
};
