import css from './Users.module.css';
import { getAllUsers } from '../../redux/user/operations';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import SaveAsOutlinedIcon from '@mui/icons-material/SaveAsOutlined';
import Paper from '@mui/material/Paper';
import Select from 'react-select'

export const Users = () => {
  const dispatch = useDispatch();
  const usersArray = useSelector(state => state.user.users);
  const [target, setTarget] = useState(false)

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
    } else if(target?._id !== user?._id) {
        setTarget(false)
    }
  }

  const changeRole = (value) => {
    setTarget(prevState => ({ ...prevState, role: value }))
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
                        <input className={css.name} defaultValue={user.name}/>
                        <Select onChange={(e) => changeRole(e?.value)} className={css.role} options={options} defaultValue={options.find(option => option.value === user.role)}/>
                    </div>
                    <label>Email: <input defaultValue={user.email}/></label>
                    <label>Telegram: <input defaultValue={user.chatId ? user.chatId : ''}/></label>
                    {JSON.stringify(target) !== JSON.stringify(user) && <SaveAsOutlinedIcon className={css.saveBtn}/>}
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
