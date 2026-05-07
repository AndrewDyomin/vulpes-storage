import { useState } from 'react';
import css from './Marketplaces.module.css';
import axios from 'axios';
import TurnSlightLeftIcon from '@mui/icons-material/TurnSlightLeft';
import TurnSlightRightIcon from '@mui/icons-material/TurnSlightRight';
import { ClipLoader } from 'react-spinners';
import toast from 'react-hot-toast';

const Horoshop = () => {
  const [updateList, setUpdateList] = useState([]);
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

  return (
    <div className={css.marketBody}>
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
    </div>
  );
};
const Zakupka = () => {
  return (
    <div className={css.marketBody}>
      zakupka
    </div>
  );
};
const Prom = () => {
  return (
    <div className={css.marketBody}>
      prom
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
