import { useEffect, useRef, useState } from 'react';
import css from './Marketplaces.module.css';
import axios from 'axios';
import TurnSlightLeftIcon from '@mui/icons-material/TurnSlightLeft';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import { ClipLoader, ClockLoader } from 'react-spinners';
import UpdateIcon from '@mui/icons-material/Update';
import toast from 'react-hot-toast';
import Select from 'react-select';
import { useTranslation } from 'react-i18next';
// import BackupTableOutlinedIcon from '@mui/icons-material/BackupTableOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SettingsIcon from '@mui/icons-material/Settings';
import ImageIcon from '@mui/icons-material/Image';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PopUp } from 'components/PopUp/PopUp';
import { useGoogleLogin } from '@react-oauth/google';

export function useGoogleReauth() {
  const promiseRef = useRef(null);

  const login = useGoogleLogin({
    flow: 'auth-code',
    scope: 'https://www.googleapis.com/auth/drive',

    onSuccess: async ({ code }) => {
      try {
        await axios.post('/marketplaces/refresh-google-oauth-token', { code });

        promiseRef.current?.resolve();
      } catch (err) {
        promiseRef.current?.reject(err);
      } finally {
        promiseRef.current = null;
      }
    },

    onError: (err) => {
      promiseRef.current?.reject(err);
      promiseRef.current = null;
    },
  });

  return () => {
    if (promiseRef.current) {
      return Promise.reject(new Error('Google auth already in progress'));
    }

    return new Promise((resolve, reject) => {
      promiseRef.current = { resolve, reject };
      login();
    });
  };
}

const Horoshop = ({ market, setMarkets }) => {
  const { t } = useTranslation();
  const [updateList, setUpdateList] = useState([]);
  const [outdatedList, setOutdatedList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [settings, setSettings] = useState({ ...market });
  const [reauthModal, setReauthModal] = useState(false);

  const updatePriceHandler = async() => {
    setIsLoading(true);
    const { data } = await axios.get('/marketplaces/horoshop-check-update-price');
    setUpdateList(data);
    setIsLoading(false);
  }

  const changePriceHandler = async() => {
    setIsLoading(true);
    const { data } = await axios.get('/marketplaces/horoshop-update-price');
    if (data?.message) {
      toast.success(data.message)
    }
    setIsLoading(false);
  }
  const googleReauth = useGoogleReauth();

  const googleDriveReauth = async() => {
    await googleReauth();
    setReauthModal(false);
    return showOutdatedProductsHandler();
  };

  const showOutdatedProductsHandler = async() => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/marketplaces/horoshop-check-outdated-products');
      if (data?.length > 0) {
        setOutdatedList(data);
      } else if (data?.error === 'invalid_grant') {
        toast.error(t(data?.error));
        setReauthModal(true);
      } else {
        toast.success(t('outdated products not found'));
      }
    } catch(err) {
      toast.error(t('Error. Please, try again later.'));
    }
    setIsLoading(false);
  }

  const refreshOutdatedProductsHandler = async() => {
    setIsLoading(true);
    try {
      const res = await axios.post('/marketplaces/horoshop-refresh-outdated-products', [ ...outdatedList.map(i => i.article) ]);
      if (res?.data?.message) {
        toast.success(t(res?.data?.message));
      } else if (res.data?.error === 'invalid_grant') {
        toast.error(t(res.data?.error));
        await googleReauth();
        return refreshOutdatedProductsHandler();
      } else if (res?.data?.error) {
        toast.error(t(res.data.error));
      } else if (res?.data?.length > 0) {
        setOutdatedList(res.data);
      } else {
        toast.success(t('outdated products not found'));
      }
    } catch(err) {
      toast.error(t(err));
    }
    setIsLoading(false);
  }

  const copyToClipboard = async (text) => {
    await navigator.clipboard.writeText(String(text));
    toast.success(t('sku copied'));
  };

  const closeModal = () => {
    setSettingsModal(false);
  }

  const saveSettings = async() => {
    setIsLoading(true);
    await axios.post("/marketplaces/update-marketplace", settings);
    closeModal();
    toast.success('Changes saved');
    setIsLoading(false);
    setMarkets([]);
  }

  return (
    <div className={css.marketBody}>
      <button
        onClick={()=>setSettingsModal(true)}
        className={css.settingsBtn}
      >
        <SettingsIcon />
      </button>
      {/* ----PRICE---- */}
      <div>
        <h3>{t('price')}:</h3>
        <div className={css.markup}>
          <label className={css.markupLabel}>{t('markup')}
            <input className={css.markupInput} type='number' step={0.1} placeholder='0' value={settings?.markup} onChange={(e) => setSettings(prev => ({ ...prev, markup: Math.round(Number(e.target.value) * 100) / 100 }))}/>
          </label>
          <p>{`( 100грн = ${(100 * Number(settings?.markup)).toFixed(2)}грн )`}</p>
          {(market?.markup !== settings?.markup) && 
            <button className={css.saveBtn} onClick={saveSettings}>
              <SaveAsOutlinedIcon />
            </button>
          }
        </div>
        {updateList.length === 0 &&
          <button
            className={css.button}
            onClick={()=> updatePriceHandler()}
            disabled={isLoading}
          >
            {isLoading ? <ClipLoader color="#c04545" size="20px" className={css.loader}/> :
              t('update price')
            }
          </button>
        }
        {updateList.length > 0 &&
        <div>
          <ul className={css.previewList}>
            {updateList.map((item, index) => (
              <li key={item.article} className={`${css.previewItem} ${index % 2 === 0 && css.secondItem}`}>
                <p>{`${item.name.UA} (${item.article})`}</p>
                <div className={css.priceArea}>
                  <p>{item.price.UAH}</p>
                  {item.price.UAH < item.moteaPrice.UAH ? 
                  <TurnSlightLeftIcon className={`${css.priceArrow} ${css.up}`}/> :
                  <TurnSlightRightIcon className={`${css.priceArrow} ${css.down}`}/>
                  }
                  <p>{item.moteaPrice.UAH}</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            className={css.button}
            onClick={()=> changePriceHandler()}
            disabled={isLoading}
          >
            {isLoading ? <ClipLoader color="#c04545" size="20px" className={css.loader}/> :
              t('change price')
            }
          </button>
        </div>
        }
      </div>
      {/* ----CATALOG---- */}
      <div>
        <h3>{t('catalog')}:</h3>
        {!outdatedList && 
        <button
          className={css.button}
          onClick={()=> showOutdatedProductsHandler()}
          disabled={isLoading}
        >
          {isLoading ? <ClipLoader color="#c04545" size="20px" className={css.loader}/> :
            t('show outdated products')
          }
        </button>}
        {outdatedList && outdatedList.length > 0 && 
          <>
            <ul className={css.outdatedList}>
              {outdatedList.map(product => (
                <li key={product._id} className={css.outdatedItem} onClick={() => copyToClipboard(product.article)}>
                  <img className={css.itemImage} alt={product.name.UA} src={product?.images[0]}/>
                  <p>{t('in stock')} - {product.quantityInStock}</p>
                  <p>{Math.round(product.dateDifference / 24 / 60 / 60 / 1000)} {t('days')}</p>
                  <p className={css.itemArticle}>{product.article}</p>
                  {product?.imagesDrive?.uploaded && 
                    (product?.imagesDrive?.folderId ? 
                    <a className={css.imageOk} href={`https://drive.google.com/drive/folders/${product?.imagesDrive?.folderId}`}>
                      <ImageIcon fontSize="small" sx={{ color: '#fff' }}/>
                    </a> : 
                    <span className={css.imageOk}>
                      <ImageIcon fontSize="small" sx={{ color: '#fff' }}/>
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <button
              className={css.button}
              onClick={()=> refreshOutdatedProductsHandler()}
              disabled={isLoading}
            >
              {isLoading ? <ClipLoader color="#c04545" size="20px" className={css.loader}/> :
                'refresh'
              }
            </button>
          </>
        }
      </div>

      <PopUp
        isOpen={settingsModal}
        close={closeModal}
        body={
          <div className={css.modalBody}>
            <input 
              className={css.addModalInput}
              placeholder='marketplace'
              value={settings?.name}
              onChange={e => setSettings(prev => ({ ...prev, name: e.target.value}))}
            />
            <input 
              className={css.addModalInput}
              placeholder='logo'
              value={settings?.logo}
              onChange={e => setSettings(prev => ({ ...prev, logo: e.target.value}))}
            />
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
      <PopUp
        isOpen={reauthModal}
        close={() => setReauthModal(false)}
        body={
          <div className={css.modalBody}>
            <h2>{t('refresh google drive authorization')}?</h2>
            <button 
              className={css.modalOkButton} 
              onClick={googleDriveReauth}
              disabled={isLoading}
            >
              {isLoading ? t('pending') : t('ok')}
            </button>
          </div>
        }
      />
    </div>
  );
};
const Zakupka = ({ market }) => {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  const updateZakupkaXmlHandler = async () => {
    setIsPending(true);
    try {
      await axios.get('/files/update-zakupka');
      toast.success('XML file to Zakupka.com updated.')
      
    } catch (err) {
      toast.error('Error! Please try again later...');
    }
    
    setIsPending(false);
  }

  return (
    <div className={css.marketBody}>
      <div className={css.button} onClick={updateZakupkaXmlHandler}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <UpdateIcon />
              <p>{t('update zakupka xml')}</p>
            </>
          )}
        </div>
    </div>
  );
};
const Prom = ({ market, setMarkets }) => {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [settings, setSettings] = useState({ ...market });
  const [shouldSave, setShouldSave] = useState(false);
  const [categories, setCategories] = useState({ our: [], promGroups: [], promCategories: [] });

  const promGroupOptions = categories?.promGroups.map(g => ({
    value: g.id,
    label: g.name,
  })) || [];

  const promCategoriesOptions = categories?.promCategories.map(g => ({
    value: g.id,
    label: g.name,
  })) || [];

  const updatePromTableHandler = async () => {
    setIsPending(true);
    toast.success("Это может занять несколько минут");
    await axios
      .post('/products/update-prom-base')
      .then(response => toast.success(t(response.data.message)))
      .catch(response => toast.error(t(response.data.message)));
    setIsPending(false);
  }

  const closeModal = () => {
    setSettingsModal(false);
  }

  const regenXml = async() => {
    const res = await axios.get("/marketplaces/generate-xml-for-marketplaces");
    if (!res.status === 200) throw new Error('Fail');
    return;
  }

  const updateCategory = async(category) => {
    const res = await axios.post("/products/update-category", { ...category, prom: true })
    .then(e => {
      console.log(e);
      setCategories(prev => ({ ...prev, our: prev.our.map(c => c.id === category.id ? category : c) }))
    })
    .catch(() => toast.error(t('something went wrong')));
  }

  // IF SETTINGS WAS CHANGED -> SAVE IT
  useEffect(() => {
    if (JSON.stringify(market) !== JSON.stringify(settings)) {
      setShouldSave(true)
    } else {
      setShouldSave(false)
    };
  }, [market, settings]);

  const saveSettings = async() => {
    setIsPending(true);
    await axios.post("/marketplaces/update-marketplace", settings);
    closeModal();
    toast.success('Changes saved');
    setIsPending(false);
    setMarkets([]);
  }

  useEffect(() => {
    async function getCategories() {
      const res = await axios.get("/marketplaces/prom-categories");
      if (res?.data?.promCategories?.length) {
        setCategories(res.data)
      }
    }
    if (!categories?.promGroups?.length) {
      getCategories();
    }
  }, [categories]);

  return (
    <div className={css.marketBody}>
      <button
        onClick={()=>setSettingsModal(true)}
        className={css.settingsBtn}
      >
        <SettingsIcon />
      </button>
      {/* ----PRICE---- */}
      <div>
        <h3>{t('price')}:</h3>
        <div className={css.markup}>
          <label className={css.markupLabel}>{t('markup')}
            <input 
              className={css.markupInput} 
              type='number' step={0.1} 
              placeholder='0' 
              value={settings?.markup} 
              onChange={(e) => setSettings(prev => ({ ...prev, markup: Math.round(Number(e.target.value) * 100) / 100 }))}
            />
          </label>
          <p>{`( 100грн = ${(100 * Number(settings?.markup)).toFixed(2)}грн )`}</p>
          {(market?.markup !== settings?.markup) && 
            <button className={css.saveBtn} onClick={saveSettings}>
              <SaveAsOutlinedIcon />
            </button>
          }
        </div>
      </div>
      {/* ----CATALOG---- */}
      <div>
        <h3>{t('catalog')}:</h3>
        <p>Варианты импорта:</p>
        <div className={css.importVariant}>
          <label className={css.marketLabel}>
            {t('google sheets')}
            <input className={`${css.marketInput} ${css.disabledInput}`} disabled={true} value={'https://docs.google.com/spreadsheets/d/1fmGFTYbCZWn0I3K1-5BWd6nrTImytpyvRhW0Ufz53cw/edit?usp=sharing'} onChange={()=>{}}/>
          </label>
          <button className={css.button} onClick={updatePromTableHandler}>
            {isPending ? (
              <ClockLoader color="#c04545" />
            ) : (
              <>
                {/* <BackupTableOutlinedIcon /> */}
                <p>{t('update prom table')}</p>
              </>
            )}
          </button>
        </div>
        
        <p>Или</p>
        <div className={css.importVariant}>
          <label className={css.marketLabel}>
            {t('XML')}
            <input className={`${css.marketInput} ${css.disabledInput}`} disabled={true} value={`${process.env.REACT_APP_SERVER_URL}${settings?.xml.path}`}/>
          </label>
          <label className={css.marketLabel}>
            {t('back feed')+'*'}
            <input 
              className={`${css.marketInput} ${settings?.xml.generate ? '' : css.disabledInput}`} 
              disabled={!settings?.xml.generate} 
              value={settings?.xml?.backFeed} 
              onChange={(e) => setSettings(prev => ({ ...prev, xml: { ...prev.xml, backFeed: e.target.value } }))}
            />
          </label>
          <div>
            <button onClick={() => setSettings(prev => ({ ...prev, xml: { ...prev.xml, generate: !prev.xml.generate } }))} className={css.toggleBtn} >
              <span className={`${css.toggleBullet} ${settings?.xml.generate ? css.activeBullet : ''}`}/>
            </button>
            <button title={t('refresh')} className={css.refreshBtn} onClick={() => {toast.promise(
              regenXml(),
              {
                loading: 'Pending...',
                success: <b>Generate started!</b>,
                error: <b>Could not generate.</b>,
              }
            );}}>
              <RefreshIcon />
            </button>
          </div>
          {shouldSave && 
            <button className={css.saveBtn} onClick={saveSettings}>
              <SaveAsOutlinedIcon />
            </button>
          }
        </div>
      </div>
      {/* ----CATEGORIES---- */}
      <div>
        <h3>{t('categories')}:</h3>
          {categories?.our?.length > 0 ? 
          <ul className={css.categoriesList}>
            <li key={'1'} className={css.categoriesItem}>
              <p className={css.categoriesHead}>{t('category')}</p>
              <p className={css.categoriesHead}>{t('prom goup')}</p>
              <p className={css.categoriesHead}>{t('prom category')}</p>
            </li>
            {categories.our.map(c => (
              <li key={c.id} className={css.categoriesItem}>
                <p>{c.name}</p>
                <Select 
                  name='group' 
                  onChange={(e) => updateCategory({ ...c, promGroup: e.value })}
                  // placeholder={'---'}
                  defaultValue={promGroupOptions.find(g => g.value === c.promGroup) || {value: '---', label: '---'}}
                  options={promGroupOptions}
                />
                <Select 
                  name='category' 
                  onChange={(e) => updateCategory({ ...c, promCategory: e.value })}
                  // placeholder={'---'}
                  defaultValue={promCategoriesOptions.find(g => g.value === c.promCategory) || {value: '---', label: '---'}}
                  options={promCategoriesOptions}
                />
              </li>
            ))}
          </ul>
          : 
          <p>Loading...</p>}
      </div>
      <PopUp
        isOpen={settingsModal}
        close={closeModal}
        body={
          <div className={css.modalBody}>
            <input 
              className={css.addModalInput}
              placeholder='marketplace'
              value={settings?.name}
              onChange={e => setSettings(prev => ({ ...prev, name: e.target.value}))}
            />
            <input 
              className={css.addModalInput}
              placeholder='logo'
              value={settings?.logo}
              onChange={e => setSettings(prev => ({ ...prev, logo: e.target.value}))}
            />
            <button 
              className={css.modalOkButton} 
              onClick={saveSettings}
              disabled={isPending}
            >
              {isPending ? t('saving') : t('save')}
            </button>
          </div>
        }
      />
    </div>
  );
};
const Custom = ({ market, setMarkets }) => {
  console.log(market)
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  return (
    <div className={css.marketBody}>
      {isPending ? (
        <ClockLoader color="#c04545" />
      ) : (
        <>
          EMPTY
        </>
      )}
    </div>
  );
};

export const Marketplaces = () => {
  const [markets, setMarkets] = useState([]);
  const [activeMarket, setActiveMarket] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [pending, setPending] = useState(false);

  const { t } = useTranslation();
  const market = [{ component: Horoshop, name: 'ХОРОШОП' }, { component: Zakupka, name: 'Zakupka'}, { component: Prom, name: 'Prom' }];
  const ActiveComponent = market.find(m => m.name === activeMarket)?.component || Custom;
  const targetMarket = markets.find(m => m.name === activeMarket) || null;

  const closeModal = () => {
    setAddModal(false);
  }

  const addMarketplace = async() => {
    if (addName === '') return;
    setPending(true);
    const res = await axios.post('/marketplaces/add', { name: addName });
    toast.success(res?.data?.message);
    setPending(false);
    setAddName('');
    setAddModal(false);
    setMarkets([])
  }

  useEffect(() => {
    async function getallMarketplaces() {
      try {
        const res = await axios.get('/marketplaces/all');
        setMarkets(res.data)
      } catch(err) {
        console.log(err)
        toast.error('Something went wrong')
      }
    }

    if (!markets?.length) {
      getallMarketplaces();
    }
  }, [markets])

  return (
    <div>
      <ul className={css.marketList}>
        {markets.map((market, index) => (
          <li
            key={market.name}
            className={`${css.marketItem} ${market.name === activeMarket && css.active}`}
            onClick={() => setActiveMarket(market.name)}
          >
            {market?.logo ? (
              <img
                src={market.logo}
                alt={market.name}
                className={css.marketImage}
              />
            ) : (
              <p className={css.marketName}>{market.name}</p>
            )}
          </li>
        ))}
        <li 
          key={'add-item'} 
          className={css.marketItem}
          onClick={() => setAddModal(true)}
        >
          <AddCircleOutlineIcon fontSize='large'/>
        </li>
      </ul>
      {activeMarket !== null && <ActiveComponent market={targetMarket} setMarkets={setMarkets}/>}
      <PopUp
        isOpen={addModal}
        close={closeModal}
        body={
          <div className={css.modalBody}>
            <input 
              className={css.addModalInput}
              placeholder='marketplace'
              value={addName}
              onChange={e => setAddName(e.target.value)}
            />
            <button 
              className={css.modalOkButton} 
              onClick={addMarketplace}
              disabled={pending}
            >
              {pending ? t('saving') : t('save')}
            </button>
          </div>
        }
      />
    </div>
  );
};
