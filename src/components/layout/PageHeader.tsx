
"use client";

import { useState, useEffect, useCallback } from 'react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from '@/context/LanguageContext';
import { Progress } from '@/components/ui/progress';
import type { GameStats } from '@/lib/types';
import { LOCAL_STORAGE_GAME_STATS_KEY, calculateXpToNextLevel } from '@/lib/types';

const navItemTitleKeys: Record<string, string> = {
  '/': 'pageTitleDashboard',
  '/design': 'pageTitleDesign',
  '/my-phones': 'pageTitleMyPhones',
  '/brand': 'pageTitleBrand',
  '/market': 'pageTitleMarket',
  '/financials': 'pageTitleFinancials',
  '/trends': 'pageTitleTrends',
  '/procurement': 'pageTitleProcurement',
  '/rd': 'pageTitleRD',
  '/settings': 'pageTitleSettings',
};

const defaultInitialHeaderStats: Pick<GameStats, 'level' | 'xp'> = {
  level: 1,
  xp: 0,
};

export function PageHeader() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  
  const titleKey = navItemTitleKeys[pathname] || 'pageTitleDashboard';
  const title = t(titleKey);

  const [level, setLevel] = useState(defaultInitialHeaderStats.level);
  const [xp, setXp] = useState(defaultInitialHeaderStats.xp);
  const [xpToNext, setXpToNext] = useState(calculateXpToNextLevel(defaultInitialHeaderStats.level));
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);

  const loadStats = useCallback(() => {
    const storedStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let statsToSet: Pick<GameStats, 'level' | 'xp'> = { ...defaultInitialHeaderStats };

    if (storedStatsString) {
      try {
        const parsedStats = JSON.parse(storedStatsString) as Partial<GameStats>;
        statsToSet = {
          level: parsedStats.level ?? defaultInitialHeaderStats.level,
          xp: parsedStats.xp ?? defaultInitialHeaderStats.xp,
        };
      } catch (error) {
        console.error("Error parsing game stats in PageHeader:", error);
        // Keep defaultInitialHeaderStats if parsing fails
      }
    }
    setLevel(statsToSet.level);
    setXp(statsToSet.xp);
    setXpToNext(calculateXpToNextLevel(statsToSet.level));
    setIsStatsLoaded(true);
  }, []);

  useEffect(() => {
    loadStats(); // Initial load
    
    const handleGameStatsChanged = () => {
      loadStats();
    };

    window.addEventListener('gameStatsChanged', handleGameStatsChanged);
    return () => {
      window.removeEventListener('gameStatsChanged', handleGameStatsChanged);
    };
  }, [loadStats]);

  const progressPercentage = xpToNext > 0 ? Math.min((xp / xpToNext) * 100, 100) : 0;

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold font-headline">{title}</h1>
      <div className="ml-auto flex items-center gap-6">
        {isStatsLoaded && (
          <div className="flex items-center gap-3 border border-border rounded-md p-2 shadow-sm">
            <span className="font-medium text-sm">{t('levelLabelShort')}: {level}</span>
            <div className="flex flex-col items-center w-28">
              <Progress value={progressPercentage} className="h-2.5 w-full rounded-full" />
              <span className="text-xs text-muted-foreground mt-0.5">{xp}/{xpToNext} {t('xpLabel')}</span>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
           <Languages className="h-5 w-5 text-muted-foreground" />
           <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[100px] h-9 text-xs" aria-label={t('languageLabel')}>
              <SelectValue placeholder={t('languageLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" aria-label={t('logOut')}>
           <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
