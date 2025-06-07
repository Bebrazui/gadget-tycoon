
"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { useSettings } from '@/context/SettingsContext';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { settings, toggleOnlineMode, isOnlineMode } = useSettings();
  const { toast } = useToast();

  const handleToggleOnlineFeatures = () => {
    toggleOnlineMode();
    toast({
      title: t('settingsSaved'),
      description: isOnlineMode ? t('onlineFeaturesLabel') + ': ' + t('disabled') : t('onlineFeaturesLabel') + ': ' + t('enabled'),
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
            />
            <Label htmlFor="online-features">
              {settings.useOnlineFeatures ? t('enabled') : t('disabled')}
            </Label>
          </div>
        </CardContent>
      </Card>

      {/* Future settings can be added here */}
      {/* 
      <Card>
        <CardHeader>
          <CardTitle>Game Difficulty</CardTitle>
          <CardDescription>Adjust game difficulty (coming soon).</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">This feature is planned for a future update.</p>
        </CardContent>
      </Card>
      */}
    </div>
  );
}
