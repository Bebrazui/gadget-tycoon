
"use client";

import type { Dispatch, ReactNode, SetStateAction} from 'react';
import React, { createContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  isLanguageInitialized: boolean; // New flag
}

const defaultState: LanguageContextType = {
  language: 'en',
  setLanguage: () => {},
  isLanguageInitialized: false, // Default to false
};

export const LanguageContext = createContext<LanguageContextType>(defaultState);

const LOCAL_STORAGE_LANGUAGE_KEY = 'gadget-tycoon-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en'); // Default to 'en'
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false); // New state

  useEffect(() => {
    // This effect runs only on the client after hydration
    const storedLanguage = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'ru')) {
      setLanguage(storedLanguage);
    } else {
      // Set default if nothing valid is stored, or to ensure state sync if it was 'en' already
      // localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, 'en'); // Will be set by the other useEffect
    }
    setIsLanguageInitialized(true); // Signal that client-side language loading attempt is complete
  }, []);

  useEffect(() => {
    // This effect runs when language changes or after initialization
    if (isLanguageInitialized) { // Only update localStorage and document.lang if initialized
        if (language === 'en' || language === 'ru') { // ensure valid before setting
            localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, language);
            document.documentElement.lang = language;
        }
    }
  }, [language, isLanguageInitialized]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}
