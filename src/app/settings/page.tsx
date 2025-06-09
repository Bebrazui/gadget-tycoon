
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GameDifficulty, Achievement, AchievementId } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, Award, CheckCircle2 } from 'lucide-react';
import { ACHIEVEMENT_DEFINITIONS, LOCAL_STORAGE_ACHIEVEMENTS_KEY } from '@/lib/types';
import { List, ListItem } from '@/components/ui/list';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, toggleOnlineMode, isOnlineMode, setDifficulty } = useSettings();
  const { toast } = useToast();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const storedAchievementsString = localStorage.getItem(LOCAL_STORAGE_ACHIEVEMENTS_KEY);
    if (storedAchievementsString) {
      try {
        const unlockedIds = JSON.parse(storedAchievementsString) as AchievementId[];
        const achievementsToDisplay = ACHIEVEMENT_DEFINITIONS.filter(def => unlockedIds.includes(def.id));
        setUnlockedAchievements(achievementsToDisplay);
      } catch (e) {
        console.error("Error loading achievements from localStorage", e);
        setUnlockedAchievements([]);
      }
    }
  }, []);


  const handleToggleOnlineFeatures = () => {
    toggleOnlineMode();
    toast({
      title: t('settingsSaved'),
      description: isOnlineMode ? t('onlineFeaturesLabel') + ': ' + t('disabled') : t('onlineFeaturesLabel') + ': ' + t('enabled'),
    });
  };

  const handleDifficultyChange = (value: string) => {
    const newDifficulty = value as GameDifficulty;
    setDifficulty(newDifficulty);
    toast({
        title: t('settingsSaved'),
        description: `${t('gameDifficultyLabel')}: ${t(`difficulty_${newDifficulty}`)}`,
    });
  };

  const howToPlaySections = [
    { titleKey: 'howToPlay_introduction_title', contentKeys: ['howToPlay_introduction_p1'] },
    { titleKey: 'howToPlay_coreLoop_title', contentKeys: ['howToPlay_coreLoop_p1', 'howToPlay_coreLoop_p2', 'howToPlay_coreLoop_p3', 'howToPlay_coreLoop_p4', 'howToPlay_coreLoop_p5', 'howToPlay_coreLoop_p6', 'howToPlay_coreLoop_p7'] },
    { titleKey: 'howToPlay_dashboard_title', contentKeys: ['howToPlay_dashboard_p1'] },
    { titleKey: 'howToPlay_design_title', contentKeys: ['howToPlay_design_p1', 'howToPlay_design_p2', 'howToPlay_design_p3', 'howToPlay_design_p4', 'howToPlay_design_p5', 'howToPlay_design_p6', 'howToPlay_design_p7'] },
    { titleKey: 'howToPlay_myPhones_title', contentKeys: ['howToPlay_myPhones_p1', 'howToPlay_myPhones_p2', 'howToPlay_myPhones_p3', 'howToPlay_myPhones_p4', 'howToPlay_myPhones_p5', 'howToPlay_myPhones_p6'] },
    { titleKey: 'howToPlay_brand_title', contentKeys: ['howToPlay_brand_p1', 'howToPlay_brand_p2', 'howToPlay_brand_p3', 'howToPlay_brand_p4', 'howToPlay_brand_p5'] },
    { titleKey: 'howToPlay_marketing_title', contentKeys: ['howToPlay_marketing_p1', 'howToPlay_marketing_p2', 'howToPlay_marketing_p3', 'howToPlay_marketing_p4', 'howToPlay_marketing_p5', 'howToPlay_marketing_p6', 'howToPlay_marketing_p7'] },
    { titleKey: 'howToPlay_marketAnalysis_title', contentKeys: ['howToPlay_marketAnalysis_p1', 'howToPlay_marketAnalysis_p2', 'howToPlay_marketAnalysis_p3', 'howToPlay_marketAnalysis_p4', 'howToPlay_marketAnalysis_p5'] },
    { titleKey: 'howToPlay_rd_title', contentKeys: ['howToPlay_rd_p1', 'howToPlay_rd_p2', 'howToPlay_rd_p3'] },
    { titleKey: 'howToPlay_contracts_title', contentKeys: ['howToPlay_contracts_p1', 'howToPlay_contracts_p2', 'howToPlay_contracts_p3', 'howToPlay_contracts_p4', 'howToPlay_contracts_p5', 'howToPlay_contracts_p6', 'howToPlay_contracts_p7', 'howToPlay_contracts_p8'] },
    { titleKey: 'howToPlay_financials_title', contentKeys: ['howToPlay_financials_p1'] },
    { titleKey: 'howToPlay_trends_title', contentKeys: ['howToPlay_trends_p1'] },
    { titleKey: 'howToPlay_reviews_title', contentKeys: ['howToPlay_reviews_p1'] },
    { titleKey: 'howToPlay_settings_title', contentKeys: ['howToPlay_settings_p1'] },
    { titleKey: 'howToPlay_leveling_title', contentKeys: ['howToPlay_leveling_p1', 'howToPlay_leveling_p2'] },
    { titleKey: 'howToPlay_gameEvents_title', contentKeys: ['howToPlay_gameEvents_p1', 'howToPlay_gameEvents_p2', 'howToPlay_gameEvents_p3', 'howToPlay_gameEvents_p4', 'howToPlay_gameEvents_p5', 'howToPlay_gameEvents_p6'] },
    { titleKey: 'howToPlay_tips_title', contentKeys: ['howToPlay_tips_p1', 'howToPlay_tips_p2', 'howToPlay_tips_p3', 'howToPlay_tips_p4', 'howToPlay_tips_p5', 'howToPlay_tips_p6', 'howToPlay_tips_p7'] },
  ];


  return (
    <div className="space-y-8">
      <SectionTitle
        title={t('settingsPageTitle')}
        description={t('settingsPageDesc')}
      />

      <Card>
        <CardHeader>
          <CardTitle>{t('onlineFeaturesLabel')}</CardTitle>
          <CardDescription>{t('onlineFeaturesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="online-features"
              checked={settings.useOnlineFeatures}
              onCheckedChange={handleToggleOnlineFeatures}
              aria-label={t('onlineFeaturesLabel')}
            />
            <Label htmlFor="online-features">
              {settings.useOnlineFeatures ? t('enabled') : t('disabled')}
            </Label>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('gameDifficultyLabel')}</CardTitle>
          <CardDescription>{t('gameDifficultyDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={settings.difficulty} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-[180px]" aria-label={t('gameDifficultyLabel')}>
              <SelectValue placeholder={t('gameDifficultyLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">{t('difficulty_easy')}</SelectItem>
              <SelectItem value="normal">{t('difficulty_normal')}</SelectItem>
              <SelectItem value="hard">{t('difficulty_hard')}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

       <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="mr-2 h-5 w-5 text-primary" />
            {t('myAchievementsSectionTitle')}
          </CardTitle>
          <CardDescription>{t('myAchievementsSectionDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {unlockedAchievements.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('noAchievementsUnlockedMessage')}</p>
          ) : (
            <List className="divide-y-0">
              {unlockedAchievements.map(ach => (
                <ListItem key={ach.id} className="py-2 flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">{t(ach.titleKey)}</h4>
                    <p className="text-xs text-muted-foreground">{t(ach.descriptionKey)} (+{ach.xpReward} XP)</p>
                  </div>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-primary" />
            {t('howToPlayTitle')}
          </CardTitle>
          <CardDescription>{t(howToPlaySections[0].contentKeys[0])}</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] w-full rounded-md border p-4">
            <div className="space-y-6">
              {howToPlaySections.map((section, index) => (
                <div key={index}>
                  <h4 className="text-lg font-semibold mb-2">{t(section.titleKey)}</h4>
                  {section.contentKeys.map((contentKey, pIndex) => (
                    <p key={pIndex} className="text-sm text-muted-foreground mb-2 leading-relaxed">
                      {t(contentKey)}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

    </div>
  );
}

    