import css from './QuickAccessPanel.module.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/auth/selectors';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import OutboxIcon from '@mui/icons-material/Outbox';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import AddHomeWorkOutlinedIcon from '@mui/icons-material/AddHomeWorkOutlined';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useTranslation } from 'react-i18next';
import moteaLogo from '../../images/motea_logo_no_claim.png';
import puigLogo from '../../images/puig.png'

export const QuickAccessPanel = () => {
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  return (
    <div className={css.container}>
        {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
        <Link to="/scanner" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <QrCodeScannerIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('scanner')}</p>
            </div>
        </Link>)}
        {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
        <Link to="/shipping" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <OutboxIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('for shipping')}</p>
            </div>
        </Link>)}
        {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
        <Link to="/inventory-check" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <AssignmentTurnedInOutlinedIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('inventory check')}</p>
            </div>
        </Link>)}
        {(user.role === 'owner' || user.role === 'administrator') && (
        <Link to="/get-products-in" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <AddHomeWorkOutlinedIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('get in')} MOTEA</p>
            </div>
        </Link>)}
        {user.role === 'owner' && (
        <Link to="/send-order-to-motea" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <img src={moteaLogo} alt='motea logo' className={css.moteaIcon}/>
                </div>
                <p className={css.linkCardTitle}>{t('send order to')} MOTEA</p>
            </div>
        </Link>)}
        {user.role === 'owner' && (
        <Link to="/puig-api" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <img src={puigLogo} alt='puig logo' className={css.moteaIcon}/>
                </div>
                <p className={css.linkCardTitle}>Puig API</p>
            </div>
        </Link>)}
        {(user.role === 'owner') && (
        <Link to="/marketplaces" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <StorefrontIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('marketplaces')}</p>
            </div>
        </Link>)}
        {(user.role === 'owner') && (
        <Link to="/automatic-actions" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <AutoFixHighIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('actions')}</p>
            </div>
        </Link>)}
        {(user.role === 'owner') && (
        <Link to="/users" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <PeopleAltOutlinedIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('users')}</p>
            </div>
        </Link>)}
        {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
        <Link to="/orders" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <ReceiptOutlinedIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('orders')}</p>
            </div>
        </Link>)}
        {user.role === 'owner' && (
        <Link to="/statistic" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <InsertChartOutlinedIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>{t('statistic')}</p>
            </div>
        </Link>)}
    </div>
  );
};
