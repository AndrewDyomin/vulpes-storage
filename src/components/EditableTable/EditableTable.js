import { useState, useEffect } from 'react';
import css from './EditableTable.module.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { ClockLoader } from 'react-spinners';

export const EditableTable = ({ send }) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState([{ article: '', count: '' }]);
  const [pdfActive, setPdfActive] = useState(false);
  const [filePending, setFilePending] = useState(false);
  const [invoice, setInvoice] = useState(null)

  // const checkProducts = async (data) => {
  //   for (let i = 0; i < data.length; i++) {
  //     const row = data[i];
  //     if (row.article?.length > 1 && row.check === undefined) {
  //       try {
  //         const res = await axios.post('/products/byarticle', { article: row.article });
  //         const check = res?.data?.product ? 1 : 0;

  //         setRows(prev => {
  //           const newRows = [...prev];
  //           newRows[i] = { ...newRows[i], check };
  //           return newRows;
  //         });
  //       } catch {
  //         setRows(prev => {
  //           const newRows = [...prev];
  //           newRows[i] = { ...newRows[i], check: 0 };
  //           return newRows;
  //         });
  //       }
  //     }
  //   }
  // };

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

  const activatePdf = () => {
    setPdfActive(true)
  }

  const addPdf = async(file) => {
    if (file.type !== "application/pdf") {
      alert("Пожалуйста, выберите PDF-файл.");
      return;
    }
    setFilePending(true);
    const formData = new FormData();
    formData.append('invoice', file);
    const response = await axios.post('/files/invoiceParser/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    setInvoice(response.data.invoice);
    setFilePending(false);
  }

  useEffect(() => {
    if (invoice?.items.length > 0) {
      const result = invoice.items.map(item => {
        return {article: item.article, count: item.count, price: item.price, position: item.position}
      })
      const newRows = [...result, { article: '', count: '' }];
      setRows(newRows);
      // checkProducts(newRows);
    }
  }, [invoice])

  // useEffect(() => {
  //   checkProducts(rows);
  // }, [rows]);

  return (
    <div className={css.tableWrapper}>
      <div className={css.pdfWrapper}>
        <button onClick={activatePdf} className={`${css.addPdfButton} ${pdfActive && css.active}`}>
          {pdfActive && <input onChange={e => addPdf(e.target.files[0])} className={css.addFile} type='file'/>}
          + PDF
        </button>
      </div>
      {invoice?.name && <p>{invoice.name}: {invoice.total}EUR</p>}
      {filePending && <ClockLoader color="#c04545" />}
      <table className={css.table}>
        <thead>
          <tr>
            <th>{t('article')}</th>
            <th>{t('count')}</th>
          </tr>
        </thead>
        <tbody onPaste={handlePaste}>
          {rows.map((row, index) => (
            <tr key={index}>
              <td>
                <input
                  className={`${css.tableInput} ${row?.article === '' && css.emptyTd}`}
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
      <div>
          <p className={css.description}>*<span className={css.greensquere}></span> - ok.</p>
          <p className={css.description}>*<span className={css.redsquere}></span> - {t('this item is not found')}.</p>
      </div>
      <button className={`${css.saveButton} ${rows?.length > 1 && css.active}`} onClick={() => {if(rows?.length > 1){send(rows, invoice)}}}>{t('download')}</button>
    </div>
  );
};
