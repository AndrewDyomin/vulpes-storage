import svgIcons from '../../images/icons.svg';
import Modal from 'react-modal';
import css from './PopUp.module.css';

export const PopUp = ({ isOpen, close, body }) => {

    const customStyles = {
        overlay: { 
            backgroundColor: 'rgba(9, 9, 9, 0.75)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
        content: {
            position: 'relative',
            top: 'auto',
            left: 'auto',
            right: 'auto',
            bottom: 'auto',
            minWidth: '300px',
            maxWidth: '80%',
            width: 'auto',
            maxHeight: '80%',
            padding: '50px 20px',
            borderRadius: '12px',
            border: '2px solid black',
            backgroundColor: 'FFF',
            transition: 'top 0.3s ease-in-out',
        },
      };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={close}
            style={customStyles}
            ariaHideApp={false}
        >
            <button className={css.modalCloseButton} type="button" onClick={close}>
                <svg className={css.menuIcon}>
                    <use href={`${svgIcons}#icon-close-circle`}></use>
                </svg>
            </button>
            {body}
        </Modal>
    )
}