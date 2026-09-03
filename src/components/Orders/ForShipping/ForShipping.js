import css from './ForShipping.module.css';
import { ClockLoader } from 'react-spinners';
// import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { fetchOrdersByFilter } from '../../../redux/orders/operations';
import { selectAllOrders, selectIsLoading } from '../../../redux/orders/selectors';
import { selectProductsBarcodes } from '../../../redux/products/selectors';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { PopUp } from '../../PopUp/PopUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import toast from 'react-hot-toast';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const ListOfProducts = ({ products }) => {
  const [resolvedProducts, setResolvedProducts] = useState([]);

  useEffect(() => {
    const fetchSetItems = async () => {
      const result = [];

      for (const product of products) {
        try {
          const { sku, amount } = product;
          const res = await axios.post('/products/byarticle', { article: sku });
          const dbProduct = res.data.product;

          if (dbProduct?.isSet?.length > 0 && dbProduct?.isSet[0] !== null) {
            for (const setItem of dbProduct.isSet) {
              result.push({ sku: setItem.sku, amount: Number(setItem.count)*Number(amount) }); 
            }
          } else {
            result.push({sku, amount});
          }
        } catch (err) {
          console.error('Ошибка при получении продукта:', err.message);
          result.push(product.sku);
        }
      }

      setResolvedProducts(result);
    };

    fetchSetItems();
  }, [products]);

  return (
    <ul className={css.productsList}>
      {resolvedProducts.map((sku, index) => (
        <li key={`${sku}-${index}`}>
          <p>{sku.sku} - {sku.amount}шт.;</p>
        </li>
      ))}
    </ul>
  );
};

export const ForShipping = () => {
  const ordersFilter = 'for-shipping';
  const isLoading = useSelector(selectIsLoading);
  const allOrders = useSelector(selectAllOrders);
  const allBarcodes = useSelector(selectProductsBarcodes);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const beepRef = useRef(null);
  const [firstMounting, setFirstMounting] = useState(true);
  const [activeOrder, setActiveOrder] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [prepareMode, setPrepareMode] = useState(false);
  const [prepareList, setPrepareList] = useState([]);
  const [doneModal, setDoneModal] = useState(false);

  // ADD BEEP SOUND
  useEffect(() => {
    beepRef.current = new Audio('/vulpes-storage/beep.m4a');
    beepRef.current.preload = 'auto';

    return () => {
      beepRef.current?.pause();
      beepRef.current = null;
    };
  }, []);
  
  const playBeep = async count => {
    const audio = beepRef.current;

    if (!audio) return;

    for (let i = 0; i < count; i++) {
      try {
        audio.currentTime = 0;
        await audio.play();
        await sleep(350);
      } catch (error) {
        console.error('Beep error:', error);
        break;
      }
    }
  };

  useEffect(() => {
    if (firstMounting) {
      dispatch(fetchOrdersByFilter(ordersFilter))
      setFirstMounting(false);
    }
  }, [dispatch, firstMounting])

  useEffect(() => {
    async function getShelves() {
      const arr = [];
      for (const order of allOrders) {
        for (const product of order.products) {
          if (product?.isComplect) {
            product.complect.map(p => arr.push({ article: p.sku, count: p.count }))
          } else {
            order.products.map(p => arr.push({ article: p.sku, count: p.amount }))
          }
        }
      }
      const res = await axios.post("/shelves/get-by-array", arr);
      setPrepareList(res.data);
    }

    if (prepareMode && allOrders?.length) {
      getShelves();
    }
  }, [prepareMode, allOrders])

  useEffect(() => {
    for (const item of prepareList) {
      if (item?.count === item?.inCart && !item?.done) {
        setPrepareList(prev => ([
          ...prev.map(i => i.article === item.article ? { ...i, done: true, error: false } : i)
        ]))
      } else if (item?.count < item?.inCart && item?.done) {
        setPrepareList(prev => ([
          ...prev.map(i => i.article === item.article ? { ...i, done: false, error: true } : i)
        ]))
      } 
    }

    if (prepareList?.length && prepareList.every(i => i?.done === true)) {
      setDoneModal(true);
    } else {
      setDoneModal(false);
    }
  }, [prepareList])

  // SCANNETR LISTENER
  useEffect(() => {
    let buffer = '';

    const handleKeyDown = async e => {
      if (
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'Enter') {
        if (!buffer) return;

        const barcode = buffer;
        buffer = '';

        try {
          const product = allBarcodes.map[barcode];

          if (!product) {
            throw new Error();
          }
          
          setPrepareList(prev => ([
            ...prev.map(i => i.article === product.article ? { ...i, inCart: i?.inCart + 1 || 1 } : i)
          ]))

          await playBeep(1);
        } catch (error) {
          await playBeep(3);
          toast.error(t('product not found'));
        }

        return;
      }

      // Добавляем символы штрихкода
      if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [dispatch, t, allBarcodes]);

  const openOrder = (order) => {
    setActiveOrder(order)
    setOrderModal(true)
  }

  const closeModal = () => {
    setOrderModal(false);
    setActiveOrder(null)
  }

  const toggleDone = (article) => {
    setPrepareList(prev => ([ 
      ...prev.map(i => 
        i.article === article ? { ...i, done: !i?.done } : i
      ) 
    ]));
  }

  console.log({"info":{"webhookType":"order","webhookEvent":"status_change","account":"vulpes"},"data":{"id":6512,"formId":1,"version":11,"ord_delivery_data":[{"areaName":"Київська","regionName":"Бориспільський","cityType":"с.","payer":"Recipient","hasPostpay":1,"postpaySum":6224,"trackingNumberRef":null,"provider":"novaposhta","senderId":3,"type":"WarehouseWarehouse","trackingNumber":"","parentTrackingNumber":null,"cityName":"Щасливе","statusCode":null,"deliveryDateAndTime":null,"isPrinted":0,"shipping_costs":null,"cityRef":"3425bc36-adb8-11e3-9fa0-0050568002cf","settlementRef":"e720685d-4b33-11e4-ab6d-005056801329","branchRef":"9678fe37-abc8-11e6-b5da-005056887b8d","branchNumber":2,"address":"відділення №2","paymentMethod":"Cash","postpayPayer":"Recipient","cargoType":"Parcel","addedToRegister":0}],"contacts":[{"id":5143,"formId":1,"version":1,"active":1,"lName":"Дёмин","fName":"Андрей","mName":null,"phone":["380636886684"],"email":["demin.andrew@icloud.com"],"company":null,"telegram":null,"createTime":"2026-06-26 15:30:34","comment":"","userId":1,"leadsCount":2,"leadsSalesCount":1,"leadsSalesAmount":58,"clientRating":null,"instagramNick":null,"dateOfBirth":null,"yearOfBirth":null,"isPhoneHide":0,"isEmailHide":0}],"externalId":"","sajt":64,"utmPage":"","nePeredzvonuvati_2":null,"utmMedium":"","campaignId":null,"utmSourceFull":"","utmSource":"","utmCampaign":"","utmContent":"","utmTerm":"","orderStock":null,"arlik":"","organizationId":3,"products":[{"amount":1,"productId":46124,"stockId":1,"price":6224,"discount":0,"percentDiscount":0,"commission":0,"percentCommission":0,"description":"","mass":0,"volume":0,"length":0,"width":0,"height":0,"restCount":-1,"manufacturer":"V-Trec","sku":"118506","isComplect":1,"upsell":0,"barcode":"4251147930958","parameter":"118506","documentName":"Важель гальма та важіль зчеплення (118506)","uktzed":null,"active":1,"text":"Важель гальма та важіль зчеплення Vario 3 для Yamaha MT-07 13-25 з ABE складаються та регулюються по довжині.","complect":[{"productId":70146,"count":1,"parameter":"200021","sku":"200021","barcode":"","name":"Гальмівний адаптер AE531 чорний"},{"productId":70081,"count":1,"parameter":"200036","sku":"200036","barcode":"","name":"Адаптер зчеплення as631=as641 чорний"},{"productId":70038,"count":1,"parameter":"385540","sku":"385540","barcode":"","name":"Наконечник гальмівний Vario 3, червоний"},{"productId":70036,"count":1,"parameter":"385543","sku":"385543","barcode":"","name":"Наконечник зчеплення Vario 3 червоний"},{"productId":69874,"count":1,"parameter":"343280","sku":"343280","barcode":"","name":"Гальмівний важіль V-Trec Vario 3 чорний"},{"productId":69752,"count":1,"parameter":"200005","sku":"200005","barcode":"","name":"Регулятор V-Trec червоний"},{"productId":69215,"count":1,"parameter":"343279","sku":"343279","barcode":"","name":"Важіль зчеплення V-Trec Vario 3 чорний"}],"photo":"https://vulpes.com.ua/content/images/40/85773019381941_+0237a653ae.jpeg","costPriceCurrencyId":null,"note":"","href":"https://vulpes.com.ua/rychag-tormoza-i-rychag-stsepleniya-vario-3-yamaha-mt-07-13-21-v-trec-skladnoy-i-reguliruemyy-po-dline/","exciseBarcodes":null,"name":"Важель гальма та важіль зчеплення Vario 3 для Yamaha MT-07 13-25 з ABE складаються та регулюються по довжині.","categoryId":737,"categoryName":"Регульовані по довжині - Vario 3"}],"shipping_method":65,"payment_method":57,"adresDostavki":"село Счастливое (Бориспольский р-н), Отделение №2 (до 30 кг): ул. Героев Майдана, 11, пом. 64","comment":"Важелі vario lll для bmw r ninet 2019року.\n      \n Адаптер зчеплення: 304175 - 1шт; \n      \n Адаптер гальма: 304176 - 1шт; \n      \n Важіль зчеплення: 343283 - 1шт; \n      \n Важіль гальма: 343284 - 1шт; \n      \n Регулятор: 200003 - 2шт; \n      \n Наконечник зчеплення: 392261 - 1шт; \n      \n Наконечник гальма: 392262 - 1шт;","ord_delivery":"novaposhta","timeEntryOrder":null,"holderTime":null,"peredanoNaSklad":null,"orderTime":"2026-07-22 14:46:24","updateAt":"2026-08-28 17:06:31","statusId":4,"paymentDate":null,"paymentAmount":6224,"rejectionReason":null,"commissionAmount":0,"userId":1,"payedAmount":null,"shipping_costs":null,"restPay":6224,"document_ord_check":null,"typeId":1,"call":null,"discountAmount":0,"integrationType":null,"integrationId":null,"integrationExternalTypeId":null,"ord_novaposhta":{"delivery":"WarehouseWarehouse","city":"3425bc36-adb8-11e3-9fa0-0050568002cf","branch":"9678fe37-abc8-11e6-b5da-005056887b8d","house":"","flat":"","cargoType":"Parcel","payer":"Recipient","paymentMethod":"Cash","EN":"","branchNumber":2,"backDelivery":"PaymentControl","postpayPayer":"Recipient","postpaySum":6224,"statusCode":0,"manual":1,"idEntity":3,"legal":0,"ownershipFormId":"","settlementRef":"e720685d-4b33-11e4-ab6d-005056801329","liftToFloor":0,"floor":0,"elevator":0,"allowRedirectReturn":0,"additionalService":[],"isRedirect":0,"ageIdentification":0,"fulfilmentTotalQty":0,"fulfilmentTotalSum":0,"fulfilmentIndividualPackaging":0,"deliveryLargeHouseholdAppliances":0,"isPrinted":0,"isScanSheetRef":0,"cityName":"с. Щасливе, Бориспільський р-н, Київська обл.","areaName":"Київська","cityTemplateName":"с. Щасливе (Київська обл.)","branchName":"Відділення №2 (до 30 кг): вул. Героїв Майдану, 11, прим. 64","warehouseTypeId":2}},"meta":{"fields":{"sajt":{"label":"Сайт","name":"sajt","type":"select","options":[{"value":64,"text":"vulpes-moto.netlify.app"}]},"organizationId":{"label":"Организация","name":"organizationId","type":"select","options":[{"text":"VULPES інтернет магазин (ФОП ЛНМ)","value":3}]},"shipping_method":{"label":"Способ доставки","name":"shipping_method","type":"select","options":[{"value":65,"text":"Новая почта"}]},"payment_method":{"label":"Способ оплаты","name":"payment_method","type":"select","options":[{"value":57,"text":"Післяплата"}]},"peredanoNaSklad":{"label":"Передано на склад","name":"peredanoNaSklad","type":"select","options":[]},"statusId":{"label":"Статус","name":"statusId","type":"select","options":[{"value":4,"text":"відправлено"}]},"rejectionReason":{"label":"Причина отказа","name":"rejectionReason","type":"select","options":[]},"userId":{"label":"Менеджер","name":"userId","type":"select","options":[{"value":1,"text":"Mirco"}]},"typeId":{"label":"Тип","name":"typeId","type":"select","options":[{"value":1,"text":"Заявка он-лайн"}]},"contacts":{"fields":{"userId":{"label":"Менеджер","name":"userId","type":"select","options":[{"value":1,"text":"Mirco"}]}}}}}})

  return (
    <div className={css.container}>
      <div className={css.wrapper}>
        {isLoading && <ClockLoader color="#c04545" />}
        <button
          onClick={(e) => {
            setPrepareMode(prev => !prev)
            e.currentTarget.blur()
            document.body.focus()
          }}
          className={css.modeButton}
        >
          {prepareMode? t('close') : t('prepare for shipment')}
        </button>
        {prepareMode && prepareList?.length > 0 &&
        <div className={css.room}>
          <ul className={css.itemsList}>
            {
              prepareList.map((i, index) => (
                <li 
                  key={i.article + index} 
                  className={`${css.item} ${i.done && css.doneItem}`}
                >
                  {i.inCart > 0 &&
                  <span 
                    className={`${css.progressIcon} ${i?.done && css.greenIcon} ${i?.error && css.redIcon}`}
                    onClick={() => {if (i.error) {setPrepareList(prev => ([ ...prev.map(item => item.article === i.article ? { ...item, inCart: item.count } : item) ]))}}}
                  >
                    {i.inCart}/{i.count}
                  </span>}
                  <button
                    onClick={() => { toggleDone(i.article) }} 
                    className={`${css.doneBtn} ${i.done && css.greenDoneBtn}`}
                  >
                    {i.done ? 
                    <CheckCircleIcon />
                    : 
                    <RadioButtonUncheckedIcon />}
                  </button>
                  <p>{i.article} - {i.count}шт. {'->'} {i.shelves?.length ? `полка №${i.shelves.map(s => s.name).join(', ')}` : t('somewhere in the warehouse')}</p>
                </li>
              ))
            }
          </ul>
        </div>
        }
        {(allOrders?.length > 0) && 
        <ul className={css.ordersList}>
          {allOrders.map((order, index) => (
            <li key={index} className={css.ordersListItem} onClick={() => openOrder(order)}>
              <p className={css.orderNumber}>№{order.id}</p>
              <p>TTH: {order.ord_delivery_data[0].trackingNumber}</p>
              <div>
                <p>{t('items')}:</p>
                {order?.products && <ListOfProducts products={order.products}/>}
              </div>
            </li>
          ))}
        </ul>
        }
      </div>
      <PopUp
        isOpen={orderModal}
        close={closeModal}
        body={
        <div className={css.modalBody}>
          {activeOrder?.ord_delivery_data[0]?.trackingNumber && <img alt={activeOrder?.ord_delivery_data[0]?.trackingNumber} src={activeOrder?.ord_delivery_data[0]?.marking} className={css.barcode} />}
          <h3>№ {activeOrder?.id}</h3>
          <ul className={css.modalProductsList}>
            {activeOrder?.products && 
              activeOrder?.products.map(product => (
                <li key={product.sku}>
                  <p>{`${product.documentName} ${product.text}`}</p>
                </li>
              ))
            }
          </ul>
          <p>{t('delivery info')}:</p>
          <p>{activeOrder?.ord_delivery_data[0]?.provider}</p>
          <p>ТТН: {activeOrder?.ord_delivery_data[0]?.trackingNumber}</p>
          <p>{t('adress')}: {activeOrder?.ord_delivery_data[0]?.cityName}, {activeOrder?.ord_delivery_data[0]?.address}</p>
          <p>{t('phone')}: +{activeOrder?.contacts[0]?.phone[0]}</p>
          <p>{t('rest pay')}: {activeOrder?.restPay}грн.</p>
          <p>{activeOrder?.ord_delivery_data[0]?.payer === "Recipient" ? "*Доставку оплачивает получатель." : "*Доставку оплачивает отправитель."}</p>
        </div>}
      />
      <PopUp
        isOpen={doneModal}
        close={() => setDoneModal(false)}
        body={
        <div className={css.doneModalBody}>
          <CheckCircleIcon sx={{ color: '#75bd6f', fontSize: 40 }}/>
         <p>{t('all items have been gathered and are ready to ship')}</p>
        </div>}
      />
    </div>
  );
};
