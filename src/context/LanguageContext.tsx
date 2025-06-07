
"use client";

import type { Dispatch, ReactNode, SetStateAction} from 'react';
import React, { createContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  isLanguageInitialized: boolean; 
}

const defaultState: LanguageContextType = {
  language: 'en', 
  setLanguage: () => {},
  isLanguageInitialized: false,
};

export const LanguageContext = createContext<LanguageContextType>(defaultState);

const LOCAL_STORAGE_LANGUAGE_KEY = 'gadget-tycoon-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

  useEffect(() => {
    // This effect runs only on the client after the first mount
    const storedLanguage = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'ru')) {
      setLanguageState(storedLanguage);
      document.documentElement.lang = storedLanguage;
    } else {
      // If no valid language in localStorage, 'en' remains, set it on <html>
      document.documentElement.lang = 'en';
    }
    setIsLanguageInitialized(true); 
  }, []); 

  const setLanguage: Dispatch<SetStateAction<Language>> = (newLanguageAction) => {
    setLanguageState(prevLanguage => {
      const newLanguage = typeof newLanguageAction === 'function'
        ? (newLanguageAction as (prevState: Language) => Language)(prevLanguage)
        : newLanguageAction;

      if (newLanguage === 'en' || newLanguage === 'ru') {
        // We only update localStorage and document.lang if on client and initialized
        // isLanguageInitialized check ensures this runs after the initial effect
        if (typeof window !== 'undefined' && isLanguageInitialized) { 
          localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, newLanguage);
          document.documentElement.lang = newLanguage;
        }
      }
      return newLanguage;
    });
  };
  
  // This effect handles subsequent language changes after initialization
  useEffect(() => {
    if (isLanguageInitialized && typeof window !== 'undefined') {
        document.documentElement.lang = language;
    }
  }, [language, isLanguageInitialized]);


  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}
