
"use client";

import { useContext, useCallback } from 'react';
import { LanguageContext, type Language } from '@/context/LanguageContext';
import translations from '@/lib/translations';

type TranslationKey = keyof typeof translations.en;

export function useTranslation() {
  const { language, setLanguage, isLanguageInitialized } = useContext(LanguageContext);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    // Во время SSR или до того, как isLanguageInitialized станет true на клиенте, всегда используем 'en'.
    const effectiveLanguage = isLanguageInitialized ? language : 'en';
    
    const langTranslations = translations[effectiveLanguage] || translations.en;
    let translation = langTranslations[key as TranslationKey] || translations.en[key as TranslationKey] || key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  }, [language, isLanguageInitialized]);

  return { t, language, setLanguage, isLanguageInitialized };
}
