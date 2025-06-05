
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart as LucideBarChart, LineChart as LucideLineChart, TrendingDown, TrendingUp, Users, AlertCircle } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Bar, BarChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Legend as RechartsLegend, LineChart } from "recharts";
import { useTranslation } from "@/hooks/useTranslation";
import type { Transaction, PhoneDesign } from '@/lib/types';
import { LOCAL_STORAGE_TRANSACTIONS_KEY, LOCAL_STORAGE_MY_PHONES_KEY } from '@/lib/types';
import { Alert, AlertDescription } from '@/components/ui/alert';

const competitorData = [
  { id: 1, name: "Apex Phone X", features: "AI Camera, OLED 120Hz", price: 799, sentiment: "Positive" },
  { id: 2, name: "Nova Smart Z", features: "Foldable, Long Battery", price: 1299, sentiment: "Mixed" },
  { id: 3, name: "BudgetFone 5", features: "Affordable, Decent Specs", price: 299, sentiment: "Neutral" },
  { id: 4, name: "PixelPro Max", features: "Top Tier Processor, Stock Android", price: 999, sentiment: "Very Positive" },
];

interface MonthlySalesData {
  month: string;
  sales: number;
}

interface PhoneSalesData {
  name: string;
  unitsSold: number;
}

export default function MarketAnalysisPage() {
  const { t, language } = useTranslation();
  const [monthlySales, setMonthlySales] = useState<MonthlySalesData[]>([]);
  const [topSellingPhones, setTopSellingPhones] = useState<PhoneSalesData[]>([]);

  useEffect(() => {
    const storedTransactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    const transactions: Transaction[] = storedTransactionsString ? JSON.parse(storedTransactionsString) : [];

    const salesByMonth: Record<string, number> = {};
    const phoneSalesCount: Record<string, number> = {};

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    transactions.forEach(txn => {
      if (txn.type === 'income' && txn.description.startsWith("transactionMarketSaleOf")) {
        const transactionDate = new Date(txn.date);
        if (transactionDate >= sixMonthsAgo) {
          const monthYear = transactionDate.toLocaleDateString(language, { year: 'numeric', month: 'short' });
          salesByMonth[monthYear] = (salesByMonth[monthYear] || 0) + txn.amount;
        }

        const paramsMatch = txn.description.match(/{{quantity:([\d.]+),phoneName:(.*?),price:.*?}}/);
        if (paramsMatch) {
          const quantity = parseInt(paramsMatch[1], 10);
          const phoneName = paramsMatch[2];
          phoneSalesCount[phoneName] = (phoneSalesCount[phoneName] || 0) + quantity;
        }
      }
    });
    
    const monthNames = Array.from({length: 6}, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        return d.toLocaleDateString(language, { year: 'numeric', month: 'short' });
    }).reverse();

    const formattedSalesData: MonthlySalesData[] = monthNames.map(monthYear => ({
      month: monthYear,
      sales: salesByMonth[monthYear] || 0,
    }));
    setMonthlySales(formattedSalesData);

    const sortedPhoneSales = Object.entries(phoneSalesCount)
      .map(([name, unitsSold]) => ({ name, unitsSold }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5); // Top 5 selling phones
    setTopSellingPhones(sortedPhoneSales);

  }, [language]);

  const salesChartConfig = useMemo(() => ({
    sales: {
      label: t('salesLabel'),
      color: "hsl(var(--primary))",
    },
  }), [t]);

  const topPhonesChartConfig = useMemo(() => ({
    unitsSold: {
      label: t('unitsSoldLabel'),
      color: "hsl(var(--chart-2))",
    },
  }), [t]);
  

  return (
    <div className="space-y-8">
      <SectionTitle 
        title={t('marketPageTitle')}
        description={t('marketPageDesc')}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle asChild><h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight"><LucideLineChart className="w-5 h-5 mr-2 text-primary" />{t('salesTrendsTitle')}</h3></CardTitle>
            <CardDescription>{t('salesTrendsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlySales.reduce((sum, item) => sum + item.sales, 0) > 0 ? (
              <ChartContainer config={salesChartConfig} className="h-[300px] w-full">
                <LineChart data={monthlySales} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Line type="monotone" dataKey="sales" stroke="var(--color-sales)" strokeWidth={2} dot={{ fill: "var(--color-sales)" }} activeDot={{ r: 6 }} name={salesChartConfig.sales.label} />
                  <RechartsLegend content={<ChartLegendContent />} />
                </LineChart>
              </ChartContainer>
            ) : (
              <Alert variant="default" className="bg-muted/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('noSalesDataAvailable')}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle asChild><h3 className="flex items-center text-xl font-semibold leading-none tracking-tight"><Users className="w-5 h-5 mr-2 text-primary" />{t('consumerSentimentTitle')}</h3></CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span>{t('featureDemandAIPhoto')}</span> <TrendingUp className="w-5 h-5 text-green-500"/>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>{t('priceSensitivityHigh')}</span> <TrendingDown className="w-5 h-5 text-red-500"/>
                    </div>
                     <div className="flex justify-between items-center">
                        <span>{t('brandLoyaltyModerate')}</span> <LucideLineChart className="w-5 h-5 text-yellow-500"/>
                    </div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle asChild><h3 className="flex items-center text-xl font-semibold leading-none tracking-tight"><LucideBarChart className="w-5 h-5 mr-2 text-primary" />{t('marketSegmentsTitle')}</h3></CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>{t('segmentBudget')}</p>
                    <p>{t('segmentMidRange')}</p>
                    <p>{t('segmentPremium')}</p>
                </CardContent>
            </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle asChild><h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight"><LucideBarChart className="w-5 h-5 mr-2 text-primary" />{t('topSellingPhonesTitle')}</h3></CardTitle>
          <CardDescription>{t('topSellingPhonesDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {topSellingPhones.length > 0 ? (
            <ChartContainer config={topPhonesChartConfig} className="h-[300px] w-full">
              <BarChart data={topSellingPhones} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))"/>
                <XAxis type="number" dataKey="unitsSold" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={120} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <Bar dataKey="unitsSold" layout="vertical" fill="var(--color-unitsSold)" radius={4} name={topPhonesChartConfig.unitsSold.label} />
                <RechartsLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          ) : (
             <Alert variant="default" className="bg-muted/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{t('noSalesDataAvailable')}</AlertDescription>
              </Alert>
          )}
        </CardContent>
      </Card>


      <Card>
        <CardHeader>
          <CardTitle asChild><h3 className="text-2xl font-semibold leading-none tracking-tight">{t('competitorLandscapeTitle')}</h3></CardTitle>
          <CardDescription>{t('competitorLandscapeDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('deviceNameLabel')}</TableHead>
                <TableHead>{t('keyFeaturesLabel')}</TableHead>
                <TableHead className="text-right">{t('priceLabel')}</TableHead>
                <TableHead>{t('publicSentimentLabel')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitorData.map((competitor) => (
                <TableRow key={competitor.id}>
                  <TableCell className="font-medium">{competitor.name}</TableCell>
                  <TableCell>{competitor.features}</TableCell>
                  <TableCell className="text-right">${competitor.price}</TableCell>
                  <TableCell>
                     <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        competitor.sentiment === 'Positive' || competitor.sentiment === 'Very Positive'
                          ? 'bg-green-500/20 text-green-400' 
                          : competitor.sentiment === 'Mixed' ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {competitor.sentiment}
                      </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

