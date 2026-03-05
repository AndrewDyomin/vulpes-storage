import { useState } from 'react';
import css from './Search.module.css';
import SearchIcon from '@mui/icons-material/Search';
import { PopUp } from 'components/PopUp/PopUp';
import { ClockLoader } from 'react-spinners';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import puigLogo from '../../../images/puig.png'

export const Search = () => {
  const [phrase, setPhrase] = useState('');
  const [pending, setPending] = useState(false);
  const [modal, setModal] = useState(false);
  const [result, setResult] = useState('');

  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  const handleSearch = async () => {
    if (phrase !== '') {
      setPending(true);
      setResult('');

      const res = await axios.get(`/puig-api/search-product/${phrase}`);
      console.log(res);

      if (res.status !== 200) {
        setResult('No data found');
        setModal(true);
        setPending(false);
        return;
      }

      if (res.data?.length > 0) {
        setResult(
          <ul className={css.resultsList}>
            {res.data.map(p => (
              <li key={p.id} className={css.resultCard}>
                <Link to={`product/${p.id}`} className={css.resultLink}>
                  <img
                    src={p?.images[0] || puigLogo}
                    alt={p.title}
                    className={css.resultImage}
                  />
                  <p className={css.resultTitle}>
                    {currentLang === 'ru' && p.titleRu !== ''
                      ? p.titleRu
                      : currentLang === 'uk' && p.titleUk !== ''
                        ? p.titleUk
                        : p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        );
      } else {
        setResult('No data found');
      }

      setModal(true);
      setPending(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSearch();
        }}
        className={css.inputWrapper}
      >
        <input
          className={css.input}
          name="search"
          value={phrase}
          onChange={e => setPhrase(e.target.value)}
          placeholder="enter name or article"
        />
        <button className={css.searchBtn} type="submit" disabled={pending}>
          {pending ? (
            <ClockLoader size={30} color="#c04545" />
          ) : (
            <SearchIcon className={css.searchIcon} />
          )}
        </button>
      </form>
      <PopUp
        isOpen={modal}
        close={() => setModal(false)}
        body={<div className={css.searchResultWrapper}>{result}</div>}
      />
    </div>
  );
};
