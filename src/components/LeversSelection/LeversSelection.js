import { useTranslation } from 'react-i18next';
import css from './LeversSelection.module.css';
import Paper from '@mui/material/Paper';
import { PopUp } from '../PopUp/PopUp';
import { useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';

export const LeversSelection = ({ query, color }) => {
    const {t} = useTranslation();

    const [requestModal, setRequestModal] = useState(false);
    const [name, setName] = useState('');
    const [vin, setVin] = useState('');
    const [phone, setPhone] = useState('');
    const [fieldError, setFieldError] = useState({ name: false, vin: false, phone: false });
    const [requested, setRequested] = useState(false);

    const sendRequest = async() => {
        let err = false;
        setFieldError({ name: false, vin: false, phone: false });
        if (vin === '') {
            toast.error(t('enter vin-code, please'));
            setFieldError(prev => ({ ...prev, vin: true }));
            err = true;
        }
        if (name === '') {
            toast.error(t('enter your name, please'));
            setFieldError(prev => ({ ...prev, name: true }));
            err = true;
        }
        if (phone === '') {
            toast.error(t('enter your phone, please'));
            setFieldError(prev => ({ ...prev, phone: true }));
            err = true;
        }
        if (err) return;

        try {
            const res = await axios.post("/levers/request-a-selection", { vin, name, phone, query, color });
            if (res.data.message === 'Ok') {
                setRequested(true);
                setRequestModal(false);
            }
        } catch {
            toast.error('Something went wrong')
        }
    }

    return (
        <div className={css.section}>
            {!requested ? 
            <Paper className={css.sectionCard} elevation={10}>
                <h3 className={css.sectionTitle}>{t('request a selection of levers')}</h3>
                <p className={css.sectionText}>{t("can't find the right one yourself? leave it to us.")}</p>
                <button 
                    className={css.sectionButton}
                    onClick={() => setRequestModal(true)}
                >
                    {t('request a selection')}
                </button>
            </Paper>
            : 
            <Paper className={css.sectionCard} elevation={10}>
                <h3 className={css.sectionTitle}>{t('thank you')}!</h3>
                <p className={css.sectionText}>{t("Your request has been received. Our manager will contact you shortly.")}</p>
            </Paper>
            }
            <PopUp
                isOpen={requestModal}
                close={() => setRequestModal(false)}
                body={
                    <div className={css.modalBody}>
                        <div className={css.field}>
                            <input 
                                className={`${css.inputField} ${fieldError.vin && css.fieldError}`}
                                value={vin} 
                                onChange={e => setVin(e.target.value)}
                                id='vin-field'
                                placeholder='1hd1cgp1xxk110098'
                            />
                            <label
                                className={css.inputLabel}
                                htmlFor='vin-field'
                            >
                                VIN*
                            </label>
                        </div>
                        <div className={css.field}>
                            <input 
                                className={`${css.inputField} ${fieldError.name && css.fieldError}`}
                                value={name} 
                                onChange={e => setName(e.target.value)}
                                id='name-field'
                                placeholder={t('Vasyl')}
                                type='name'
                            />
                            <label
                                className={css.inputLabel}
                                htmlFor='name-field'
                            >
                                {t('name')}*
                            </label>
                        </div>
                        <div className={css.field}>
                            <input 
                                className={`${css.inputField} ${fieldError.phone && css.fieldError}`}
                                value={phone} 
                                onChange={e => setPhone(e.target.value)}
                                id='phone-field'
                                type='phone'
                                placeholder={t('063 633 6363')}
                            />
                            <label
                                className={css.inputLabel}
                                htmlFor='phone-field'
                            >
                                {t('phone')}*
                            </label>
                        </div>
                        <button 
                            className={`${css.sectionButton} ${css.modalButton}`}
                            onClick={sendRequest}
                        >
                            {t('request a selection')}
                        </button>
                    </div>
                }
            />
        </div>
    );
}