
"use client";

import React, { useState, useEffect } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DollarSign, Smartphone, Users, TrendingUp, HandCoins } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import type { GameStats } from '@/lib/types';
import { LOCAL_STORAGE_GAME_STATS_KEY, INITIAL_FUNDS } from '@/lib/types';

const defaultGameStats: GameStats = {
  totalFunds: INITIAL_FUNDS,
  phonesSold: 0,
  brandReputation: 0, 
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const [gameStats, setGameStats] = useState<GameStats>(defaultGameStats);

  useEffect(() => {
    const loadStats = () => {
      const storedStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
      if (storedStatsString) {
        try {
          const storedStats = JSON.parse(storedStatsString) as GameStats;
          if (typeof storedStats.totalFunds === 'number' && typeof storedStats.phonesSold === 'number') {
              setGameStats(storedStats);
          } else {
              localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
              setGameStats(defaultGameStats);
          }
        } catch (error) {
          console.error("Error parsing game stats from localStorage:", error);
          localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
          setGameStats(defaultGameStats);
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
        setGameStats(defaultGameStats);
      }
    };
    
    loadStats();

    const handleStatsUpdate = () => {
        loadStats(); // Reload stats when the event is dispatched
    };
    window.addEventListener('gameStatsChanged', handleStatsUpdate);
    return () => {
        window.removeEventListener('gameStatsChanged', handleStatsUpdate);
    };

  }, []);

  const brandReputationText = (rep: number) => {
    if (rep > 5) return t('statBrandReputationValue_good');
    if (rep < -5) return t('statBrandReputationValue_bad');
    return t('statBrandReputationValue');
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        title={t('welcomeTitle')}
        description={t('welcomeDescription')}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('statTotalFunds')} value={`$${gameStats.totalFunds.toLocaleString()}`} icon={DollarSign} description={t('statDescFunds')} />
        <StatCard title={t('statPhonesSold')} value={gameStats.phonesSold.toLocaleString()} icon={HandCoins} description={t('statDescPhonesSold')} />
        <StatCard title={t('statBrandReputation')} value={brandReputationText(gameStats.brandReputation)} icon={Users} description={t('statDescBrandRep')} />
        <StatCard title={t('statMarketTrend')} value="AI Cameras" icon={TrendingUp} description={t('statDescMarketTrend')} /> {/* Placeholder trend */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('quickActionsTitle')}</CardTitle>
            <CardDescription>{t('quickActionsDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button asChild variant="outline" size="lg">
              <Link href="/design">{t('btnDesignNewPhone')}</Link>
            </Button>
             <Button asChild variant="outline" size="lg">
              <Link href="/my-phones">{t('btnMyPhones')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/brand">{t('btnManageBrand')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/market">{t('btnAnalyzeMarket')}</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground sm:col-span-2">
              <Link href="/trends">{t('btnForecastTrends')}</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('nextBigIdeaTitle')}</CardTitle>
             <CardDescription>{t('nextBigIdeaDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt={t('phoneBlueprintAlt')}
              width={600} 
              height={400}
              className="rounded-lg object-cover aspect-video"
              data-ai-hint="phone blueprint"
            />
            <p className="text-sm text-muted-foreground mt-2">{t('nextBigIdeaPara')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
