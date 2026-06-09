import css from "./PurchaseRequest.module.css";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { PopUp } from "../PopUp/PopUp";
import toast from "react-hot-toast";
import axios from "axios";

export const PurchaseList = () => {
    const { t } = useTranslation();

    const [purchased, setPurchased] = useState([]);
    const [addProductModal, setAddProductModal] = useState(false);
    const [article, setArticle] = useState('');

    const closeModal = () => {
        setAddProductModal(false);
    }

    const addProduct = async() => {
        try{
            const res = await axios.post('/products/add-to-purchase-request', { article });
            toast.success(res?.data?.message);
            closeModal();
            setPurchased([]);
        } catch(err) {
            toast.error(err)
        }
    };

    const delProduct = async(_id) => {
        const res = await axios.post("/products/remove-from-purchase-request", { _id });
        toast.success(res.data.message);
        setPurchased([])
    }

    useEffect(() => {
        async function getAll() {
            const res = await axios.get('/products/all-purchase-requests');
            setPurchased(res?.data.array);
        }
        if (!purchased?.length) {
            getAll();
        }
    }, [purchased]);

    return (
        <>
            <button className={css.addButton} onClick={() => setAddProductModal(!addProductModal)}>
                <AddCircleOutlineIcon fill="transparent" fontSize="large" />
            </button>
            {purchased?.length ? 
            <ul className={css.list}>
                {purchased.map((p, index) => (
                    <li key={p.article + index} className={css.item}>
                        <img src={p.image} alt={`${p.name} (${p.article})`} className={css.itemImage}/>
                        <p className={css.itemArticle}>{p.article}</p>
                        <p className={css.itemName}>{p.name}</p>
                        <button className={css.delBtn} onClick={() => delProduct(p._id)}>
                            <HighlightOffIcon fill="transparent" fontSize="small"/>
                        </button>
                    </li>
                ))}
            </ul> 
            : 
            <p>{t('empty')}</p>}
            <PopUp
                isOpen={addProductModal}
                close={closeModal}
                body={
                <div className={`${css.countArea} ${css.notFoundArea}`}>
                    <input
                    placeholder={t('article')}
                    onChange={e => setArticle(e.target.value)}
                    className={css.countInput}
                    />
                    <button className={css.countAddBtn} onClick={() => toast.promise(addProduct(), {loading: 'Saving...', success: 'Saved', error: 'Could not save'})}>
                    {t('add')}
                    </button>
                </div>
                }
            />
        </>
    )
}