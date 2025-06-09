
"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DollarSign, Smartphone, Users, TrendingUp, HandCoins, Zap, Info, Bell, Volume2, AlertTriangle, TrendingDown as TrendingDownIcon, CheckCircle2 as CheckCircle2Icon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslation } from '@/hooks/useTranslation';
import type { GameStats, PhoneDesign, Transaction, GameSettings, ActiveMarketingCampaign, MarketingCampaignType, ActiveGameEvent, GameEventDefinition } from '@/lib/types';
import {
    LOCAL_STORAGE_GAME_STATS_KEY, INITIAL_FUNDS, LOCAL_STORAGE_MY_PHONES_KEY,
    LOCAL_STORAGE_TRANSACTIONS_KEY, MARKET_SIMULATION_INTERVAL,
    MARKET_MAX_SALES_PER_PHONE_PER_INTERVAL, BASE_MARKET_SALE_CHANCE_PER_UNIT,
    LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY, MARKET_CATCH_UP_THRESHOLD_MINUTES,
    MARKET_MAX_CATCH_UP_INTERVALS,
    XP_PER_PHONE_SOLD, calculateXpToNextLevel,
    MONEY_BONUS_PER_LEVEL_BASE, MONEY_BONUS_FIXED_AMOUNT, LOCAL_STORAGE_GAME_SETTINGS_KEY,
    DIFFICULTY_SALE_CHANCE_MODIFIERS, LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY, AVAILABLE_MARKETING_CAMPAIGNS,
    XP_FOR_STARTING_MARKETING_CAMPAIGN,
    LOCAL_STORAGE_ACTIVE_EVENTS_KEY, AVAILABLE_GAME_EVENTS, MAX_ACTIVE_GAME_EVENTS, GAME_EVENT_PROBABILITY_PER_SIMULATION
} from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { checkAllAchievements } from '@/lib/achievements';


const defaultGameStats: GameStats = {
  totalFunds: INITIAL_FUNDS,
  phonesSold: 0,
  brandReputation: 0,
  level: 1,
  xp: 0,
};

const defaultGameSettings: GameSettings = {
  useOnlineFeatures: true,
  difficulty: 'normal',
};

interface DisplayStats {
  totalFunds: string | null;
  phonesSold: string | null;
}

export default function DashboardPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [gameStats, setGameStats] = useState<GameStats>(defaultGameStats);
  const [gameSettings, setGameSettings] = useState<GameSettings>(defaultGameSettings);
  const [displayStats, setDisplayStats] = useState<DisplayStats>({ totalFunds: null, phonesSold: null });
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<ActiveMarketingCampaign | null>(null);
  const [activeGameEvents, setActiveGameEvents] = useState<ActiveGameEvent[]>([]);


  const performMarketSimulation = useCallback((isCatchUp = false, catchUpIntervals = 1) => {
    let totalPhonesSoldThisCycle = 0;
    let totalRevenueThisCycle = 0;
    let salesNotificationsForCycle: { title: string, description: string, icon?: React.ReactNode }[] = [];
    let xpGainedThisCycle = 0;
    let stateModifiedInLoop = false;

    let currentPhonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    let currentPhones: PhoneDesign[] = currentPhonesString ? JSON.parse(currentPhonesString) : [];

    let currentStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let currentStats: GameStats = currentStatsString ? JSON.parse(currentStatsString) : { ...defaultGameStats };
    if (currentStats.level === undefined) currentStats.level = 1;
    if (currentStats.xp === undefined) currentStats.xp = 0;
    if (currentStats.brandReputation === undefined) currentStats.brandReputation = 0;

    const currentSettingsString = localStorage.getItem(LOCAL_STORAGE_GAME_SETTINGS_KEY);
    const currentSettings: GameSettings = currentSettingsString ? JSON.parse(currentSettingsString) : defaultGameSettings;

    let currentTransactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let currentTransactions: Transaction[] = currentTransactionsString ? JSON.parse(currentTransactionsString) : [];

    // Handle Active Game Events
    let currentActiveEventsString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_EVENTS_KEY);
    let currentActiveEvents: ActiveGameEvent[] = currentActiveEventsString ? JSON.parse(currentActiveEventsString) : [];
    
    currentActiveEvents = currentActiveEvents.map(event => ({ ...event, remainingDays: event.remainingDays - catchUpIntervals }))
      .filter(event => {
        if (event.remainingDays < 0) {
          toast({ title: t('gameEventEndedTitle'), description: t(event.definition.titleKey) + " " + t(event.definition.descriptionKey) });
          stateModifiedInLoop = true;
          return false;
        }
        return true;
      });

    // Potentially trigger new game events
    if (!isCatchUp && currentActiveEvents.length < MAX_ACTIVE_GAME_EVENTS && Math.random() < GAME_EVENT_PROBABILITY_PER_SIMULATION * catchUpIntervals) {
        const availableToTrigger = AVAILABLE_GAME_EVENTS.filter(def => !currentActiveEvents.some(active => active.eventId === def.id));
        if (availableToTrigger.length > 0) {
            const newEventDef = availableToTrigger[Math.floor(Math.random() * availableToTrigger.length)];
            const newActiveEvent: ActiveGameEvent = { eventId: newEventDef.id, remainingDays: newEventDef.durationDays, definition: newEventDef };
            currentActiveEvents.push(newActiveEvent);
            stateModifiedInLoop = true;
            toast({
                title: t('gameEventStartedTitle'),
                description: `${t(newEventDef.titleKey)}: ${t(newEventDef.descriptionKey)} (${t('gameEventDurationLabel', {days: newEventDef.durationDays})})`,
                variant: newEventDef.isNegative ? "destructive" : "default"
            });
        }
    }
    
    if (stateModifiedInLoop || currentActiveEvents.length !== (currentActiveEventsString ? JSON.parse(currentActiveEventsString).length : 0)) {
        localStorage.setItem(LOCAL_STORAGE_ACTIVE_EVENTS_KEY, JSON.stringify(currentActiveEvents));
        setActiveGameEvents([...currentActiveEvents]); // Update state for UI
    }


    // Handle active marketing campaign
    let campaignString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY);
    let currentActiveCampaign: ActiveMarketingCampaign | null = campaignString ? JSON.parse(campaignString) : null;
    let campaignDetails: MarketingCampaignType | undefined = undefined;

    if (currentActiveCampaign) {
      campaignDetails = AVAILABLE_MARKETING_CAMPAIGNS.find(c => c.id === currentActiveCampaign.campaignId);
      if (campaignDetails) {
        // Ensure remainingDays is not negative before further processing this cycle
        if (currentActiveCampaign.remainingDays >= 0) { // Check if campaign is still active
            currentActiveCampaign.remainingDays -= catchUpIntervals;
        }
      }
    }

    const difficultyModifier = DIFFICULTY_SALE_CHANCE_MODIFIERS[currentSettings.difficulty] || 1.0;
    const levelBasedSaleChanceBonus = (currentStats.level - 1) * 0.005;

    for (let i = 0; i < catchUpIntervals; i++) {
      currentPhones = currentPhones.map(phone => {
        if (phone.quantityListedForSale > 0) {
          let salesForThisPhoneInInterval = 0;
          let phoneSpecificCampaignBonus = 0;

          if (campaignDetails && currentActiveCampaign && currentActiveCampaign.remainingDays >= 0) { // Check if campaign is still active
            if (campaignDetails.effectScope === 'all') {
              phoneSpecificCampaignBonus = campaignDetails.saleChanceBonus;
            } else if (campaignDetails.effectScope === 'single_model' && phone.id === currentActiveCampaign.targetPhoneModelId) {
              phoneSpecificCampaignBonus = campaignDetails.saleChanceBonus;
            }
          }

          let eventSaleChanceModifier = 0;
          currentActiveEvents.forEach(event => {
            if (event.remainingDays >= 0) { // Only apply active events
                if (event.definition.type === 'global_sale_chance_modifier') {
                    eventSaleChanceModifier += event.definition.effectValue;
                } else if (event.definition.type === 'feature_sale_chance_modifier' && event.definition.targetFeature) {
                    const featureValue = phone[event.definition.targetFeature as keyof PhoneDesign];
                    if (typeof event.definition.targetFeatureValue === 'boolean' && featureValue === event.definition.targetFeatureValue) {
                        eventSaleChanceModifier += event.definition.effectValue;
                    } else if (typeof event.definition.targetFeatureValue === 'number' && typeof featureValue === 'number' && featureValue >= event.definition.targetFeatureValue) {
                        eventSaleChanceModifier += event.definition.effectValue; // e.g. screenSize >= 6.5
                    }
                }
            }
          });
          
          const actualMarketSaleChance = Math.max(0.001, (BASE_MARKET_SALE_CHANCE_PER_UNIT + phoneSpecificCampaignBonus + eventSaleChanceModifier) * difficultyModifier * (1 + levelBasedSaleChanceBonus));

          for (let unit = 0; unit < phone.quantityListedForSale; unit++) {
            if (Math.random() < actualMarketSaleChance && salesForThisPhoneInInterval < MARKET_MAX_SALES_PER_PHONE_PER_INTERVAL) {
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
            stateModifiedInLoop = true;

            salesNotificationsForCycle.push({
                title: t('marketSaleNotificationTitle'),
                description: t('marketDaySaleNotification', {
                    quantity: salesForThisPhoneInInterval,
                    phoneName: phone.name,
                    price: (phone.salePrice || 0).toFixed(2),
                    totalRevenue: revenueFromThisPhone.toFixed(2)
                }),
                icon: React.createElement(HandCoins, {className: "w-5 h-5 text-green-500"})
            });

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
      stateModifiedInLoop = true;
      toast({ title: t('xpGainedNotification', { amount: xpGainedThisCycle }) });

      let xpToNext = calculateXpToNextLevel(currentStats.level);
      while (currentStats.xp >= xpToNext) {
        currentStats.level++;
        currentStats.xp -= xpToNext;
        xpToNext = calculateXpToNextLevel(currentStats.level);
        const moneyBonus = MONEY_BONUS_FIXED_AMOUNT + (currentStats.level * MONEY_BONUS_PER_LEVEL_BASE);
        currentStats.totalFunds += moneyBonus;
        toast({ title: t('levelUpNotificationTitle'), description: t('levelUpNotificationDesc', { level: currentStats.level }) });
        toast({ title: t('moneyBonusNotification', {amount: moneyBonus.toLocaleString(language)}), description: t('congratulationsOnLevelUp') });
      }
    }

    if (currentActiveCampaign && campaignDetails && currentActiveCampaign.remainingDays < 0) {
      currentStats.brandReputation += campaignDetails.brandReputationBonus;
      stateModifiedInLoop = true;
      toast({ title: t('campaignFinishedSuccessfully', { campaignName: t(campaignDetails.nameKey) }), description: t('campaignBrandReputationBonus', { bonus: campaignDetails.brandReputationBonus }) });
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY);
      setActiveCampaign(null);
      currentActiveCampaign = null; // Ensure it's null for the next part of the logic
      window.dispatchEvent(new CustomEvent('activeCampaignChanged'));
    } else if (currentActiveCampaign) {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY, JSON.stringify(currentActiveCampaign));
      setActiveCampaign({...currentActiveCampaign}); // Update state if remainingDays changed
       stateModifiedInLoop = true;
    }


    if (stateModifiedInLoop) {
      localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(currentPhones));
      localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
      localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
      setGameStats(prevStats => ({...prevStats, ...currentStats}));
      setDisplayStats({ totalFunds: `$${currentStats.totalFunds.toLocaleString(language)}`, phonesSold: currentStats.phonesSold.toLocaleString(language) });
      window.dispatchEvent(new CustomEvent('myPhonesChanged'));
      window.dispatchEvent(new CustomEvent('gameStatsChanged'));
      window.dispatchEvent(new CustomEvent('transactionsChanged'));
    }
    
    checkAllAchievements(currentStats, currentPhones, toast, t, language);

    salesNotificationsForCycle.forEach(notification => { toast({ title: notification.title, description: notification.description, }); });
    if (!isCatchUp && totalPhonesSoldThisCycle === 0 && !currentActiveCampaign && currentActiveEvents.length === 0) { // Less noisy when events/campaigns are running
       if (currentPhones.length > 0 && currentPhones.every(p => p.quantityListedForSale === 0)) {
        toast({ title: t('marketDaySummaryTitle'), description: t('marketDayNoPhonesListed'), });
      }
    }
    localStorage.setItem(LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY, Date.now().toString());
  }, [t, language, toast]);


  useEffect(() => {
    const loadGameData = () => {
      const storedStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
      let currentStats: GameStats = { ...defaultGameStats };
      if (storedStatsString) {
        try {
          const parsedStats = JSON.parse(storedStatsString) as GameStats;
          if (typeof parsedStats.totalFunds === 'number' && typeof parsedStats.phonesSold === 'number') {
              currentStats = { ...defaultGameStats, ...parsedStats, };
          } else { localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats)); }
        } catch (error) {
          console.error("Error parsing game stats from localStorage:", error);
          localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats));
          toast({ variant: "destructive", title: t('localStorageErrorTitle'), description: t('localStorageErrorGameStatsDesc')});
        }
      } else { localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(defaultGameStats)); }
      if (currentStats.level === undefined) currentStats.level = 1;
      if (currentStats.xp === undefined) currentStats.xp = 0;
      if (currentStats.brandReputation === undefined) currentStats.brandReputation = 0;
      setGameStats(currentStats);
      setDisplayStats({ totalFunds: `$${currentStats.totalFunds.toLocaleString(language)}`, phonesSold: currentStats.phonesSold.toLocaleString(language), });

      const storedSettingsString = localStorage.getItem(LOCAL_STORAGE_GAME_SETTINGS_KEY);
      let currentSettings: GameSettings = { ...defaultGameSettings };
      if (storedSettingsString) {
        try {
            const parsedSettings = JSON.parse(storedSettingsString) as Partial<GameSettings>;
            currentSettings = { ...defaultGameSettings, ...parsedSettings };
             if (typeof currentSettings.useOnlineFeatures !== 'boolean' || !['easy', 'normal', 'hard'].includes(currentSettings.difficulty)) {
                currentSettings = { ...defaultGameSettings, ...currentSettings }; // Re-merge with defaults to ensure all fields
                localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(currentSettings));
            }
        } catch (error) {
            console.error(t('localStorageErrorGameSettingsConsole'), error);
            localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(defaultGameSettings));
        }
      } else { localStorage.setItem(LOCAL_STORAGE_GAME_SETTINGS_KEY, JSON.stringify(defaultGameSettings));}
      setGameSettings(currentSettings);

      const campaignString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY);
      setActiveCampaign(campaignString ? JSON.parse(campaignString) : null);

      const eventsString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_EVENTS_KEY);
      setActiveGameEvents(eventsString ? JSON.parse(eventsString) : []);

      const phonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
      const phones: PhoneDesign[] = phonesString ? JSON.parse(phonesString) : [];
      checkAllAchievements(currentStats, phones, toast, t, language);
    };

    loadGameData();
    const handleStatsUpdate = () => { loadGameData(); };
    const handleSettingsUpdate = () => { loadGameData(); };
    const handleCampaignUpdate = () => { const campaignString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY); setActiveCampaign(campaignString ? JSON.parse(campaignString) : null); };
    const handleEventsUpdate = () => { const eventsString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_EVENTS_KEY); setActiveGameEvents(eventsString ? JSON.parse(eventsString) : []); };

    window.addEventListener('gameStatsChanged', handleStatsUpdate);
    window.addEventListener('gameSettingsChanged', handleSettingsUpdate);
    window.addEventListener('activeCampaignChanged', handleCampaignUpdate);
    window.addEventListener('activeEventsChanged', handleEventsUpdate); // Listener for game events

    const lastSimTime = localStorage.getItem(LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY);
    if (lastSimTime) {
      const timeDiffMs = Date.now() - parseInt(lastSimTime, 10);
      const timeDiffMinutes = timeDiffMs / (1000 * 60);
      if (timeDiffMinutes > MARKET_CATCH_UP_THRESHOLD_MINUTES) {
        const intervalsToCatchUp = Math.min( Math.floor(timeDiffMs / MARKET_SIMULATION_INTERVAL), MARKET_MAX_CATCH_UP_INTERVALS );
        if (intervalsToCatchUp > 0) { performMarketSimulation(true, intervalsToCatchUp); }
      }
    } else { localStorage.setItem(LOCAL_STORAGE_LAST_MARKET_SIMULATION_KEY, Date.now().toString()); }

    if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = setInterval(() => { performMarketSimulation(false, 1); }, MARKET_SIMULATION_INTERVAL);

    return () => {
        window.removeEventListener('gameStatsChanged', handleStatsUpdate);
        window.removeEventListener('gameSettingsChanged', handleSettingsUpdate);
        window.removeEventListener('activeCampaignChanged', handleCampaignUpdate);
        window.removeEventListener('activeEventsChanged', handleEventsUpdate);
        if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, [language, performMarketSimulation, t, toast]);


  const brandReputationText = (rep: number) => {
    if (rep >= 5) return t('statBrandReputationValue_good');
    if (rep <= -5) return t('statBrandReputationValue_bad');
    return t('statBrandReputationValue');
  }
  
  const getActiveCampaignInfo = () => {
    if (!activeCampaign || activeCampaign.remainingDays < 0) return null;
    const campaignDetails = AVAILABLE_MARKETING_CAMPAIGNS.find(c => c.id === activeCampaign.campaignId);
    if (!campaignDetails) return null;
    let targetInfo = t('activeCampaignTarget_all');
    if (campaignDetails.effectScope === 'single_model' && activeCampaign.targetPhoneModelName) {
      targetInfo = activeCampaign.targetPhoneModelName;
    }
    const displayRemainingDays = Math.max(0, activeCampaign.remainingDays);
    return t('activeMarketingCampaignInfo', { campaignName: t(campaignDetails.nameKey), remainingDays: displayRemainingDays, target: targetInfo, });
  };

  const getActiveEventsInfo = () => {
    if (activeGameEvents.length === 0) return t('noActiveGameEvents');
    return t('activeGameEventsInfo', { 
        events: activeGameEvents.map(event => `${t(event.definition.titleKey)} (${t('gameEventDurationLabel', {days: Math.max(0,event.remainingDays)})})`).join(', ')
    });
  };

  const getEventIcon = (event: ActiveGameEvent) => {
    if (event.definition.isNegative) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (event.definition.type === 'component_cost_modifier' && event.definition.effectValue < 1) return <TrendingDownIcon className="h-4 w-4 text-green-500" />;
    if (event.definition.type === 'component_cost_modifier' && event.definition.effectValue > 1) return <TrendingUp className="h-4 w-4 text-destructive" />;
    if (event.definition.type === 'feature_sale_chance_modifier' && event.definition.effectValue > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (event.definition.type === 'global_sale_chance_modifier' && event.definition.effectValue > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (event.definition.type === 'global_sale_chance_modifier' && event.definition.effectValue < 0) return <TrendingDownIcon className="h-4 w-4 text-destructive" />;
    return <CheckCircle2Icon className="h-4 w-4 text-blue-500" />; // Default positive-ish icon
  };


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
            value={`${brandReputationText(gameStats.brandReputation)} (${gameStats.brandReputation})`}
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
          {t('marketSimulationActive')} {t('currentDifficultyLabel')}: {t(`difficulty_${gameSettings.difficulty}`)}.
          {getActiveCampaignInfo() && ` ${getActiveCampaignInfo()}`}
        </AlertDescription>
      </Alert>
      
      {activeGameEvents.filter(event => event.remainingDays >=0).length > 0 && (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center"><Bell className="mr-2 h-5 w-5 text-primary"/>{t('activeGameEvents')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {activeGameEvents.filter(event => event.remainingDays >=0).map(event => (
                    <Alert key={event.eventId} variant={event.definition.isNegative ? "destructive" : "default"} className="flex items-start">
                        {getEventIcon(event)}
                        <div className="ml-3">
                            <AlertDescription>
                                <strong>{t(event.definition.titleKey)}:</strong> {t(event.definition.descriptionKey)} ({t('gameEventDurationLabel', {days: Math.max(0, event.remainingDays)})})
                            </AlertDescription>
                        </div>
                    </Alert>
                ))}
            </CardContent>
        </Card>
      )}


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
                <Link href="/marketing">{t('marketing')}</Link>
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
