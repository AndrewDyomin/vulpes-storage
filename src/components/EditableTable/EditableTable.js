import { useState, useEffect } from 'react';
import css from './EditableTable.module.css';
import axios from 'axios';

export const EditableTable = ({ send }) => {
  const [rows, setRows] = useState([{ article: '', count: '' }]);

  const handlePaste = e => {
    const clipboard = e.clipboardData.getData('Text');
    const lines = clipboard.trim().split('\n');
    const newRows = lines.map(line => {
      const [article, count] = line.trim().split(/\s+/);
      return { article: article || '', count: count || '' };
    });

    setRows(prev => {
      const merged = [...prev.slice(0, -1), ...newRows];
      return [...merged, { article: '', count: '' }];
    });

    e.preventDefault();
  };

  const handleChange = (index, field, value) => {
    const updated = [...rows];
    updated[index][field] = value;
    setRows(() => {
      if (
        index === rows.length - 1 &&
        (updated[index].article !== '' || updated[index].count !== '')
      ) {
        return [...updated, { article: '', count: '' }];
      }
      return updated;
    });
  };

  useEffect(() => {
    const checkProducts = async () => {
    const updatedRows = [];

    for (const row of rows) {
      if (!row.check && row.article?.length > 1) {
        try {
          const res = await axios.post('/products/byarticle', { article: row.article });
          updatedRows.push({ ...row, check: res?.data?.product ? 1 : 0 });
        } catch {
          updatedRows.push({ ...row, check: 0 });
        }
      } else {
        updatedRows.push(row);
      }
    }
    if (JSON.stringify(rows) !== JSON.stringify(updatedRows)) {
        setRows(updatedRows);
    }
    };
    checkProducts();
  }, [rows]);

  return (
    <div className={css.tableWrapper}>
      <table className={css.table}>
        <thead>
          <tr>
            <th>Артикул</th>
            <th>Кол-во</th>
          </tr>
        </thead>
        <tbody onPaste={handlePaste}>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  className={`${css.tableInput} ${
                    row?.check === 1 ? css.greenTd : css.redTd
                  } ${row?.article === '' && css.emptyTd}`}
                  type="text"
                  value={row.article}
                  onChange={e => handleChange(index, 'article', e.target.value)}
                />
              </td>
              <td>
                <input
                  className={css.tableInput}
                  type="text"
                  value={row.count}
                  onChange={e => handleChange(index, 'count', e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => send(rows)}>send</button>
    </div>
  );
};
