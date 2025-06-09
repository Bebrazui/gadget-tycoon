
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, AlertCircle, Volume2, TrendingUp, DollarSign, Clock, Target, PlayCircle, Info } from 'lucide-react';
import type { MarketingCampaignType, ActiveMarketingCampaign, PhoneDesign, GameStats, Transaction } from '@/lib/types';
import {
    AVAILABLE_MARKETING_CAMPAIGNS,
    LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY,
    LOCAL_STORAGE_MY_PHONES_KEY,
    LOCAL_STORAGE_GAME_STATS_KEY,
    INITIAL_FUNDS,
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    XP_FOR_STARTING_MARKETING_CAMPAIGN,
    calculateXpToNextLevel,
    MONEY_BONUS_PER_LEVEL_BASE, MONEY_BONUS_FIXED_AMOUNT
} from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import { SectionTitle } from '@/components/shared/SectionTitle';

export default function MarketingPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [activeCampaign, setActiveCampaign] = useState<ActiveMarketingCampaign | null>(null);
  const [myPhones, setMyPhones] = useState<PhoneDesign[]>([]);
  const [selectedPhoneForCampaign, setSelectedPhoneForCampaign] = useState<string>('');
  const [isLaunching, setIsLaunching] = useState<string | null>(null); // Stores ID of campaign being launched

  const loadActiveCampaignAndPhones = useCallback(() => {
    const campaignString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY);
    setActiveCampaign(campaignString ? JSON.parse(campaignString) : null);

    const phonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    setMyPhones(phonesString ? JSON.parse(phonesString) : []);
  }, []);

  useEffect(() => {
    loadActiveCampaignAndPhones();
    // Listen for changes from other parts of the app (e.g., market simulation completing a campaign)
    window.addEventListener('activeCampaignChanged', loadActiveCampaignAndPhones);
    window.addEventListener('myPhonesChanged', loadActiveCampaignAndPhones); // If phones are deleted/added
    return () => {
      window.removeEventListener('activeCampaignChanged', loadActiveCampaignAndPhones);
      window.removeEventListener('myPhonesChanged', loadActiveCampaignAndPhones);
    };
  }, [loadActiveCampaignAndPhones]);

  const handleLaunchCampaign = (campaign: MarketingCampaignType) => {
    setIsLaunching(campaign.id);

    if (activeCampaign) {
      toast({
        variant: "destructive",
        title: t('errorStatus'),
        description: t('campaignAlreadyActive', { campaignName: t(AVAILABLE_MARKETING_CAMPAIGNS.find(c => c.id === activeCampaign.campaignId)?.nameKey || '') }),
      });
      setIsLaunching(null);
      return;
    }

    if (campaign.effectScope === 'single_model' && !selectedPhoneForCampaign) {
      toast({
        variant: "destructive",
        title: t('errorStatus'),
        description: t('selectPhoneToPromote'),
      });
      setIsLaunching(null);
      return;
    }

    const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let currentStats: GameStats = statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 };

    if (currentStats.totalFunds < campaign.cost) {
      toast({
        variant: "destructive",
        title: t('insufficientFundsErrorTitle'),
        description: t('notEnoughFundsForCampaign', { campaignName: t(campaign.nameKey), cost: campaign.cost }),
      });
      setIsLaunching(null);
      return;
    }

    currentStats.totalFunds -= campaign.cost;
    currentStats.xp += XP_FOR_STARTING_MARKETING_CAMPAIGN;
    toast({ title: t('xpGainedNotification', { amount: XP_FOR_STARTING_MARKETING_CAMPAIGN }) });

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


    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));

    const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
    currentTransactions.push({
      id: `txn_marketing_${Date.now()}`,
      date: new Date().toISOString(),
      description: `transactionMarketingCampaignPayment{{campaignName:${t(campaign.nameKey)}}}`,
      amount: -campaign.cost,
      type: 'expense',
    });
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
    window.dispatchEvent(new CustomEvent('transactionsChanged'));

    const newActiveCampaign: ActiveMarketingCampaign = {
      campaignId: campaign.id,
      targetPhoneModelId: campaign.effectScope === 'single_model' ? selectedPhoneForCampaign : undefined,
      targetPhoneModelName: campaign.effectScope === 'single_model' ? myPhones.find(p => p.id === selectedPhoneForCampaign)?.name : undefined,
      remainingDays: campaign.durationDays,
      startDate: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_CAMPAIGN_KEY, JSON.stringify(newActiveCampaign));
    setActiveCampaign(newActiveCampaign);
    window.dispatchEvent(new CustomEvent('activeCampaignChanged'));

    toast({
      title: t('campaignLaunchedSuccessfully', { campaignName: t(campaign.nameKey) }),
    });
    setSelectedPhoneForCampaign(''); // Reset selection
    setIsLaunching(null);
  };

  const availablePhonesForPromotion = myPhones.filter(phone => (phone.currentStock > 0 || phone.quantityListedForSale > 0));

  return (
    <div className="space-y-8">
      <SectionTitle title={t('pageTitleMarketing')} description={t('marketingPageDesc')} />

      {activeCampaign ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Info className="w-5 h-5 mr-2 text-primary" />
              {t('activeCampaignTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>{t(AVAILABLE_MARKETING_CAMPAIGNS.find(c => c.id === activeCampaign.campaignId)?.nameKey || '')}</strong></p>
            {activeCampaign.targetPhoneModelName && <p>{t('targetPhone')}: {activeCampaign.targetPhoneModelName}</p>}
            <p>{t('campaignDuration', { duration: activeCampaign.remainingDays })}</p>
            <Alert variant="default" className="mt-2 bg-muted/50">
              <Clock className="h-4 w-4" />
              <AlertDescription>{t('campaignProgressInfo') || 'Campaign is in progress. Effects are applied during market simulation.'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t('availableCampaignsTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {AVAILABLE_MARKETING_CAMPAIGNS.map(campaign => (
              <Card key={campaign.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Volume2 className="w-5 h-5 mr-2 text-primary" />
                    {t(campaign.nameKey)}
                  </CardTitle>
                  <CardDescription>{t(campaign.descriptionKey)}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm flex-grow">
                  <p className="flex items-center"><DollarSign className="w-4 h-4 mr-1 text-muted-foreground" /> {t('campaignCost', { cost: campaign.cost.toLocaleString() })}</p>
                  <p className="flex items-center"><Clock className="w-4 h-4 mr-1 text-muted-foreground" /> {t('campaignDuration', { duration: campaign.durationDays })}</p>
                  <p className="flex items-center"><Target className="w-4 h-4 mr-1 text-muted-foreground" /> {t('campaignEffectScope', { scope: campaign.effectScope === 'all' ? t('activeCampaignTarget_all') : t('targetPhone')})}</p>
                  <p className="flex items-center"><TrendingUp className="w-4 h-4 mr-1 text-muted-foreground" /> {t('campaignSaleChanceBonus', { bonus: (campaign.saleChanceBonus * 100).toFixed(0) })}</p>
                  <p className="flex items-center"><Users className="w-4 h-4 mr-1 text-muted-foreground" /> {t('campaignBrandReputationBonus', { bonus: campaign.brandReputationBonus })}</p>

                  {campaign.effectScope === 'single_model' && (
                    <div className="pt-2">
                      <Label htmlFor={`select-phone-${campaign.id}`}>{t('selectPhoneToPromote')}</Label>
                      <Select
                        value={selectedPhoneForCampaign}
                        onValueChange={setSelectedPhoneForCampaign}
                        disabled={availablePhonesForPromotion.length === 0}
                      >
                        <SelectTrigger id={`select-phone-${campaign.id}`}>
                          <SelectValue placeholder={availablePhonesForPromotion.length === 0 ? t('noPhonesAvailableForPromotion') : t('selectPhoneToPromote')} />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePhonesForPromotion.map(phone => (
                            <SelectItem key={phone.id} value={phone.id}>
                              {phone.name} (Stock: {phone.currentStock + phone.quantityListedForSale})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => handleLaunchCampaign(campaign)}
                    disabled={isLaunching === campaign.id || (campaign.effectScope === 'single_model' && availablePhonesForPromotion.length === 0)}
                    className="w-full"
                  >
                    {isLaunching === campaign.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                    {t('launchCampaignButton')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
