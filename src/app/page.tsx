
"use client";

import React, { useState, useEffect } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DollarSign, Smartphone, Users, TrendingUp, HandCoins, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";
import type { GameStats, PhoneDesign, Transaction } from '@/lib/types';
import { 
    LOCAL_STORAGE_GAME_STATS_KEY, INITIAL_FUNDS, LOCAL_STORAGE_MY_PHONES_KEY,
    LOCAL_STORAGE_TRANSACTIONS_KEY, MARKET_SALE_CHANCE, MARKET_MAX_SALES_PER_PHONE_PER_DAY
} from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const defaultGameStats: GameStats = {
  totalFunds: INITIAL_FUNDS,
  phonesSold: 0,
  brandReputation: 0, 
};

export default function DashboardPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [gameStats, setGameStats] = useState<GameStats>(defaultGameStats);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const loadStats = () => {
      const storedStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
      if (storedStatsString) {
        try {
          const storedStats = JSON.parse(storedStatsString) as GameStats;
          // Basic validation of stored stats
          if (typeof storedStats.totalFunds === 'number' && typeof storedStats.phonesSold === 'number') {
              setGameStats(storedStats);
          } else { // Invalid stats, reset to default
              localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
              setGameStats(defaultGameStats);
          }
        } catch (error) {
          console.error("Error parsing game stats from localStorage:", error);
          localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
          setGameStats(defaultGameStats);
        }
      } else {
        // No stats stored, initialize with defaults
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
        setGameStats(defaultGameStats);
      }
    };
    
    loadStats();

    // Listen for global game stats changes
    const handleStatsUpdate = () => {
        loadStats(); // Reload stats when the event is dispatched
    };
    window.addEventListener('gameStatsChanged', handleStatsUpdate);
    return () => {
        window.removeEventListener('gameStatsChanged', handleStatsUpdate);
    };

  }, []);

  const simulateMarketDay = () => {
    setIsSimulating(true);
    let phonesSoldThisDay = 0;
    let totalRevenueThisDay = 0;
    let salesNotifications: string[] = [];

    const phonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    let phones: PhoneDesign[] = phonesString ? JSON.parse(phonesString) : [];
    
    const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let currentStats: GameStats = statsString ? JSON.parse(statsString) : { ...defaultGameStats };

    const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let transactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];

    if (phones.every(p => (p.quantityListedForSale || 0) === 0)) {
        toast({
            title: t('marketDaySummaryTitle'),
            description: t('marketDayNoPhonesListed'),
        });
        setIsSimulating(false);
        return;
    }

    phones = phones.map(phone => {
      if ((phone.quantityListedForSale || 0) > 0) {
        let salesForThisPhone = 0;
        // Simulate sales for each listed unit with a chance
        for (let i = 0; i < (phone.quantityListedForSale || 0) && salesForThisPhone < MARKET_MAX_SALES_PER_PHONE_PER_DAY; i++) {
          if (Math.random() < MARKET_SALE_CHANCE) {
            salesForThisPhone++;
          }
        }

        if (salesForThisPhone > 0) {
          const revenueFromThisPhone = salesForThisPhone * (phone.salePrice || 0);
          currentStats.totalFunds += revenueFromThisPhone;
          currentStats.phonesSold += salesForThisPhone;
          phone.quantityListedForSale = (phone.quantityListedForSale || 0) - salesForThisPhone;
          
          totalRevenueThisDay += revenueFromThisPhone;
          phonesSoldThisDay += salesForThisPhone;

          const saleTransaction: Transaction = {
            id: `txn_market_sale_${Date.now()}_${phone.id}_${salesForThisPhone}`,
            date: new Date().toISOString(),
            description: t('transactionMarketSaleOf', { quantity: salesForThisPhone, phoneName: phone.name, price: (phone.salePrice || 0).toFixed(2) }),
            amount: revenueFromThisPhone,
            type: 'income',
          };
          transactions.push(saleTransaction);
          
          salesNotifications.push(t('marketDaySaleNotification', {
            quantity: salesForThisPhone,
            phoneName: phone.name,
            price: (phone.salePrice || 0).toFixed(2),
            totalRevenue: revenueFromThisPhone.toFixed(2)
          }));
        }
      }
      return phone;
    });

    localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(phones));
    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(transactions));
    
    setGameStats(currentStats); // Update local state for immediate UI refresh
    window.dispatchEvent(new CustomEvent('myPhonesChanged'));
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));
    window.dispatchEvent(new CustomEvent('transactionsChanged'));

    if (salesNotifications.length > 0) {
      salesNotifications.forEach(notification => {
        toast({
          title: t('marketDaySummaryTitle'),
          description: notification,
        });
      });
    } else {
      toast({
        title: t('marketDaySummaryTitle'),
        description: t('marketDayNoSales'),
      });
    }
    setIsSimulating(false);
  };


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
            <Button asChild variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground sm:col-span-2">
              <Link href="/trends">{t('btnForecastTrends')}</Link>
            </Button>
            <Button 
                onClick={simulateMarketDay} 
                variant="secondary" 
                size="lg" 
                className="sm:col-span-2"
                disabled={isSimulating}
            >
              {isSimulating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Zap className="mr-2 h-5 w-5"/>}
              {t('btnSimulateMarketDay')}
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
