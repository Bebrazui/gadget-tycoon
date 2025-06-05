
"use client";

import type { Dispatch, ReactNode, SetStateAction} from 'react';
import React, { createContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
}

const defaultState: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
};

export const LanguageContext = createContext<LanguageContextType>(defaultState);

const LOCAL_STORAGE_LANGUAGE_KEY = 'gadget-tycoon-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Default to 'en' to avoid hydration issues initially

  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedLanguage = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'ru')) {
      setLanguage(storedLanguage);
    } else {
      // Set default if nothing valid is stored, or to ensure state sync if it was 'en' already
      setLanguage('en'); 
      localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, 'en');
    }
  }, []);

  useEffect(() => {
    // This effect runs when language changes, to update localStorage
    // It also runs on initial mount if language was changed by the first useEffect
    if (language === 'en' || language === 'ru') { // ensure valid before setting
        localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, language);
        document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
