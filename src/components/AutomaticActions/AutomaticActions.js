import css from './AutomaticActions.module.css';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClockLoader } from 'react-spinners';
import BackupTableOutlinedIcon from '@mui/icons-material/BackupTableOutlined';
import { PopUp } from '../PopUp/PopUp';
import { EditableTable } from '../EditableTable/EditableTable';

export const AutomaticActions = () => {
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  // const [articlesForBroker, setArticlesForBroker] = useState([]);
  const [isBrokerTableOpen, setIsBrokerTableOpen] = useState(false);

  const closeModal = () => {
    setIsBrokerTableOpen(false);
  };

  const downloadAvailabilityTableHandler = async () => {
    setIsPending(true);
    await axios
      .post('/products/availability')
      .then(response => toast.success(t(response.data.message)))
      .catch(response => toast.success(t(response.data.message)));
    setIsPending(false);
  };

  const sendTableValues = async (values) => {
    console.log(values)
  };

  return (
    <>
      <div className={css.buttonsArea}>
        <div className={css.button} onClick={downloadAvailabilityTableHandler}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <BackupTableOutlinedIcon />
              <p>{t('download availability table')}</p>
            </>
          )}
        </div>
        <div className={css.button} onClick={() => setIsBrokerTableOpen(true)}>
          {isPending ? (
            <ClockLoader color="#c04545" />
          ) : (
            <>
              <BackupTableOutlinedIcon />
              <p>{t('create table for broker')}</p>
            </>
          )}
        </div>
      </div>
      <PopUp
        isOpen={isBrokerTableOpen}
        close={closeModal}
        body={
          <>
            <p className={css.tableTitle}>{t('table for broker')}</p>
            <EditableTable send={sendTableValues}/>
          </>
        }
      />
    </>
  );
};
