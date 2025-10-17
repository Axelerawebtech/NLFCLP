import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

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
  const [isClient, setIsClient] = useState(false);

  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load saved language from localStorage on component mount (client-side only)
  useEffect(() => {
    if (isClient) {
      const savedLanguage = localStorage.getItem('selectedLanguage');
      if (savedLanguage && ['en', 'hi', 'kn'].includes(savedLanguage)) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, [isClient]);

  // Save language to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('selectedLanguage', currentLanguage);
    }
  }, [currentLanguage, isClient]);

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
  };

  const value = {
    currentLanguage,
    language: currentLanguage, // Add alias for compatibility
    changeLanguage,
    translations,
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