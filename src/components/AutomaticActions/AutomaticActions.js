import axios from "axios";
import { useState } from "react"
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next"
import { ClockLoader } from 'react-spinners';

export const AutomaticActions = () => {
    const { t } = useTranslation()
    // const [downloadAvailabilityTable, setDownloadAvailabilityTable] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const downloadAvailabilityTableHandler = async() => {
        setIsPending(true);
        await axios.post('/products/availability')
        .then((response) => toast.success(t(response.data.message)))
        .catch((response) => toast.success(t(response.data.message)));
        setIsPending(false);
    }

    return (
        <>
            <div>
                <button onClick={downloadAvailabilityTableHandler}>{isPending ? <ClockLoader color="#c04545" /> : t('download availability table')}</button>
            </div>
        </>
    )
}