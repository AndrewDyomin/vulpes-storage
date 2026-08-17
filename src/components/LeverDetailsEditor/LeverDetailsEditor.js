import { useEffect, useState } from 'react';
import css from './LeverDetailsEditor.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import { PopUp } from 'components/PopUp/PopUp';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { searchProduct } from '../../redux/products/operations';
import { selectAllProducts } from '../../redux/products/selectors';
import leverIcon from '../../images/clutch-lever.png';
import CheckIcon from '@mui/icons-material/Check';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import axios from 'axios';
import toast from 'react-hot-toast';

export const LeverDetailsEditor = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allProducts = useSelector(selectAllProducts);
  const [settingsModal, setSettingsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState({
    type: null,
    generations: [],
    clutchBikes: [{ brand: '', model: '', from: null, to: null }],
    brakeBikes: [{ brand: '', model: '', from: null, to: null }],
  });
  const [target, setTarget] = useState(null);
  const [currentBike, setCurrentBike] = useState({
    brand: '',
    model: '',
    from: null,
    to: null,
  });
  const [bikeBrands, setBikeBrands] = useState([{ value: '', label: 'Brand' }]);
  const [bikeModelsArray, setBikeModelsArray] = useState([]);
  const [bikeModels, setBikeModels] = useState([{ value: '', label: 'Model' }]);
  const [bikeYear, setBikeYear] = useState([{ value: '', label: 'Year' }]);

  useEffect(() => {
    async function getBikes() {
      if (bikeModelsArray.length === 0) {
        if (bikeBrands[0].value === '') {
          const res = await axios.get('/products/bikes');
          if (res?.data.length > 0) {
            setBikeBrands([
              ...res?.data.map(b => ({ value: b, label: b.toUpperCase() })),
            ]);
          }
        } else if (currentBike.brand && currentBike.brand !== '') {
          const res = await axios.get(
            `/products/bikes?brand=${currentBike.brand}`
          );
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
      } else if (currentBike?.model && currentBike.model !== '') {
        const targetModel = bikeModelsArray.find(
          m => m.name === currentBike.model
        );
        setBikeYear([...targetModel.years.map(y => ({ value: y, label: y }))]);
      }
    }
    if (settingsModal) {
      setIsLoading(true);
      getBikes();
      setIsLoading(false);
    }
    
  }, [bikeModelsArray, dispatch, bikeBrands, currentBike, settingsModal]);

  const detailTypes = [
    { value: 'adapter', label: t('adapter') },
    { value: 'lever', label: t('lever') },
    { value: 'adjustor', label: t('adjustor') },
    { value: 'tip', label: t('tip') },
  ];
  const detailColors = [
    { value: 'black', label: t('black') },
    { value: 'black mat', label: t('black mat') },
    { value: 'red', label: t('red') },
    { value: 'gold', label: t('gold') },
    { value: 'silver', label: t('silver') },
    { value: 'blue', label: t('blue') },
    { value: 'titanium', label: t('titanium') },
    { value: 'orange', label: t('orange') },
    { value: 'green', label: t('green') },
  ];
  const detailGenerations = [
    {value: 'standart short', label: 'Standart short'},
    {value: 'standart long', label: 'Standart long'},
    {value: 'safety', label: 'Safety'},
    {value: 'vario', label: 'Vario'},
    {value: 'vario safety', label: 'Vario Safety'},
    {value: 'vario lll', label: 'Vario III'},
    {value: 'vx short', label: 'VX short'},
    {value: 'vx long', label: 'VX long'},
    {value: 'vx safety', label: 'VX safety'},
    {value: 'racing', label: 'Racing'}
  ]

  const search = () => {
    if (settings?.article && settings.article !== '') {
      dispatch(searchProduct({ value: settings.article }));
    }
  };

  const sideToggle = side => {
    if (side === 'clutch') {
      setSettings(prev => ({ ...prev, clutch: !prev?.clutch }));
    }
    if (side === 'brake') {
      setSettings(prev => ({ ...prev, brake: !prev?.brake }));
    }
  };

  const addBike = side => {
    const key = `${side}Bikes`;
    setSettings(prev => ({
      ...prev,
      [key]: [
        ...(prev[key] ?? []),
        { brand: '', model: '', from: null, to: null, edit: true },
      ],
    }));
  };

  const saveCurrentBike = (side, index) => {
    const key = `${side}Bikes`;

    setSettings(prev => ({
      ...prev,
      [key]: prev[key].map((bike, i) =>
        i === index ? { ...currentBike, edit: false } : bike
      ),
    }));
  };

  const removeBike = (side, index) => {
    const key = `${side}Bikes`;

    setSettings(prev => ({
      ...prev,
      [key]: prev[key].filter((bike, i) => i !== index),
    }));
  }

  const saveSettings = async() => {
    console.log(settings);
    try {
      const res = await axios.post('/levers/update', settings);
      toast.success(t(res?.data?.message));
      setSettingsModal(false);
      setSettings({
        type: null,
        generations: [],
        clutchBikes: [{ brand: '', model: '', from: null, to: null }],
        brakeBikes: [{ brand: '', model: '', from: null, to: null }],
      });
    } catch(err) {
      toast.error(t('something went wrong'))
    }
  };

  useEffect(() => {
    if (allProducts.products.length && settings?.article !== '') {
      const target = allProducts.products.find(
        p => p.article === settings.article
      );
      if (!target) {
        setTarget({ article: '404' });
      } else {
        setTarget(target);
        setSettings(prev => ({
          type: target.lever.type || prev.type,
          article: target.article,
          color: target.color || '',
          generations: target.lever.generations || [],
          clutchBikes: target.lever.side.clutch || [{ brand: '', model: '', from: null, to: null }],
          brakeBikes: target.lever.side.brake || [{ brand: '', model: '', from: null, to: null }],
          clutch: !!target.lever.side.clutch?.length,
          brake: !!target.lever.side.brake?.length
        }))
      }
    }
  }, [allProducts.products, settings?.article]);

  useEffect(() => {}, [target]);

  return (
    <>
      <button
        onClick={() => setSettingsModal(true)}
        className={css.settingsBtn}
      >
        <SettingsIcon />
      </button>
      <PopUp
        isOpen={settingsModal}
        close={() => setSettingsModal(false)}
        body={
          <div className={css.modalBody}>
            <h3>{t('lever details editor')}</h3>
            <div>
              <Select
                name="detail-type"
                options={detailTypes}
                placeholder={t(settings.type) || 'Select type...'}
                onChange={e => {
                  setSettings({
                    type: e.value,
                    generations: [],
                    clutchBikes: [{ brand: '', model: '', from: null, to: null }],
                    brakeBikes: [{ brand: '', model: '', from: null, to: null }],
                  });
                }}
              />
              {settings?.type && (
                <div>
                  <div className={css.skuWrapper}>
                    <input
                      name="article"
                      placeholder="SKU"
                      className={css.skuInput}
                      onChange={e =>
                        setSettings(prev => ({
                          ...prev,
                          article: e.target.value,
                        }))
                      }
                    />
                    <button className={css.skuBtn} onClick={search}>
                      <SearchIcon fontSize="small" />
                    </button>
                  </div>
                  {target?.article === '404' && <p>Артикул не найден</p>}
                  {target?._id && (
                    <div className={css.detailInfo}>
                      <p>{target.name.UA}</p>
                      <Select
                        name="detail-color"
                        options={detailColors}
                        placeholder={t(settings.color) || 'Select color...'}
                        onChange={e => {
                          setSettings(prev => ({ ...prev, color: e.value }));
                        }}
                      />
                      <div className={css.leverSide}>
                        <div
                          onClick={() => {
                            sideToggle('clutch');
                          }}
                          className={`${css.leverSideChecker} ${settings?.clutch && css.leverSideActive}`}
                        >
                          <img
                            src={leverIcon}
                            alt="clutch lever"
                            className={css.leverIcon}
                          />
                          <p className={css.leverClutchName}>CLUTCH</p>
                          {settings?.clutch && (
                            <CheckIcon
                              className={css.checkIcon}
                              fontSize="large"
                            />
                          )}
                        </div>
                        <div
                          onClick={() => {
                            sideToggle('brake');
                          }}
                          className={`${css.leverSideChecker} ${settings?.brake && css.leverSideActive}`}
                        >
                          <img
                            src={leverIcon}
                            alt="clutch lever"
                            className={`${css.leverIcon} ${css.brakeLever}`}
                          />
                          <p className={css.leverBrakeName}>BRAKE</p>
                          {settings?.brake && (
                            <CheckIcon
                              className={css.checkIcon}
                              fontSize="large"
                            />
                          )}
                        </div>
                      </div>
                      <div className={css.bikesWrapper}>
                        {settings.clutch && settings?.type === 'adapter' && (
                          <ul className={css.bikeList}>
                            <li className={css.bikeListItem}>Clutch bikes:</li>
                            {settings.clutchBikes?.length &&
                              settings.clutchBikes.map((b, index) => (
                                <li key={index} className={css.bikeListItem}>
                                  {b.edit ? (
                                    <div>
                                      <Select
                                        name={`bike-brand-${index}`}
                                        options={bikeBrands}
                                        placeholder={
                                          t(b.brand) || 'Select brand...'
                                        }
                                        onChange={e => {
                                          setCurrentBike({
                                            brand: e.value,
                                            model: '',
                                            from: null,
                                            to: null,
                                          });
                                          setBikeModelsArray([]);
                                        }}
                                      />
                                      <Select
                                        name={`bike-model-${index}`}
                                        options={bikeModels}
                                        placeholder={
                                          t(b.model) || 'Select model...'
                                        }
                                        onChange={e => {
                                          setCurrentBike(prev => ({
                                            brand: prev.brand,
                                            model: e.value,
                                            from: null,
                                            to: null,
                                          }));
                                        }}
                                      />
                                      <div>
                                        from
                                        <Select
                                          name="bike-year-from"
                                          options={bikeYear}
                                          placeholder={
                                            t(b.from) || 'Select year...'
                                          }
                                          onChange={e => {
                                            setCurrentBike(prev => ({
                                              ...prev,
                                              from: e.value,
                                            }));
                                          }}
                                        />
                                        to
                                        <Select
                                          name="bike-year-to"
                                          options={bikeYear}
                                          placeholder={
                                            t(b.to) || 'Select year...'
                                          }
                                          onChange={e => {
                                            setCurrentBike(prev => ({
                                              ...prev,
                                              to: e.value,
                                            }));
                                          }}
                                        />
                                        <button
                                          className={css.bikeSaveBtn}
                                          onClick={() =>
                                            saveCurrentBike('clutch', index)
                                          }
                                        >
                                          <SaveAsOutlinedIcon />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p>{b.brand}</p>
                                      <p>{b.model}</p>
                                      <div>
                                        <p>from {b.from}</p>
                                        <p>to {b.to}</p>
                                      </div>
                                      <button
                                        className={css.bikeDelBtn}
                                        onClick={() =>
                                          removeBike('clutch', index)
                                        }
                                      >
                                        <HighlightOffIcon />
                                      </button>
                                    </div>
                                  )}
                                </li>
                              ))}
                            <li
                              onClick={() => addBike('clutch')}
                              className={`${css.bikeListItem} ${css.addItem}`}
                            >
                              <AddCircleOutlineIcon />
                            </li>
                          </ul>
                        )}
                        {settings.brake && settings?.type === 'adapter' && (
                          <ul className={css.bikeList}>
                            <li className={css.bikeListItem}>Brake bikes:</li>
                            {settings.brakeBikes?.length &&
                              settings.brakeBikes.map((b, index) => (
                                <li key={index} className={css.bikeListItem}>
                                  {b.edit ? (
                                    <div>
                                      <Select
                                        name={`bike-brand-${index}`}
                                        options={bikeBrands}
                                        placeholder={
                                          t(b.brand) || 'Select brand...'
                                        }
                                        onChange={e => {
                                          setCurrentBike({
                                            brand: e.value,
                                            model: '',
                                            from: null,
                                            to: null,
                                          });
                                          setBikeModelsArray([]);
                                        }}
                                      />
                                      <Select
                                        name={`bike-model-${index}`}
                                        options={bikeModels}
                                        placeholder={
                                          t(b.model) || 'Select model...'
                                        }
                                        onChange={e => {
                                          setCurrentBike(prev => ({
                                            brand: prev.brand,
                                            model: e.value,
                                            from: null,
                                            to: null,
                                          }));
                                        }}
                                      />
                                      <div>
                                        from
                                        <Select
                                          name="bike-year-from"
                                          options={bikeYear}
                                          placeholder={
                                            t(b.from) || 'Select year...'
                                          }
                                          onChange={e => {
                                            setCurrentBike(prev => ({
                                              ...prev,
                                              from: e.value,
                                            }));
                                          }}
                                        />
                                        to
                                        <Select
                                          name="bike-year-to"
                                          options={bikeYear}
                                          placeholder={
                                            t(b.to) || 'Select year...'
                                          }
                                          onChange={e => {
                                            setCurrentBike(prev => ({
                                              ...prev,
                                              to: e.value,
                                            }));
                                          }}
                                        />
                                        <button
                                          className={css.bikeSaveBtn}
                                          onClick={() =>
                                            saveCurrentBike('brake', index)
                                          }
                                        >
                                          <SaveAsOutlinedIcon />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <p>{b.brand}</p>
                                      <p>{b.model}</p>
                                      <div>
                                        <p>from {b.from}</p>
                                        <p>to {b.to}</p>
                                      </div>
                                      <button
                                        className={css.bikeDelBtn}
                                        onClick={() =>
                                          removeBike('brake', index)
                                        }
                                      >
                                        <HighlightOffIcon />
                                      </button>
                                    </div>
                                  )}
                                </li>
                              ))}
                            <li
                              onClick={() => addBike('brake')}
                              className={`${css.bikeListItem} ${css.addItem}`}
                            >
                              <AddCircleOutlineIcon />
                            </li>
                          </ul>
                        )}
                      </div>
                      {settings?.type !== '' && settings?.type !== 'adapter' && (
                        <div>
                          {settings?.generations?.length && (
                            <ul>
                              {settings.generations.map((gen, i) => (
                                <li key={gen + i}>
                                  {gen}
                                </li>
                              ))}
                            </ul>
                          )}
                          <Select
                            name="detail-generation"
                            options={detailGenerations}
                            placeholder='Select generation...'
                            onChange={e => {if (!settings?.generations.includes(e.value)) {
                              setSettings(prev => ({ ...prev, generations: [ ...(prev.generations || []), e.value] }));
                            }}}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <button
              className={css.modalOkButton}
              onClick={saveSettings}
              disabled={isLoading}
            >
              {isLoading ? t('saving') : t('save')}
            </button>
          </div>
        }
      />
    </>
  );
};
