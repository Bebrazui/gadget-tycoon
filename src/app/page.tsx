
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DollarSign, Smartphone, Users, TrendingUp, HandCoins, Zap, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import type { GameStats, PhoneDesign, Transaction } from '@/lib/types';
import { 
    LOCAL_STORAGE_GAME_STATS_KEY, INITIAL_FUNDS, LOCAL_STORAGE_MY_PHONES_KEY,
    LOCAL_STORAGE_TRANSACTIONS_KEY, MARKET_SIMULATION_INTERVAL,
    MARKET_MAX_SALES_PER_PHONE_PER_INTERVAL, MARKET_SALE_CHANCE_PER_UNIT,
    LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY, MARKET_CATCH_UP_THRESHOLD_MINUTES,
    MARKET_MAX_CATCH_UP_INTERVALS,
    XP_PER_PHONE_SOLD, calculateXpToNextLevel
} from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from '@/components/ui/alert';

const defaultGameStats: GameStats = {
  totalFunds: INITIAL_FUNDS,
  phonesSold: 0,
  brandReputation: 0, 
  level: 1,
  xp: 0,
};

interface DisplayStats {
  totalFunds: string | null;
  phonesSold: string | null;
}

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [gameStats, setGameStats] = useState<GameStats>(defaultGameStats);
  const [displayStats, setDisplayStats] = useState<DisplayStats>({ totalFunds: null, phonesSold: null });
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const performMarketSimulation = useCallback((isCatchUp = false, catchUpIntervals = 1) => {
    let totalPhonesSoldThisCycle = 0;
    let totalRevenueThisCycle = 0;
    let salesNotificationsForCycle: string[] = [];
    let xpGainedThisCycle = 0;

    let currentPhonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    let currentPhones: PhoneDesign[] = currentPhonesString ? JSON.parse(currentPhonesString) : [];
    
    let currentStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let currentStats: GameStats = currentStatsString ? JSON.parse(JSON.parse(currentStatsString)) : { ...defaultGameStats };
    if (currentStats.level === undefined) currentStats.level = 1;
    if (currentStats.xp === undefined) currentStats.xp = 0;


    let currentTransactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let currentTransactions: Transaction[] = currentTransactionsString ? JSON.parse(currentTransactionsString) : [];

    let phonesModifiedInLoop = false;

    for (let i = 0; i < catchUpIntervals; i++) {
      let salesInThisInterval = false;
      currentPhones = currentPhones.map(phone => {
        if (phone.quantityListedForSale > 0) {
          let salesForThisPhoneInInterval = 0;
          for (let unit = 0; unit < phone.quantityListedForSale; unit++) {
            if (Math.random() < MARKET_SALE_CHANCE_PER_UNIT && salesForThisPhoneInInterval < MARKET_MAX_SALES_PER_PHONE_PER_INTERVAL) {
              salesForThisPhoneInInterval++;
            }
          }
          
          if (salesForThisPhoneInInterval > 0) {
            const revenueFromThisPhone = salesForThisPhoneInInterval * (phone.salePrice || 0);
            currentStats.totalFunds += revenueFromThisPhone;
            currentStats.phonesSold += salesForThisPhoneInInterval;
            
            phone.quantityListedForSale -= salesForThisPhoneInInterval;
            
            totalRevenueThisCycle += revenueFromThisPhone;
            totalPhonesSoldThisCycle += salesForThisPhoneInInterval;
            xpGainedThisCycle += XP_PER_PHONE_SOLD * salesForThisPhoneInInterval;
            salesInThisInterval = true;
            phonesModifiedInLoop = true;

            salesNotificationsForCycle.push(t('marketDaySaleNotification', {
              quantity: salesForThisPhoneInInterval,
              phoneName: phone.name,
              price: (phone.salePrice || 0).toFixed(2),
              totalRevenue: revenueFromThisPhone.toFixed(2)
            }));
            
            const saleTransaction: Transaction = {
              id: `txn_market_sale_${Date.now()}_${phone.id}_${salesForThisPhoneInInterval}_${i}`,
              date: new Date().toISOString(),
              description: `transactionMarketSaleOf{{quantity:${salesForThisPhoneInInterval},phoneName:${phone.name},price:${(phone.salePrice || 0).toFixed(2)}}}`,
              amount: revenueFromThisPhone,
              type: 'income',
            };
            currentTransactions.push(saleTransaction);
          }
        }
        return phone;
      });
    }

    if (xpGainedThisCycle > 0) {
      currentStats.xp += xpGainedThisCycle;
      toast({
        title: t('xpGainedNotification', { amount: xpGainedThisCycle }),
      });

      let xpToNext = calculateXpToNextLevel(currentStats.level);
      while (currentStats.xp >= xpToNext) {
        currentStats.level++;
        currentStats.xp -= xpToNext;
        xpToNext = calculateXpToNextLevel(currentStats.level);
        toast({
          title: t('levelUpNotificationTitle'),
          description: t('levelUpNotificationDesc', { level: currentStats.level }),
        });
      }
    }

    if (phonesModifiedInLoop || xpGainedThisCycle > 0) {
      localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(currentPhones));
      localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
      localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
      
      setGameStats(currentStats); 
      setDisplayStats({ 
          totalFunds: `$${currentStats.totalFunds.toLocaleString(language)}`,
          phonesSold: currentStats.phonesSold.toLocaleString(language),
      });
      window.dispatchEvent(new CustomEvent('myPhonesChanged'));
      window.dispatchEvent(new CustomEvent('gameStatsChanged'));
      window.dispatchEvent(new CustomEvent('transactionsChanged'));
    }
    
    salesNotificationsForCycle.forEach(notification => {
      toast({
        title: t('marketDaySummaryTitle'),
        description: notification,
      });
    });

    if (!isCatchUp && totalPhonesSoldThisCycle === 0 && currentPhones.every(p => p.quantityListedForSale === 0) && currentPhones.length > 0) {
      // Only show "no phones listed" if not a catch-up and some phones exist but none are listed
       if (currentPhones.length > 0 && currentPhones.every(p => p.quantityListedForSale === 0)) {
        toast({
            title: t('marketDaySummaryTitle'),
            description: t('marketDayNoPhonesListed'),
        });
      }
    }
    localStorage.setItem(LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY, Date.now().toString());
  }, [t, language, toast]);


  useEffect(() => {
    const loadStats = () => {
      const storedStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
      let currentStats: GameStats = { ...defaultGameStats };
      if (storedStatsString) {
        try {
          const parsedStats = JSON.parse(storedStatsString) as GameStats;
          if (typeof parsedStats.totalFunds === 'number' && typeof parsedStats.phonesSold === 'number') {
              currentStats = {
                ...defaultGameStats, // ensure all fields from default are present
                ...parsedStats,     // then override with stored values
              };
          } else { 
              localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
          }
        } catch (error) {
          console.error("Error parsing game stats from localStorage:", error);
          localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
      }
      // Ensure level and xp are initialized
      if (currentStats.level === undefined) currentStats.level = 1;
      if (currentStats.xp === undefined) currentStats.xp = 0;

      setGameStats(currentStats);
      setDisplayStats({
        totalFunds: `$${currentStats.totalFunds.toLocaleString(language)}`,
        phonesSold: currentStats.phonesSold.toLocaleString(language),
      });
    };
    
    loadStats();

    const handleStatsUpdate = () => {
        loadStats(); 
    };
    window.addEventListener('gameStatsChanged', handleStatsUpdate);

    // Catch-up simulation
    const lastSimTime = localStorage.getItem(LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY);
    if (lastSimTime) {
      const timeDiffMs = Date.now() - parseInt(lastSimTime, 10);
      const timeDiffMinutes = timeDiffMs / (1000 * 60);
      if (timeDiffMinutes > MARKET_CATCH_UP_THRESHOLD_MINUTES) {
        const intervalsToCatchUp = Math.min(
          Math.floor(timeDiffMs / MARKET_SIMULATION_INTERVAL),
          MARKET_MAX_CATCH_UP_INTERVALS
        );
        if (intervalsToCatchUp > 0) {
          console.log(`Performing catch-up simulation for ${intervalsToCatchUp} intervals.`);
          performMarketSimulation(true, intervalsToCatchUp);
        }
      }
    } else {
      // First time, set last sim time
      localStorage.setItem(LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY, Date.now().toString());
    }


    // Setup interval for regular simulation
    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = setInterval(() => {
      performMarketSimulation(false, 1);
    }, MARKET_SIMULATION_INTERVAL);
    

    return () => {
        window.removeEventListener('gameStatsChanged', handleStatsUpdate);
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };

  }, [language, performMarketSimulation]);


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
        <StatCard 
            title={t('statTotalFunds')} 
            value={displayStats.totalFunds ?? t('loadingFunds')} 
            icon={DollarSign} 
            description={t('statDescFunds')} 
        />
        <StatCard 
            title={t('statPhonesSold')} 
            value={displayStats.phonesSold ?? t('loadingSold')} 
            icon={HandCoins} 
            description={t('statDescPhonesSold')} 
        />
        <StatCard 
            title={t('statBrandReputation')} 
            value={brandReputationText(gameStats.brandReputation)} 
            icon={Users} 
            description={t('statDescBrandRep')} 
        />
        <StatCard 
            title={t('statMarketTrend')} 
            value={t('statMarketTrendValue')} 
            icon={TrendingUp} 
            description={t('statDescMarketTrend')} 
        />
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {t('marketSimulationActive')}
        </AlertDescription>
      </Alert>

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
             <Button asChild variant="outline" size="lg">
                <Link href="/procurement">{t('btnClientContracts')}</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground sm:col-span-2">
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

    