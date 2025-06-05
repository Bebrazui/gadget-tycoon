
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
    costs: 0, // Renamed from expenses to represent total costs/expenses
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
        // If no transactions, still set an empty array and save it to avoid repeated checks
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
        revenue += txn.amount; // Amount is positive for income
      } else if (txn.type === 'expense') {
        costs += Math.abs(txn.amount); // Amount is negative for expense, so use abs for summing costs
      }
    });
    
    const profit = revenue - costs;

    setFinancialSummary({ revenue, costs, profit });
  }, [transactions]);

  const getTransactionDescription = (txn: Transaction): string => {
    // Check if the description is a key or a direct string
    // Simple check: if it contains spaces or special characters, assume it's already translated or a dynamic value
    // This is a heuristic and might need refinement if keys can contain spaces
    if (txn.description.includes("{{") && txn.description.includes("}}")) { // Placeholder for dynamic values
        const key = txn.description.substring(0, txn.description.indexOf("{{")).trim();
        const paramsString = txn.description.substring(txn.description.indexOf("{{")+2, txn.description.lastIndexOf("}}"));
        try {
            const params = JSON.parse(paramsString);
            return t(key, params);
        } catch (e) {
             // If params are not valid JSON, or other issues, try translating the key directly or return as is
        }
    }
    // For direct translation keys or already-formatted strings
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
            <div className="text-2xl font-bold">${financialSummary.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('totalRevenueDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalCosts')}</CardTitle>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.costs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">{t('totalCostsDesc')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('netProfit')}</CardTitle>
            <Banknote className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary.profit.toLocaleString()}</div>
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
                       {/* Use the smart translation for description */}
                       {txn.description.startsWith("transactionSaleOf") ? t('transactionSaleOf', {phoneName: txn.description.substring(txn.description.indexOf("{{")+14, txn.description.indexOf("}}"))}) : 
                        txn.description.startsWith("transactionProductionOf") ? t('transactionProductionOf', {quantity: txn.description.substring(txn.description.indexOf("{{quantity:")+11, txn.description.indexOf(",")), phoneName: txn.description.substring(txn.description.indexOf("phoneName:")+10, txn.description.lastIndexOf("}}")) }) :
                        t(txn.description) || txn.description}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${txn.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}${Math.abs(txn.amount).toLocaleString()}
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
