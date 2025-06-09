
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import type { Employee, GameStats, Transaction } from '@/lib/types';
import { 
    AVAILABLE_EMPLOYEES, 
    LOCAL_STORAGE_HIRED_EMPLOYEES_KEY, 
    LOCAL_STORAGE_GAME_STATS_KEY, 
    INITIAL_FUNDS, 
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    XP_FOR_HIRING_EMPLOYEE,
    calculateXpToNextLevel,
    MONEY_BONUS_PER_LEVEL_BASE, MONEY_BONUS_FIXED_AMOUNT,
    LOCAL_STORAGE_MY_PHONES_KEY, PhoneDesign
} from '@/lib/types';
import { checkAllAchievements } from '@/lib/achievements';
import * as LucideIcons from 'lucide-react'; // Import all icons

export default function HumanResourcesPage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const [hiredEmployees, setHiredEmployees] = useState<Employee[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadGameData = useCallback(() => {
    const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    setGameStats(statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 });

    const hiredString = localStorage.getItem(LOCAL_STORAGE_HIRED_EMPLOYEES_KEY);
    setHiredEmployees(hiredString ? JSON.parse(hiredString) : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadGameData();
    window.addEventListener('gameStatsChanged', loadGameData);
    window.addEventListener('hiredEmployeesChanged', loadGameData); // For potential future use if employees can be fired/leave
    return () => {
      window.removeEventListener('gameStatsChanged', loadGameData);
      window.removeEventListener('hiredEmployeesChanged', loadGameData);
    };
  }, [loadGameData]);

  const handleHireEmployee = (employeeToHire: Employee) => {
    if (!gameStats) return;

    if (hiredEmployees.find(emp => emp.id === employeeToHire.id)) {
      toast({ variant: "default", title: t('statusStatus'), description: t('employeeAlreadyHired', { employeeName: t(employeeToHire.nameKey) }) });
      return;
    }

    if (gameStats.totalFunds < employeeToHire.hireCost) {
      toast({ variant: "destructive", title: t('insufficientFundsErrorTitle'), description: t('cannotAffordToHire', { employeeName: t(employeeToHire.nameKey), cost: employeeToHire.hireCost.toLocaleString() }) });
      return;
    }

    let currentStats = { ...gameStats };
    currentStats.totalFunds -= employeeToHire.hireCost;
    currentStats.xp += XP_FOR_HIRING_EMPLOYEE;

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
    
    setGameStats(currentStats);
    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));

    const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
    currentTransactions.push({
      id: `txn_hire_${employeeToHire.id}_${Date.now()}`,
      date: new Date().toISOString(),
      description: `transactionHiringCost{{employeeName:${t(employeeToHire.nameKey)},role:${t(`role_${employeeToHire.role}`)}}}`,
      amount: -employeeToHire.hireCost,
      type: 'expense',
    });
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
    window.dispatchEvent(new CustomEvent('transactionsChanged'));

    const updatedHiredEmployees = [...hiredEmployees, employeeToHire];
    setHiredEmployees(updatedHiredEmployees);
    localStorage.setItem(LOCAL_STORAGE_HIRED_EMPLOYEES_KEY, JSON.stringify(updatedHiredEmployees));
    window.dispatchEvent(new CustomEvent('hiredEmployeesChanged')); // Dispatch custom event

    toast({ title: t('employeeHiredSuccessfully', { employeeName: t(employeeToHire.nameKey) }) });
    
    const phonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    const phones: PhoneDesign[] = phonesString ? JSON.parse(phonesString) : [];
    checkAllAchievements(currentStats, phones, toast, t, language, { hiredEmployees: updatedHiredEmployees });

  };

  const availableForHire = AVAILABLE_EMPLOYEES.filter(emp => !hiredEmployees.some(hEmp => hEmp.id === emp.id));

  const getEmployeeIcon = (iconName: string): React.ReactNode => {
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="w-5 h-5 mr-2 text-primary" /> : <LucideIcons.User className="w-5 h-5 mr-2 text-primary" />;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><LucideIcons.Loader2 className="w-8 h-8 animate-spin text-primary" /> <span className="ml-2">{t('loading')}</span></div>;
  }

  return (
    <div className="space-y-8">
      <SectionTitle title={t('hrPageTitle')} description={t('hrPageDesc')} />

      <Card>
        <CardHeader>
          <CardTitle>{t('availableStaffTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {availableForHire.length === 0 ? (
            <Alert>
              <LucideIcons.Info className="h-4 w-4" />
              <AlertDescription>{t('noStaffAvailable')}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableForHire.map(employee => (
                <Card key={employee.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      {getEmployeeIcon(employee.iconName)}
                      {t(employee.nameKey)}
                    </CardTitle>
                    <CardDescription>{t(`role_${employee.role}`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm flex-grow">
                    <p className="text-muted-foreground italic">"{t(employee.descriptionKey)}"</p>
                    <p><LucideIcons.DollarSign className="inline h-4 w-4 mr-1 text-muted-foreground" />{t('hiringCostLabel')}: ${employee.hireCost.toLocaleString()}</p>
                    <p><LucideIcons.Briefcase className="inline h-4 w-4 mr-1 text-muted-foreground" />{t('salaryPerCycleLabel')}: ${employee.salaryPerCycle.toLocaleString()}</p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={() => handleHireEmployee(employee)} 
                      className="w-full"
                      disabled={(gameStats?.totalFunds || 0) < employee.hireCost}
                    >
                      <LucideIcons.UserPlus className="mr-2 h-4 w-4" />
                      {t('btnHireEmployee')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('currentTeamTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {hiredEmployees.length === 0 ? (
             <Alert>
              <LucideIcons.Users2 className="h-4 w-4" />
              <AlertDescription>{t('noTeamMembers')}</AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {hiredEmployees.map(employee => (
                <Card key={employee.id}>
                  <CardHeader>
                     <CardTitle className="flex items-center">
                      {getEmployeeIcon(employee.iconName)}
                      {t(employee.nameKey)}
                    </CardTitle>
                    <CardDescription>{t(`role_${employee.role}`)}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                     <p className="text-muted-foreground italic">"{t(employee.descriptionKey)}"</p>
                     <p><LucideIcons.Briefcase className="inline h-4 w-4 mr-1 text-muted-foreground" />{t('salaryPerCycleLabel')}: ${employee.salaryPerCycle.toLocaleString()}</p>
                     {/* Placeholder for effects once implemented */}
                     {/* <p className="text-green-500">Effect: +10% R&D Speed</p> */}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

    