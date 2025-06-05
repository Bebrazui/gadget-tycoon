
"use client";

import { StatCard } from "@/components/shared/StatCard";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { DollarSign, Smartphone, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useTranslation } from "@/hooks/useTranslation";

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <SectionTitle
        title={t('welcomeTitle')}
        description={t('welcomeDescription')}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('statTotalFunds')} value="$1,000,000" icon={DollarSign} description={t('statDescFunds')} />
        <StatCard title={t('statPhonesSold')} value="0" icon={Smartphone} description={t('statDescPhonesSold')} />
        <StatCard title={t('statBrandReputation')} value={t('statBrandReputation')} icon={Users} description={t('statDescBrandRep')} />
        <StatCard title={t('statMarketTrend')} value="AI Cameras" icon={TrendingUp} description={t('statDescMarketTrend')} />
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
              <Link href="/brand">{t('btnManageBrand')}</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/market">{t('btnAnalyzeMarket')}</Link>
            </Button>
            <Button asChild variant="default" size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
              alt="Phone Blueprint" 
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
