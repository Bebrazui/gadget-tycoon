
"use client";

import { useContext, useCallback } from 'react'; // Import useCallback
import { LanguageContext, type Language } from '@/context/LanguageContext';
import translations from '@/lib/translations';

type TranslationKey = keyof typeof translations.en; // Assuming 'en' has all keys

export function useTranslation() {
  const { language, setLanguage, isLanguageInitialized } = useContext(LanguageContext); // Get the flag

  // Memoize the t function
  const t = useCallback((key: string, replacements?: Record<string, string | number>): string => {
    // If not initialized on client (during first render/hydration), always use 'en' to match server render.
    // `typeof window !== 'undefined'` ensures this logic is client-side.
    const effectiveLanguage = typeof window !== 'undefined' && isLanguageInitialized ? language : 'en';
    const langTranslations = translations[effectiveLanguage] || translations.en;
    let translation = langTranslations[key as TranslationKey] || translations.en[key as TranslationKey] || key;

    if (replacements) {
      Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(replacements[placeholder]));
      });
    }
    return translation;
  }, [language, isLanguageInitialized]); // `t` will only change when `language` or `isLanguageInitialized` changes

  return { t, language, setLanguage, isLanguageInitialized }; // Expose isLanguageInitialized if needed elsewhere
}
