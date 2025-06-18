import { useState } from 'react';
import { useAuth } from 'hooks';
import Modal from 'react-modal';
import svgIcons from '../../images/icons.svg';
import css from './MobileMenuBtn.module.css';
import { UserMenu } from '../UserMenu/UserMenu';
import { AuthNav } from '../AuthNav/AuthNav';

export const MobileMenuBtn = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isLoggedIn } = useAuth();

    const openMenu = () => {
      setIsMenuOpen(true);
      document.body.classList.add('modal-open');
    };
  
    const closeMenu = () => {
      setIsMenuOpen(false);
      document.body.classList.remove('modal-open');
    };

    const customStyles = {
        overlay: { 
            backgroundColor: 'rgba(9, 9, 9, 0.75)',
            position: 'fixed',
        },
        content: {
          top: '60px',
          left: 'auto',
          right: '-135px',
          bottom: 'auto',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '80%',
          padding: '24px',
          borderRadius: '12px',
          border: '2px solid black',
          backgroundColor: 'FFF',
          transition: 'top 0.3s ease-in-out',
          position: 'absolute',
        },
      };

    return (
        <>
            <button className={css.menuButton} onClick={openMenu}>
                <svg className={css.menuIcon}>
                    <use href={`${svgIcons}#icon-menu`} width={'32px'}/>
                </svg>
            </button>
            <Modal
                isOpen={isMenuOpen}
                onRequestClose={closeMenu}
                style={customStyles}
                ariaHideApp={false}
            >
                <button className={css.menuButton} type="button" onClick={closeMenu}>
                    <svg className={css.menuIcon}>
                        <use href={`${svgIcons}#icon-close-circle`}></use>
                    </svg>
                </button>
                {isLoggedIn ? <UserMenu close={closeMenu}/> : <AuthNav close={closeMenu}/>}
            </Modal>
        </>
    )
}