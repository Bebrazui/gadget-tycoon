
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

const defaultInitialTransactions: Transaction[] = [
  // { id: "txn_1", date: "2024-07-15", description: "Component Purchase - OLED Screens", amount: -12000, type: "expense" },
  // { id: "txn_3", date: "2024-07-18", description: "Marketing Campaign - Social Media", amount: -5000, type: "expense" },
  // { id: "txn_4", date: "2024-07-20", description: "Software Licensing", amount: -2500, type: "expense" },
];


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
      setTransactions(currentTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())); // Sort by date descending
    };
    
    loadTransactions();

     // Listener for custom event to update transactions from other components/pages
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
    let costs = 0; // For simplicity, costs are negative amounts in transactions that are expenses. Sales will have associated costs.

    transactions.forEach(txn => {
      if (txn.type === 'income') {
        revenue += txn.amount;
      } else if (txn.type === 'expense') {
        // For "Sale of X" transactions, the 'amount' is revenue. We need to deduce cost.
        // This part is simplified. A real system would store cost of goods sold (COGS) with the sale.
        // For now, let's assume if a phone is sold, its estimatedCost is the "cost" part.
        // However, generic expenses are just subtracted from profit directly.
        costs += Math.abs(txn.amount); // Add absolute value of expenses to total costs
      }
    });
    
    // A more accurate profit calculation would be (total revenue from sales) - (total COGS for those sales) - (other expenses)
    // Simplified profit:
    const profit = revenue - costs;

    setFinancialSummary({ revenue, costs, profit });
  }, [transactions]);


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
                      {txn.description.startsWith("Sale of ") ? t('transactionSaleOf', { phoneName: txn.description.substring(9)}) : t(txn.description) || txn.description}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${txn.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                      {txn.type === 'income' ? '+' : '-'}${Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <p className="text-sm text-muted-foreground">{t('noTransactionsYet') || "No transactions recorded yet."}</p>
          )}
        </CardContent>
      </Card>

      <ComingSoon featureName={t('financialReportsComingSoon')} />
    </div>
  );
}
