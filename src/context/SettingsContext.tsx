
"use client";

import type { Dispatch, ReactNode, SetStateAction } from 'react';
import React, { createContext, useState, useEffect, useContext } from 'react';
import type { GameSettings } from '@/lib/types';
import { LOCAL_STORAGE_GAME_SETTINGS_KEY } from '@/lib/types';

interface SettingsContextType {
  settings: GameSettings;
  setSettings: Dispatch<SetStateAction<GameSettings>>;
  isOnlineMode: boolean;
  toggleOnlineMode: () => void;
}

const defaultSettings: GameSettings = {
  useOnlineFeatures: true, // Default to online mode
};

const defaultState: SettingsContextType = {
  settings: defaultSettings,
  setSettings: () => {},
  isOnlineMode: true,
  toggleOnlineMode: () => {},
};

export const SettingsContext = createContext<SettingsContextType>(defaultState);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettings>(defaultSettings);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedSettingsString = localStorage.getItem(LOCAL_STORAGE_GAME_SETTINGS_KEY);
    if (storedSettingsString) {
      try {
        const storedSettings = JSON.parse(storedSettingsString) as GameSettings;
        // Ensure the loaded settings have the expected boolean property
        if (typeof storedSettings.useOnlineFeatures === 'boolean') {
          setSettings(storedSettings);
        } else {
          // If malformed, reset to default and save
          localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(defaultSettings));
          setSettings(defaultSettings);
        }
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

  return (
    <SettingsContext.Provider value={{ settings, setSettings, isOnlineMode, toggleOnlineMode }}>
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
