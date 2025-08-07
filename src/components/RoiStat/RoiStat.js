import axios from "axios";
import { useEffect, useState } from "react";

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

export const RoiStat = () => {

    const [roiData, setRoiData] = useState([]);

    useEffect(() => {
        async function getData() {
            await axios.get('/stat/roi').then(res => setRoiData(res.data.array))
        }
        if(roiData.length < 1) {
            getData()
        }
    }, [])

    console.log(roiData)

    return (
        <>
        stat
        </>
    )
}