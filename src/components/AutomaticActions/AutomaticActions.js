import css from './AutomaticActions.module.css';
import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ClockLoader } from 'react-spinners';
import BackupTableOutlinedIcon from '@mui/icons-material/BackupTableOutlined';

export const AutomaticActions = () => {
  const { t } = useTranslation();
  // const [downloadAvailabilityTable, setDownloadAvailabilityTable] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const downloadAvailabilityTableHandler = async () => {
    setIsPending(true);
    await axios
      .post('/products/availability')
      .then(response => toast.success(t(response.data.message)))
      .catch(response => toast.success(t(response.data.message)));
    setIsPending(false);
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
      </div>
    </>
  );
};
