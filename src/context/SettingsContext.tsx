
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { GameSettings, GameDifficulty } from '@/lib/types';
import { LOCAL_STORAGE_GAME_SETTINGS_KEY } from '@/lib/types';

interface SettingsContextType {
  settings: GameSettings;
  setSettings: Dispatch<SetStateAction<GameSettings>>;
  isOnlineMode: boolean;
  toggleOnlineMode: () => void;
  setDifficulty: (difficulty: GameDifficulty) => void;
}

const defaultSettings: GameSettings = {
  useOnlineFeatures: true, // Default to online mode
  difficulty: 'normal', // Default difficulty
};

const defaultState: SettingsContextType = {
  settings: defaultSettings,
  setSettings: () => {},
  isOnlineMode: true,
  toggleOnlineMode: () => {},
  setDifficulty: () => {},
};

export const SettingsContext = createContext<SettingsContextType>(defaultState);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedSettingsString = localStorage.getItem(LOCAL_STORAGE_GAME_SETTINGS_KEY);
    if (storedSettingsString) {
      try {
        const storedSettings = JSON.parse(storedSettingsString) as Partial<GameSettings>;
        // Ensure the loaded settings have the expected boolean property and valid difficulty
        const validatedSettings: GameSettings = { ...defaultSettings };
        if (typeof storedSettings.useOnlineFeatures === 'boolean') {
          validatedSettings.useOnlineFeatures = storedSettings.useOnlineFeatures;
        }
        if (storedSettings.difficulty && ['easy', 'normal', 'hard'].includes(storedSettings.difficulty)) {
          validatedSettings.difficulty = storedSettings.difficulty;
        }
        setSettings(validatedSettings);
      } catch (error) {
        console.error("Error parsing game settings from localStorage. Using defaults.", error);
        localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(defaultSettings));
        setSettings(defaultSettings);
      }
    } else {
      // No settings stored, use defaults and save
      localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(defaultSettings));
    }
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    // Save settings whenever they change, but only after initialization
    if (isInitialized) {
      localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(settings));
    }
  }, [settings, isInitialized]);

  const isOnlineMode = settings.useOnlineFeatures;

  const toggleOnlineMode = () => {
    setSettings(prevSettings => ({
      ...prevSettings,
      useOnlineFeatures: !prevSettings.useOnlineFeatures,
    }));
  };

  const setDifficulty = (difficulty: GameDifficulty) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      difficulty: difficulty,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isOnlineMode, toggleOnlineMode, setDifficulty }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
