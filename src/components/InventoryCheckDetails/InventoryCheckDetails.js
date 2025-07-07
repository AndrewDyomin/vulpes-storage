import { useSelector } from 'react-redux';
import { selectAllInventoryChecks } from '../../redux/inventory/selectors';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import axios from 'axios';
import css from './InventoryCheckDetails.module.css';
import { useState, useEffect } from 'react';
import { PopUp } from '../PopUp/PopUp';
import toast from 'react-hot-toast';

export const InventoryCheckDetails = ({ id }) => {
  const allChecks = useSelector(selectAllInventoryChecks);
  const target = allChecks.find(check => check._id === id);
  const [activeItems, setActiveItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDelModalOpen, setIsDelModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editableItems, setEditableItems] = useState([]);

  const fetchProductByArticle = async article => {
    const res = await axios.post('/products/byarticle', { article });
    return res.data.product;
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsDelModalOpen(false);
  };

  const handleDelete = async () => {
    try {
      await axios.post('/inventory-check/delete', { id });
      toast.success('Документ удалён');
      closeModal();
      window.history.back();
    } catch (err) {
      console.error('Ошибка при удалении:', err.message);
      toast.error('Ошибка при удалении');
    }
  };

  const handleSave = async() => {
    const result = {
      id: target._id,
      items: [],
    };

    editableItems.forEach((item, index) => {
      const input = document.getElementById(`${index}Count`);
      const count = input ? Number(input.value) : 0;
      const article = item.article !== '' ? item.article : document.getElementById(`${index}Article`).value;

      result.items.push({
        article,
        count,
      });
    });

    try {
       await axios.post('/inventory-check/update', result); 
       toast.success('Документ обновлён')
       window.history.back();
    } catch(err) {
        toast.error(err.message)
    }    
  };

  const startEdit = () => {
    setEditableItems([...target.items]);
    setEditMode(true);
    closeModal();
  };

  const handleAdd = () => {
    setEditableItems(prev => [...prev, { article: '', count: '' }]);
  };

  useEffect(() => {
    if (!target || !target.items?.length) return;

    const fetchAllProducts = async () => {
      const results = [];
      for (const item of target.items) {
        try {
          const product = await fetchProductByArticle(item.article);
          results.push(product);
        } catch (err) {
          console.error(
            `Ошибка загрузки артикула ${item.article}:`,
            err.message
          );
        }
      }
      setActiveItems(results);
    };

    fetchAllProducts();
  }, [target]);

  return (
    <>
      <div className={css.titleArea}>
        <h1>{target?.name}</h1>
        <button className={css.moreButton} onClick={() => setIsModalOpen(true)}>
          <MoreHorizIcon fontSize="large" />
        </button>
      </div>
      <p>Items:</p>
      <ul className={css.list}>
  {(editMode ? editableItems : target.items)?.map((item, index) => {
    const product = activeItems.find(p => p?.article === item.article);
    return (
      <li key={index} className={css.item}>
        <img
          className={css.itemImage}
          alt={product?.name?.UA}
          src={product?.images[0]}
        />
        {editMode && item.article === '' ? (<input
            id={`${index}Article`}
            placeholder='Article...'
            className={css.itemArticle}
          />) : 
          (<p className={css.itemArticle}>Article: {item.article}</p>)}
        {editMode ? (
          <input
            id={`${index}Count`}
            defaultValue={item.count}
            placeholder='Count'
            className={`${css.itemCount} ${css.itemCountInput}`}
          />
        ) : (
          <p className={css.itemCount}>{item.count} шт.</p>
        )}
      </li>
    );
  })}
</ul>
      {editMode && (
        <div className={css.editButtons}>
          <button className={css.addButton} onClick={handleAdd}>
            <AddCircleOutlineIcon fill="transparent" fontSize="large" />
          </button>
          <button className={css.saveButton} onClick={handleSave}>
            Save
          </button>
        </div>
      )}
      <PopUp
        isOpen={isModalOpen}
        close={closeModal}
        body={
          <div className={css.moreModal}>
            <button
              className={css.modalButton}
              onClick={startEdit}
            >
              Edit
            </button>
            <button
              className={`${css.modalButton} ${css.delButton}`}
              onClick={() => setIsDelModalOpen(true)}
            >
              Delete
            </button>
          </div>
        }
      />
      <PopUp
        isOpen={isDelModalOpen}
        close={closeModal}
        body={
          <>
            <p>Are you sure?</p>
            <div className={css.moreModal}>
              <button className={css.modalButton} onClick={closeModal}>
                Cancel
              </button>
              <button
                className={`${css.modalButton} ${css.delButton}`}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </>
        }
      />
    </>
  );
};
