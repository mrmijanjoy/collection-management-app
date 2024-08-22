import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-bootstrap';
import { FaGlobe, FaLanguage  } from 'react-icons/fa'; 


const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;

  const handleLanguageChange = () => {
    const newLanguage = currentLanguage === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <div className="language-switcher">
      <Button 
        variant="primary" 
        onClick={handleLanguageChange} 
        className="language-button"
      >
        {currentLanguage === 'en' ? <FaLanguage /> : <FaGlobe />}
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
