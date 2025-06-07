
"use client";

import type { Dispatch, ReactNode, SetStateAction} from 'react';
import React, { createContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ru';

interface LanguageContextType {
  language: Language;
  setLanguage: Dispatch<SetStateAction<Language>>;
  isLanguageInitialized: boolean; // Флаг, что клиент смонтирован и язык пытались загрузить
}

const defaultState: LanguageContextType = {
  language: 'en', // Всегда начинаем с 'en' для SSR и начальной гидратации
  setLanguage: () => {},
  isLanguageInitialized: false,
};

export const LanguageContext = createContext<LanguageContextType>(defaultState);

const LOCAL_STORAGE_LANGUAGE_KEY = 'gadget-tycoon-lang';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isLanguageInitialized, setIsLanguageInitialized] = useState(false);

  useEffect(() => {
    // Этот эффект запускается только на клиенте после первого монтирования
    setIsLanguageInitialized(true); // Отмечаем, что клиент смонтирован

    const storedLanguage = localStorage.getItem(LOCAL_STORAGE_LANGUAGE_KEY) as Language | null;
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'ru')) {
      // Устанавливаем язык из localStorage, если он валиден
      // Это вызовет ре-рендер, но уже после того, как isLanguageInitialized станет true
      setLanguageState(storedLanguage);
    }
    // Если в localStorage ничего нет или язык невалиден, останется 'en'
  }, []); // Пустой массив зависимостей гарантирует запуск только один раз после монтирования

  const setLanguage: Dispatch<SetStateAction<Language>> = (newLanguageAction) => {
    setLanguageState(prevLanguage => {
      const newLanguage = typeof newLanguageAction === 'function'
        ? (newLanguageAction as (prevState: Language) => Language)(prevLanguage)
        : newLanguageAction;

      if (isLanguageInitialized) { // Обновляем localStorage и document.lang только если клиент смонтирован
        if (newLanguage === 'en' || newLanguage === 'ru') {
          localStorage.setItem(LOCAL_STORAGE_LANGUAGE_KEY, newLanguage);
          document.documentElement.lang = newLanguage;
        }
      }
      return newLanguage;
    });
  };
  
  useEffect(() => {
    // Этот эффект синхронизирует document.documentElement.lang при изменении языка,
    // но только после инициализации на клиенте.
    if (isLanguageInitialized) {
        document.documentElement.lang = language;
    }
  }, [language, isLanguageInitialized])


  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLanguageInitialized }}>
      {children}
    </LanguageContext.Provider>
  );
}
