// src/context/LanguageContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import vi from "../locales/vi";
import en from "../locales/en";

const translations = { vi, en };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    () => localStorage.getItem("app_language") || "vi"
  );

  const switchLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem("app_language", lang);
    }
  }, []);

  const t = useCallback(
    (key) => {
      const keys = key.split(".");
      let value = translations[language];
      for (const k of keys) {
        if (value === undefined) return key;
        value = value[k];
      }
      return value ?? key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
