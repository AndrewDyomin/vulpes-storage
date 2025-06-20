import css from './QuickAccessPanel.module.css';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../redux/auth/selectors';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import OutboxIcon from '@mui/icons-material/Outbox';

export const QuickAccessPanel = () => {
  const user = useSelector(selectUser);

  return (
    <div className={css.container}>
        {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
        <Link to="/scanner" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <QrCodeScannerIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>Scanner</p>
            </div>
        </Link>)}
        {(user.role === 'owner' || user.role === 'administrator' || user.role === 'manager') && (
        <Link to="/shipping" className={css.link}>
            <div className={css.linkCard}>
                <div className={css.iconArea}>
                    <OutboxIcon fontSize='large'/>
                </div>
                <p className={css.linkCardTitle}>For shipping</p>
            </div>
        </Link>)}
    </div>
  );
};
