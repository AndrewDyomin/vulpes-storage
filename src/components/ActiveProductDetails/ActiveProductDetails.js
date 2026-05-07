import { useDispatch, useSelector } from 'react-redux';
import { selectActiveProduct, selectProductsLoading } from '../../redux/products/selectors';
import { selectIsLoggedIn } from '../../redux/auth/selectors';
import css from './ActiveProductDetails.module.css';
import { useState } from 'react';
import logo from 'images/logo 2.png';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import EditIcon from '@mui/icons-material/Edit';
import GTranslateIcon from '@mui/icons-material/GTranslate';
import { useTranslation } from 'react-i18next';
import { updateProductField } from '../../redux/products/slice';
import { getTranslate, updateProduct } from '../../redux/products/operations';
import toast from 'react-hot-toast';
import Select from 'react-select';

export const ActiveProductDetails = ({ editMode, setEditMode, setDetailsModal, user, streaming, setStreaming, setNext }) => {

    const dispatch = useDispatch();
    const product = useSelector(selectActiveProduct);
    const isLoading = useSelector(selectProductsLoading);
    const isLoggedIn = useSelector(selectIsLoggedIn);
    const { t, i18n } = useTranslation();
    const currentLang = i18n.language;
    const description = currentLang === 'ru' ? product.description?.RU : currentLang === 'uk' ? product.description?.UA : product.description?.DE;
    let access = false;
    if (user === 'owner' || user === 'administrator' || user === 'manager') {
        access = true;
    }

    const destinations = [
        { value: 'для мотоцикла', label: 'для мотоцикла' },
        { value: 'для квадроцикла', label: 'для квадроцикла' },
    ];

    const [currentImage, setCurrentImage] = useState(0);
    const [updated, setUpdated] = useState({});

    const saveChanges = () => {
        if (Object.keys(updated).length > 0) {
            dispatch(updateProduct({ ...updated, _id: product._id }));
            setEditMode(false);
            if (streaming) {
                setDetailsModal(false);
                setNext(true)
            }
        } else {
            toast.error('Сначала нужно хоть что-то изменить в товаре.');
        }
    }

    function toggleMarketplace(name) {
          const value = !product?.marketplaces[name];

        dispatch(updateProductField({
            path: ["marketplaces", name],
            value
        }));

        setUpdated(prev => ({
            ...prev,
            [`marketplaces.${name}`]: value
        }));
    }

    if (product._id) {
        return (
            <div className={css.container}>
                <p className={css.article}>{product.article}</p>
                <div className={css.infoBlock}>
                    <div className={css.imageWrapper}>
                        {product?.images?.length > 1 && 
                        <div 
                            className={`${css.imgBtn} ${css.leftBtn}`}
                            onClick={() => {currentImage === 0 ? setCurrentImage(product?.images?.length - 1) : setCurrentImage(currentImage - 1)}}
                        >
                            <ChevronLeftIcon fontSize='large' color='#000'/>
                        </div>}
                        <img 
                            src={product?.images ? product?.images[currentImage] : logo}
                            alt={product.name.UA}
                            className={css.image}
                            onError={e => {
                                e.currentTarget.src = logo;
                            }}
                        />
                        {product?.images?.length > 1 && 
                        <div 
                            className={`${css.imgBtn} ${css.rightBtn}`}
                            onClick={() => {currentImage === product?.images?.length - 1 ? setCurrentImage(0) : setCurrentImage(currentImage + 1)}}
                        >
                            <ChevronRightIcon fontSize='large' color='#000'/>
                        </div>}
                    </div>
                    {!editMode ? <div className={css.paramsBlock}>
                        <p>{currentLang === 'ru' ? product.name?.RU || 'no_name' : currentLang === 'uk' ? product.name?.UA || 'no_name' : product.name?.DE || 'no_name'}</p>
                        <p className={css.price}>{product.price.UAH || '-'}грн.</p>
                        {isLoggedIn && 
                        <div className={css.paramsWrapper}>
                            <p>{t('quantity in stock')}: {product.quantityInStock}</p>
                            <p>{t('params')}:</p>
                            {product?.color && <p>{t('color')}: {product?.color}</p>}
                            <p>{t('price in Motea')}: {product?.moteaPrice?.UAH}грн {product?.availabilityInMotea ? '('+product?.availabilityInMotea+')' : '('+t('unknown')+')'}</p>
                            <p>{t('vendor price')}: {Math.round(product?.vendorprice)}грн</p>
                            <p>{t('keywords')}: {currentLang === 'ru' ? product.metaKeywords.RU : product.metaKeywords.UA}</p>
                            <p>{t('dimensions')}:</p>
                            <p>{product.dimensions.width} x {product.dimensions.height} x {product.dimensions.length}</p>
                            <p>{product.dimensions.weight}kg</p>
                            <p>{t('set')}:</p>
                            {product.isSet && product.isSet[0] !== null ? <ul>
                                {product.isSet.map((p, i) => (
                                    <li key={p + i}>
                                        <p>{p.sku}: {p.count}шт.</p>
                                    </li>
                                ))}
                            </ul> :
                            <p>{t('not set')}</p>}
                            {product?.bikeList && product.bikeList[0] !== null && 
                            <ul>
                                <li key={'1'}>{t('bike list')}:</li>
                                {product.bikeList.map((b, i) => (
                                    <li key={b + i}>
                                        <p>{b?.make} {b?.model} {b?.year}</p>
                                    </li>
                                ))}
                            </ul>
                            }
                        </div>}
                    </div> : 
                    // Режим редактора
                    <div className={css.paramsBlock}>
                        <label>
                            RU
                            <textarea
                                className={`${(!product.description.RU || product.description.RU === '') && css.green}`}
                                onChange={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = e.target.scrollHeight + "px";
                                    dispatch(updateProductField({
                                        path: ["name", "RU"],
                                        value: e.target.value,
                                    }));
                                    setUpdated(prev => ({ ...prev, "name.RU": e.target.value }))
                                }} 
                                value={(!product.name?.RU || product.name.RU === '') ? product.name.translatedRU : product.name.RU}
                            />
                            {product.name.RU === '' && !isLoading &&
                            <button 
                                className={css.translateBtn}
                                onClick={() => dispatch(getTranslate({_id: product._id, article: product.article, name: product.name, description: product.description}))}
                            >
                                <GTranslateIcon />
                            </button>}
                        </label>
                        <label>
                            UA
                            <textarea
                                className={`${(!product.description.UA || product.description.UA === '') && css.green}`}
                                onChange={(e) => {
                                    e.target.style.height = "auto";
                                    e.target.style.height = e.target.scrollHeight + "px";
                                    dispatch(updateProductField({
                                        path: ["name", "UA"],
                                        value: e.target.value,
                                    }));
                                    setUpdated(prev => ({ ...prev, "name.UA": e.target.value }))
                                }} 
                                value={(!product.name?.UA || product.name.UA === '') ? product.name.translatedUA : product.name.UA}
                            />
                        </label>
                        <div className={css.paramsWrapper}>
                            <label>
                                Color
                                <textarea
                                    onChange={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                        dispatch(updateProductField({
                                            path: ["color",],
                                            value: e.target.value,
                                        }));
                                        setUpdated(prev => ({ ...prev, "color": e.target.value }))
                                    }} 
                                    value={product?.color || ''}
                                    rows={1}
                                />
                            </label>
                            <Select 
                                name='destination' 
                                options={destinations}
                                placeholder={product.params.destination}
                                value={product.params.destination}
                                onChange={e => {dispatch(updateProductField({
                                    path: ["params", "destination"],
                                    value: e.value,
                                    }));
                                    setUpdated(prev => ({ ...prev, "params.destination": e.value }))
                                }}
                            />
                            <label>
                                {t('keywords')} RU: 
                                <textarea
                                    onChange={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                        dispatch(updateProductField({
                                            path: ["metaKeywords", "RU"],
                                            value: e.target.value,
                                        }));
                                        setUpdated(prev => ({ ...prev, "metaKeywords.RU": e.target.value }))
                                    }} 
                                    value={product.metaKeywords.RU}
                                />
                            </label>
                            <label>
                                {t('keywords')} UA: 
                                <textarea
                                    onChange={(e) => {
                                        e.target.style.height = "auto";
                                        e.target.style.height = e.target.scrollHeight + "px";
                                        dispatch(updateProductField({
                                            path: ["metaKeywords", "UA"],
                                            value: e.target.value,
                                        }));
                                        setUpdated(prev => ({ ...prev, "metaKeywords.UA": e.target.value }))
                                    }} 
                                    value={product.metaKeywords.UA}
                                />
                            </label>
                            {/* кнопки маркетплейсов */}
                            {product?.marketplaces && Object.entries(product.marketplaces).map((m) => (
                                <div key={m[0]} className={css.horoshopWrapper} onClick={() => toggleMarketplace(m[0])}>
                                    {m[0].toUpperCase()}
                                    <div className={css.progress}>
                                        <div className={css.progressLine}>
                                        <div className={`${css.progressPoint} ${m[1] && css.progressRightPoint}`}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* кнопки маркетплейсов */}
                        </div>
                    </div>
                    }
                </div>
                
                {!editMode ? 
                <div>
                <p className={css.description}>{t('description')}:</p>
                <div className={css.descriptionBody} dangerouslySetInnerHTML={{ __html: description || "no_description" }} />
                </div> : 
                <div className={css.descriptionEditor}>
                <label>
                    {t('description')} RU: 
                    <textarea
                        className={`${(!product.description.RU || product.description.RU === '') && css.green}`}
                        onChange={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                            dispatch(updateProductField({
                                path: ["description", "RU"],
                                value: e.target.value,
                            }));
                            setUpdated(prev => ({ ...prev, "description.RU": e.target.value }))
                        }} 
                        rows={8}
                        value={(!product.description?.RU || product.description.RU === '') ? product.description.translatedRU : product.description.RU}
                    />
                    {(!product?.description?.RU || product.description.RU === '') && !isLoading &&
                    <button 
                        className={css.translateBtn}
                        onClick={() => dispatch(getTranslate({_id: product._id, article: product.article, name: product.name, description: product.description}))}
                    >
                        <GTranslateIcon />
                    </button>}
                </label>
                <label>
                    {t('description')} UA: 
                    <textarea
                        onChange={(e) => {
                            e.target.style.height = "auto";
                            e.target.style.height = e.target.scrollHeight + "px";
                            dispatch(updateProductField({
                                path: ["description", "UA"],
                                value: e.target.value,
                            }));
                            setUpdated(prev => ({ ...prev, "description.UA": e.target.value }))
                        }} 
                        rows={8}
                        value={product.description.UA}
                    />
                    {(!product?.description?.UA || product.description.UA === '') && !isLoading &&
                    <button 
                        className={css.translateBtn}
                        onClick={() => dispatch(getTranslate({_id: product._id, article: product.article, name: product.name, description: product.description}))}
                    >
                        <GTranslateIcon />
                    </button>}
                </label>
                </div>}
                {isLoggedIn && access && <div className={css.buttons}>
                    <button
                        className={`${css.btn} ${editMode && css.hidden}`}
                        onClick={() => setEditMode(prev => !prev)}
                    >
                        <EditIcon />
                    </button>
                    <button
                        className={`${css.btn} ${css.save} ${!editMode && css.hidden}`}
                        onClick={() => saveChanges()}
                    >
                        {t('save')}
                    </button>
                    <button
                        className={`${css.btn} ${!editMode && css.hidden}`}
                        onClick={() => {setEditMode(prev => !prev); setStreaming(false)}}
                    >
                        {t('cancel')}
                    </button>
                </div>}
            </div>
        )
    } else {
        return(<></>)
    }
}