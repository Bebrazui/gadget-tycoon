
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import type { CustomProcessor, GameStats, Transaction } from '@/lib/types';
import { 
    LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, 
    LOCAL_STORAGE_GAME_STATS_KEY, 
    INITIAL_FUNDS, 
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    XP_FOR_RESEARCHING_COMPONENT,
    calculateXpToNextLevel
} from '@/lib/types';
import { FlaskConical, Loader2, PackagePlus, AlertCircle, Cpu } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';


const customProcessorSchema = z.object({
    name: z.string().min(3, "validation_min3chars").max(50, "validation_max50chars"),
    antutuScore: z.number({invalid_type_error: "validation_required"}).min(100000, "validation_minValue").max(5000000, "validation_maxValue"),
    coreCount: z.number({invalid_type_error: "validation_required"}).min(2, "validation_minValue").max(16, "validation_maxValue").int(),
    clockSpeed: z.number({invalid_type_error: "validation_required"}).min(1.0, "validation_minValue").max(5.0, "validation_maxValue"),
    manufacturingCost: z.number({invalid_type_error: "validation_required"}).min(10, "validation_minValue").max(500, "validation_maxValue"),
    researchCost: z.number({invalid_type_error: "validation_required"}).min(1000, "validation_minValue").max(100000, "validation_maxValue"),
});

type CustomProcessorFormData = z.infer<typeof customProcessorSchema>;

export default function RDPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const [customProcessors, setCustomProcessors] = useState<CustomProcessor[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { control, handleSubmit, reset, formState: { errors } } = useForm<CustomProcessorFormData>({
        resolver: zodResolver(customProcessorSchema),
        defaultValues: {
            name: '',
            antutuScore: 1000000,
            coreCount: 8,
            clockSpeed: 2.5,
            manufacturingCost: 100,
            researchCost: 5000,
        },
    });

    const loadCustomProcessors = useCallback(() => {
        const storedProcessors = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY);
        if (storedProcessors) {
            try {
                setCustomProcessors(JSON.parse(storedProcessors));
            } catch (error) {
                console.error(t('localStorageErrorCustomProcessorsConsole'), error);
                toast({
                    variant: "destructive",
                    title: t('localStorageErrorTitle'),
                    description: t('localStorageErrorCustomProcessors'),
                });
                localStorage.removeItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY);
            }
        }
    }, [t, toast]);

    useEffect(() => {
        loadCustomProcessors();
        const handleProcessorsUpdate = () => loadCustomProcessors();
        window.addEventListener('customProcessorsChanged', handleProcessorsUpdate);
        return () => window.removeEventListener('customProcessorsChanged', handleProcessorsUpdate);
    }, [loadCustomProcessors]);

    const onProcessorSubmit = (data: CustomProcessorFormData) => {
        setIsSubmitting(true);

        const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
        let currentStats: GameStats = statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 };
        if (currentStats.level === undefined) currentStats.level = 1;
        if (currentStats.xp === undefined) currentStats.xp = 0;

        if (currentStats.totalFunds < data.researchCost) {
            toast({
                variant: "destructive",
                title: t('insufficientFundsErrorTitle'),
                description: t('insufficientFundsForResearchDesc', { name: data.name, researchCost: data.researchCost, availableFunds: currentStats.totalFunds.toFixed(2) }),
            });
            setIsSubmitting(false);
            return;
        }

        currentStats.totalFunds -= data.researchCost;
        
        const xpFromResearch = XP_FOR_RESEARCHING_COMPONENT;
        currentStats.xp += xpFromResearch;
        toast({ title: t('xpGainedNotification', { amount: xpFromResearch })});
        
        let xpToNext = calculateXpToNextLevel(currentStats.level);
        while (currentStats.xp >= xpToNext) {
            currentStats.level++;
            currentStats.xp -= xpToNext;
            xpToNext = calculateXpToNextLevel(currentStats.level);
            toast({
                title: t('levelUpNotificationTitle'),
                description: t('levelUpNotificationDesc', { level: currentStats.level }),
            });
        }


        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('gameStatsChanged'));

        const newProcessor: CustomProcessor = {
            ...data,
            id: `custom_proc_${Date.now()}`,
            type: 'custom_processor',
        };

        const updatedProcessors = [...customProcessors, newProcessor];
        setCustomProcessors(updatedProcessors);
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, JSON.stringify(updatedProcessors));
        window.dispatchEvent(new CustomEvent('customProcessorsChanged'));

        const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
        let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
        const researchTransaction: Transaction = {
            id: `txn_research_${Date.now()}`,
            date: new Date().toISOString(),
            description: `transactionResearchProcessor{{processorName:${data.name}}}`,
            amount: -data.researchCost,
            type: 'expense',
        };
        currentTransactions.push(researchTransaction);
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
        window.dispatchEvent(new CustomEvent('transactionsChanged'));

        toast({
            title: t('processorResearchedSuccessTitle'),
            description: t('processorResearchedSuccessDesc', { name: data.name }),
        });

        reset();
        setIsSubmitting(false);
    };
    
    const formFields = [
        { name: "name" as keyof CustomProcessorFormData, labelKey: 'processorNameLabel', placeholderKey: 'processorNamePlaceholder', type: "text" },
        { name: "antutuScore" as keyof CustomProcessorFormData, labelKey: 'antutuScoreLabel', placeholderKey: 'antutuScorePlaceholder', type: "number", step: "1000" },
        { name: "coreCount" as keyof CustomProcessorFormData, labelKey: 'coreCountLabel', placeholderKey: 'coreCountPlaceholder', type: "number", step: "1" },
        { name: "clockSpeed" as keyof CustomProcessorFormData, labelKey: 'clockSpeedLabel', placeholderKey: 'clockSpeedPlaceholder', type: "number", step: "0.1" },
        { name: "manufacturingCost" as keyof CustomProcessorFormData, labelKey: 'manufacturingCostPerUnitLabel', placeholderKey: 'manufacturingCostPerUnitPlaceholder', type: "number", step: "1" },
        { name: "researchCost" as keyof CustomProcessorFormData, labelKey: 'researchCostLabel', placeholderKey: 'researchCostPlaceholder', type: "number", step: "100" },
    ];

    return (
        <div className="space-y-8">
            <SectionTitle title={t('rdPageTitle')} description={t('rdPageDesc')} />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <PackagePlus className="w-6 h-6 mr-2 text-primary" />
                        {t('developNewProcessorTitle')}
                    </CardTitle>
                </CardHeader>
                <form onSubmit={handleSubmit(onProcessorSubmit)}>
                    <CardContent className="space-y-6">
                        {formFields.map(fieldInfo => (
                             <div key={fieldInfo.name} className="space-y-2">
                                <Label htmlFor={fieldInfo.name}>{t(fieldInfo.labelKey)}</Label>
                                <Controller
                                    name={fieldInfo.name}
                                    control={control}
                                    render={({ field }) => (
                                        <Input 
                                            id={fieldInfo.name} 
                                            type={fieldInfo.type}
                                            placeholder={t(fieldInfo.placeholderKey)} 
                                            step={fieldInfo.step}
                                            {...field} 
                                            onChange={e => field.onChange(fieldInfo.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
                                        />
                                    )}
                                />
                                {errors[fieldInfo.name] && <p className="text-sm text-destructive">{t(errors[fieldInfo.name]?.message || '', { field: t(fieldInfo.labelKey), min: (customProcessorSchema.shape[fieldInfo.name] as any)?._def?.checks?.find((c:any) => c.kind ==='min')?.value, max: (customProcessorSchema.shape[fieldInfo.name] as any)?._def?.checks?.find((c:any) => c.kind ==='max')?.value })}</p>}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                            {isSubmitting ? t('researchingProcessor') : t('btnResearchProcessor')}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Cpu className="w-6 h-6 mr-2 text-primary" />
                        {t('researchedProcessorsTitle')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customProcessors.length === 0 ? (
                        <Alert variant="default" className="bg-muted/50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{t('noResearchedProcessors')}</AlertDescription>
                        </Alert>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('header_name')}</TableHead>
                                    <TableHead className="text-right">{t('header_antutu')}</TableHead>
                                    <TableHead className="text-right">{t('header_cores')}</TableHead>
                                    <TableHead className="text-right">{t('header_clock')}</TableHead>
                                    <TableHead className="text-right">{t('header_mfgCost')}</TableHead>
                                    <TableHead className="text-right">{t('header_resCost')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customProcessors.map((proc) => (
                                    <TableRow key={proc.id}>
                                        <TableCell className="font-medium">{proc.name}</TableCell>
                                        <TableCell className="text-right">{proc.antutuScore.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">{proc.coreCount}</TableCell>
                                        <TableCell className="text-right">{proc.clockSpeed.toFixed(1)}</TableCell>
                                        <TableCell className="text-right">${proc.manufacturingCost.toFixed(2)}</TableCell>
                                        <TableCell className="text-right">${proc.researchCost.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
