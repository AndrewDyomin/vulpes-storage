import React from 'react';
import { useTranslation } from 'react-i18next';
import Select from 'react-select';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const langList = [
    { value: 'en', label: 'English' },
    { value: 'ru', label: 'Русский' },
    { value: 'uk', label: 'Українська' }
  ];

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div>
      <Select 
        name='lang' 
        onChange={(e) => (changeLanguage(e.value))}
        placeholder={i18n.t('currentLanguage')}
        options={langList}
      />
    </div>
  );
}