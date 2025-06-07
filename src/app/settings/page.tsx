
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { GameDifficulty } from '@/lib/types';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, toggleOnlineMode, isOnlineMode, setDifficulty } = useSettings();
  const { toast } = useToast();

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
    </div>
  );
}
