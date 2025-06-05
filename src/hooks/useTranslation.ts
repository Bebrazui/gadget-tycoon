
"use client";

import { useContext, useCallback } from 'react'; // Import useCallback
import { LanguageContext, type Language } from '@/context/LanguageContext';
import translations from '@/lib/translations';

type TranslationKey = keyof typeof translations.en; // Assuming 'en' has all keys

export function useTranslation() {
  const { language, setLanguage } = useContext(LanguageContext);

  // Memoize the t function
  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    const langTranslations = translations[language] || translations.en;
    let translation = langTranslations[key as TranslationKey] || translations.en[key as TranslationKey] || key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  }, [language]); // `t` will only change when `language` changes

  return { t, language, setLanguage };
}
