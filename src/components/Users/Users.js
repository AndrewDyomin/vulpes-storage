import css from './Users.module.css';
import { getAllUsers } from '../../redux/user/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import Paper from '@mui/material/Paper';
import Select from 'react-select'
import axios from 'axios';
import toast from 'react-hot-toast';

export const Users = () => {
  const dispatch = useDispatch();
  const usersArray = useSelector(state => state.user.users);
  const [target, setTarget] = useState(false)
  const [delClick, setDelClick] = useState(0)

  const options = [
    { value: 'owner', label: 'owner' },
    { value: 'administrator', label: 'administrator' },
    { value: 'manager', label: 'manager' },
    { value: 'guest', label: 'guest' }
    ]

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const changeMode = async (user) => {
    if (!target?._id) {
        setTarget(user)
        setDelClick(0)
    } else if(target?._id !== user?._id) {
        setTarget(false)
        setDelClick(0)
    }
  }

  const changeRole = (value) => {
    setTarget(prevState => ({ ...prevState, role: value }))
  }

  const changeInput = (target) => {
    if(target.id === 'name') {
      setTarget(prevState => ({ ...prevState, name: target.value }))  
    } else if(target.id === 'email') {
      setTarget(prevState => ({ ...prevState, email: target.value }))  
    } else if(target.id === 'telegram') {
      setTarget(prevState => ({ ...prevState, chatId: target.value }))  
    }
  }

  const saveChanges = async() => {
    const response = await axios.post('/users/update', { ...target })
    if (response.status === 200) {toast.success(response.data.message)}
    if (response.status !== 200) {toast.error(response.data.message)}
    setTarget(false)
    dispatch(getAllUsers());
  }

  const deleteUser = async(_id) => {
    if (delClick === 0) {
        setDelClick(1)
    }
    if (delClick === 1) {
        try{
           const response = await axios.post('/users/delete', { _id })
        if (response.status === 200) {toast.success(response.data.message)}
        setTarget(false)
        setDelClick(0)
        dispatch(getAllUsers()); 
        } catch (error) {
            setDelClick(0)
            toast.error(error.response.data.message)
        }
    }
  }

  return (
    <>
      {usersArray?.length > 0 && (
        <ul className={css.usersList}>
          {usersArray.map(user => (
            <li key={user._id} onClick={() => changeMode(user)}>
              <Paper className={css.userCard} elevation={10}>
                {target?._id === user._id ? 
                (<>
                    <div className={css.title}>
                        <input id='name' className={css.name} defaultValue={user.name} onChange={e => changeInput(e.target)}/>
                        <Select onChange={(e) => changeRole(e?.value)} className={css.role} options={options} defaultValue={options.find(option => option.value === user.role)}/>
                    </div>
                    <label>Email: <input id='email' className={css.input} defaultValue={user.email} onChange={e => changeInput(e.target)}/></label>
                    <label>Telegram: <input id='telegram' className={css.input} defaultValue={user.chatId ? user.chatId : ''} onChange={e => changeInput(e.target)}/></label>
                    <div className={css.buttonsArea}>
                        <DeleteForeverOutlinedIcon className={css.delBtn} onClick={() => deleteUser(user._id)} fontSize={delClick === 1 ? 'large' : 'medium'}/>
                        {JSON.stringify(target) !== JSON.stringify(user) && <SaveAsOutlinedIcon className={css.saveBtn} onClick={saveChanges}/>}
                    </div>
                </>) : 
                (<>
                    <div className={css.title}>
                        <p className={css.name}>{user.name}</p>
                        <p className={css.role}>{user.role}</p>
                    </div>
                    <p>Email: {user.email}</p>
                    <p>Telegram: {user.chatId ? user.chatId : '? ? ?'}</p>
                </>)}
              </Paper>
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
