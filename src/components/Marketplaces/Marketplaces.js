import { useState } from 'react';
import css from './Marketplaces.module.css';
import axios from 'axios';
import TurnSlightLeftIcon from '@mui/icons-material/TurnSlightLeft';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import { ClipLoader, ClockLoader } from 'react-spinners';
import UpdateIcon from '@mui/icons-material/Update';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import BackupTableOutlinedIcon from '@mui/icons-material/BackupTableOutlined';
import ImageIcon from '@mui/icons-material/Image';

const Horoshop = () => {
  const { t } = useTranslation();
  const [updateList, setUpdateList] = useState([]);
  const [outdatedList, setOutdatedList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const showOutdatedProductsHandler = async() => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('/marketplaces/horoshop-check-outdated-products');
      if (data?.length > 0) {
        setOutdatedList(data);
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

  return (
    <div className={css.marketBody}>
      <div className={css.firstStage}>
        {updateList.length === 0 &&
          <button
            className={css.button}
            onClick={()=> updatePriceHandler()}
            disabled={isLoading}
          >
            {isLoading ? <ClipLoader color="#c04545" size="20px" className={css.loader}/> :
              'update price'
            }
          </button>
        }
        <button
          className={css.button}
          onClick={()=> showOutdatedProductsHandler()}
          disabled={isLoading}
        >
          {isLoading ? <ClipLoader color="#c04545" size="20px" className={css.loader}/> :
            'show outdated products'
          }
        </button>
      </div>
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
            'change price'
          }
        </button>
      </div>
      }
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
  );
};
const Zakupka = () => {

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
const Prom = () => {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);

  const updatePromTableHandler = async () => {
    setIsPending(true);
    toast.success("Это может занять несколько минут");
    await axios
      .post('/products/update-prom-base')
      .then(response => toast.success(t(response.data.message)))
      .catch(response => toast.error(t(response.data.message)));
    setIsPending(false);
  }

  return (
    <div className={css.marketBody}>
      <div className={css.button} onClick={updatePromTableHandler}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <BackupTableOutlinedIcon />
              <p>{t('update prom table')}</p>
            </>
          )}
        </div>
    </div>
  );
};

export const Marketplaces = () => {
  const markets = [
    { name: 'ХОРОШОП' },
    {
      name: 'Закупка',
      logo: 'https://zakupka.com/pics/logo/svg2/original/zakupka.svg',
    },
    {
      name: 'Пром',
      logo: 'https://prom.ua/cloud-cgi/static/catalog-ui/js/build/portal-portable/logo_prom-e4b8f7f3.svg',
    },
  ];

  const [activeMarket, setActiveMarket] = useState(null);

  const market = [Horoshop, Zakupka, Prom];
  const ActiveComponent = market[activeMarket];

  return (
    <div>
      <ul className={css.marketList}>
        {markets.map((market, index) => (
          <li
            key={market.name}
            className={`${css.marketItem} ${index === activeMarket && css.active}`}
            onClick={() => setActiveMarket(index)}
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
      </ul>
      {activeMarket !== null && <ActiveComponent />}
    </div>
  );
};
