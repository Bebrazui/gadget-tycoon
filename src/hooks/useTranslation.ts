
"use client";

import { useContext } from 'react';
import { LanguageContext, type Language } from '@/context/LanguageContext';
import translations from '@/lib/translations';

type TranslationKey = keyof typeof translations.en; // Assuming 'en' has all keys

export function useTranslation() {
  const { language, setLanguage } = useContext(LanguageContext);

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const langTranslations = translations[language] || translations.en;
    let translation = langTranslations[key as TranslationKey] || translations.en[key as TranslationKey] || key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  };

  return { t, language, setLanguage };
}
