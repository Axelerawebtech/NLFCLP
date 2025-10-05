import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Load saved language from localStorage on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage && ['en', 'hi', 'kn'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('selectedLanguage', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    isEnglish: currentLanguage === 'en',
    isHindi: currentLanguage === 'hi',
    isKannada: currentLanguage === 'kn'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};