import axios from 'axios';
import { useEffect, useState, useMemo } from 'react';
import Select from 'react-select';
import css from './RoasStat.module.css';
import { useTranslation } from 'react-i18next';

axios.defaults.baseURL = process.env.REACT_APP_SERVER_URL;

export const RoasStat = () => {
  const { t } = useTranslation();
  const [roiData, setRoiData] = useState([]);
  const [filter, setFilter] = useState({ from: '', to: '' });
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [campaignsInfo, setCampaignInfo] = useState([]);
  const [weekStart, setWeekStart] = useState([]);
  const [weekEnd, setWeekEnd] = useState([]);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('/stat/roi');
        setRoiData(res.data.array);
      } catch (error) {
        console.error('Ошибка при загрузке ROI-данных:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (roiData.length === 0) return;

    const uniqueCampaigns = new Set();
    const mondays = new Set();
    const sundays = new Set();

    for (const week of roiData) {
      const [startDate, endDate] = week.week.split('_');

      mondays.add(startDate);
      sundays.add(endDate);

      for (const item of week.campaigns) {
        if (item.campaign !== 'Shopping Free Listings') {
          uniqueCampaigns.add(item.campaign);
        }
      }
    }

    if (weekStart.length === 0) {
      setWeekStart([...mondays].sort().map(d => ({ value: d, label: d })));
    }
    if (weekEnd.length === 0) {
      setWeekEnd([...sundays].sort().map(d => ({ value: d, label: d })));
    }

    setActiveCampaigns(Array.from(uniqueCampaigns));
  }, [roiData, weekEnd.length, weekStart.length]);

  useEffect(() => {
    if (activeCampaigns.length === 0 || roiData.length === 0) return;

    const sortedInfo = activeCampaigns.map(campaign => {
      return roiData
        .map(week => {
          const found = week.campaigns.find(c => c.campaign === campaign);
          if (!found) return null;

          return {
            ...found,
            roas: found.cost > 0 ? Number((found.cash / found.cost).toFixed('2')) : 0,
            weekRange: week.week,
            startDate: week.week.split('_')[0],
            endDate: week.week.split('_')[1],
          };
        })
        .filter(Boolean);
    });

    setCampaignInfo(sortedInfo);
  }, [activeCampaigns, roiData]);

  const filteredCampaignsInfo = useMemo(() => {
    if (!filter.from || !filter.to) return campaignsInfo;

    const fromDate = new Date(filter.from);
    const toDate = new Date(filter.to);

    return campaignsInfo.map(campaignWeeks =>
      campaignWeeks.filter(week =>
        new Date(week.startDate) >= fromDate && new Date(week.endDate) <= toDate
      )
    );
  }, [filter, campaignsInfo]);

  const campaignStat = name => {
    const idx = activeCampaigns.indexOf(name);
    if (idx === -1) return null;

    const target = filteredCampaignsInfo[idx];
    if (!target) return null;
    let totalCost = 0;
    let totalCash = 0;

    for (const week of target) {
        totalCost += week.cost;
        totalCash += week.cash;
    }
    const value = Math.round(totalCash / totalCost)

    return (
      <div className={css.campaignStatArea}>
        {activeTooltip && <p className={css.activeTooltip}>{activeTooltip}</p>}
        <p className={`${css.roasValue} ${value === 5 ? css.yellow : value < 5 ? css.red : css.green}`}>{value}грн.</p>
        {target.map(week => (
          <span
            key={week.weekRange}
            className={`${css.weekRoas} ${activeTooltip === week.weekRange && css.active}`}
            title={`ROAS: ${week.roas}`}
            style={{ height: `${week.roas * 2}px` }}
            onClick={() =>
                setActiveTooltip(prev => (prev === week.weekRange ? null : week.weekRange))
            }
          >
          {activeTooltip === week.weekRange && (
            <div className={css.tooltip}>{week.roas}</div>
          )}</span>
        ))}
      </div>
    );
  };

  return (
    <>
      <h2>ROAS</h2>

      <div className={css.dateFilter}>
        <Select
          onChange={(e) => setFilter(prev => ({ ...prev, from: e.value }))}
          className={css.filter}
          options={weekStart}
          value={weekStart.find(w => w.value === filter.from) || null}
          placeholder={t('from')}
        />
        <p>-</p>
        <Select
          onChange={(e) => setFilter(prev => ({ ...prev, to: e.value }))}
          className={css.filter}
          options={weekEnd}
          value={weekEnd.find(w => w.value === filter.to) || null}
          placeholder={t('to')}
        />
      </div>

      <div>
        <ul className={css.campaignList}>
          {roiData.length > 0 &&
            activeCampaigns.map(campaign => (
              <li key={campaign}>
                <p>{campaign}</p>
                {campaignStat(campaign)}
              </li>
            ))}
        </ul>
      </div>
    </>
  );
};
