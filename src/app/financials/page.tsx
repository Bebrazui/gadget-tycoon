
"use client";

import React, { useState, useEffect } from 'react';
import { ComingSoon } from "@/components/shared/ComingSoon";
import { SectionTitle } from "@/components/shared/SectionTitle";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, TrendingUp, TrendingDown, CreditCard } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTranslation } from "@/hooks/useTranslation";
import type { Transaction } from '@/lib/types';
import { LOCAL_STORAGE_TRANSACTIONS_KEY } from '@/lib/types';

const defaultInitialTransactions: Transaction[] = [];


export default function FinancialsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [financialSummary, setFinancialSummary] = useState({
    revenue: 0,
    costs: 0, 
    profit: 0,
  });

  useEffect(() => {
    const loadTransactions = () => {
      const storedTransactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
      let currentTransactions = defaultInitialTransactions;
      if (storedTransactionsString) {
        try {
          currentTransactions = JSON.parse(storedTransactionsString);
        } catch (error) {
          console.error("Error parsing transactions from localStorage:", error);
          localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(defaultInitialTransactions));
        }
      } else {
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(defaultInitialTransactions));
      }
      setTransactions(currentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); 
    };
    
    loadTransactions();

    const handleTransactionsUpdate = () => {
      loadTransactions();
    };
    window.addEventListener('transactionsChanged', handleTransactionsUpdate);
    return () => {
        window.removeEventListener('transactionsChanged', handleTransactionsUpdate);
    };

  }, []);

  useEffect(() => {
    let revenue = 0;
    let costs = 0;

    transactions.forEach(txn => {
      if (txn.type === 'income') {
        revenue += txn.amount; 
      } else if (txn.type === 'expense') {
        costs += Math.abs(txn.amount); 
      }
    });
    
    const profit = revenue - costs;

    setFinancialSummary({ revenue, costs, profit });
  }, [transactions]);

  // Enhanced getTransactionDescription to handle more complex placeholder structures
  const getTransactionDescription = (txn: Transaction): string => {
    if (txn.description.startsWith("transactionProductionOf")) {
        // Example: "transactionProductionOf{{quantity:100,phoneName:My Awesome Phone}}"
        const paramsMatch = txn.description.match(/{{quantity:(\d+),phoneName:(.*)}}/);
        if (paramsMatch) {
            return t('transactionProductionOf', { quantity: paramsMatch[1], phoneName: paramsMatch[2] });
        }
    } else if (txn.description.startsWith("transactionMarketSaleOf")) {
        // Example: "transactionMarketSaleOf{{quantity:2,phoneName:My Awesome Phone,price:199.99}}"
        const paramsMatch = txn.description.match(/{{quantity:(\d+),phoneName:(.*),price:([\d.]+)}}/);
        if (paramsMatch) {
            return t('transactionMarketSaleOf', { quantity: paramsMatch[1], phoneName: paramsMatch[2], price: paramsMatch[3] });
        }
    }
    // Fallback for simple keys or already formatted strings
    return t(txn.description) || txn.description;
  }


  return (
    <div className="space-y-8">
      <SectionTitle
        title={t('financialsPageTitle')}
        description={t('financialsPageDesc')}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalRevenue')}</CardTitle>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.revenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">{t('totalRevenueDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalCosts')}</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.costs.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">{t('totalCostsDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netProfit')}</CardTitle>
            <Banknote className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">
              {t('profitMargin', { margin: (financialSummary.revenue > 0 ? (financialSummary.profit / financialSummary.revenue * 100) : 0).toFixed(1) })}
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="w-5 h-5 mr-2 text-primary" />
            {t('recentTransactionsTitle')}
            </CardTitle>
          <CardDescription>{t('recentTransactionsDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('dateLabel')}</TableHead>
                  <TableHead>{t('descriptionLabel')}</TableHead>
                  <TableHead className="text-right">{t('amountLabel')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{new Date(txn.date).toLocaleDateString(t('languageLabel') === 'Русский' ? 'ru-RU' : 'en-US')}</TableCell>
                    <TableCell className="font-medium">
                       {getTransactionDescription(txn)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${txn.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}${Math.abs(txn.amount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-sm text-muted-foreground">{t('noTransactionsYet')}</p>
          )}
        </CardContent>
      </Card>

      <ComingSoon featureName={t('financialReportsComingSoon')} />
    </div>
  );
}
