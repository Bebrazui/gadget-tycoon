
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SectionTitle } from '@/components/shared/SectionTitle';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';
import type { CustomProcessor, CustomDisplay, GameStats, Transaction, GameSettings, ComponentTier, ProcessorTierCharacteristics, DisplayTierCharacteristics } from '@/lib/types';
import {
    LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY,
    LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY,
    LOCAL_STORAGE_GAME_STATS_KEY,
    INITIAL_FUNDS,
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    XP_FOR_RESEARCHING_COMPONENT, XP_FOR_RESEARCHING_TIER,
    calculateXpToNextLevel,
    DISPLAY_RESOLUTION_CATEGORIES_RD,
    DISPLAY_TECHNOLOGIES_RD,
    DISPLAY_REFRESH_RATES_RD,
    MONEY_BONUS_PER_LEVEL_BASE, MONEY_BONUS_FIXED_AMOUNT,
    PROCESSOR_TIERS, DISPLAY_TIERS,
    LOCAL_STORAGE_RESEARCHED_PROCESSOR_TIERS_KEY,
    LOCAL_STORAGE_RESEARCHED_DISPLAY_TIERS_KEY
} from '@/lib/types';
import { FlaskConical, Loader2, PackagePlus, AlertCircle, Cpu, MonitorSmartphone, DollarSign, CheckCircle2, Zap, Layers } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from '@/context/SettingsContext';
import { Separator } from '@/components/ui/separator';


// Zod Schemas
const customProcessorSchema = z.object({
    name: z.string().min(3, "validation_min3chars").max(50, "validation_max50chars"),
    tierId: z.string().min(1, "validation_required"), // Tier selection will be added
    antutuScore: z.number({invalid_type_error: "validation_required", required_error: "validation_required"}).min(100000, "validation_minValue").max(5000000, "validation_maxValue"),
    coreCount: z.number({invalid_type_error: "validation_required", required_error: "validation_required"}).min(2, "validation_minValue").max(16, "validation_maxValue").int(),
    clockSpeed: z.number({invalid_type_error: "validation_required", required_error: "validation_required"}).min(1.0, "validation_minValue").max(5.0, "validation_maxValue"),
});
type CustomProcessorFormData = z.infer<typeof customProcessorSchema>;

const customDisplaySchema = z.object({
    name: z.string().min(3, "validation_min3chars").max(50, "validation_max50chars"),
    tierId: z.string().min(1, "validation_required"), // Tier selection will be added
    resolutionCategory: z.string().min(1, "validation_required"),
    technology: z.string().min(1, "validation_required"),
    refreshRate: z.number({invalid_type_error: "validation_required"}).min(60, "validation_minValue"),
});
type CustomDisplayFormData = z.infer<typeof customDisplaySchema>;

// Algorithmic cost calculation for Processors
const calculateAlgorithmicProcessorCosts = (data: Partial<CustomProcessorFormData>, tier?: ComponentTier): { manufacturingCost: number; researchCost: number } | null => {
    if (data.antutuScore === undefined || data.antutuScore === null || data.antutuScore < 100000 ||
        data.coreCount === undefined || data.coreCount === null || data.coreCount < 2 ||
        data.clockSpeed === undefined || data.clockSpeed === null || data.clockSpeed < 1.0) {
        return null;
    }

    let mfgCost = 10;
    mfgCost += data.antutuScore / 40000;
    mfgCost += data.coreCount * 4;
    mfgCost += data.clockSpeed * 15;
    
    let researchCostMultiplier = 8; // Base multiplier

    if (tier && tier.type === 'processor') {
        const tierChars = tier.characteristics as ProcessorTierCharacteristics;
        mfgCost *= (tierChars.manufacturingCostMultiplier || 1.0);
        mfgCost += (tierChars.baseManufacturingCostAddition || 0);
        // Higher tiers might make specific component R&D (if we keep it) slightly cheaper or influence it
        if (tier.id === 'proc_tier_2') researchCostMultiplier = 7; 
    }


    mfgCost = Math.max(15, Math.min(600, parseFloat(mfgCost.toFixed(2))));
    
    // For now, the "researchCost" for a *specific* component (after tier research) is 0,
    // as per our discussion. Tier research is the main R&D cost.
    // If we re-introduce per-component R&D cost, this logic would change.
    // const researchCost = Math.max(mfgCost * 5, mfgCost * researchCostMultiplier, Math.min(200000, parseFloat((mfgCost * researchCostMultiplier).toFixed(2))));
    const researchCost = 0; // No additional research cost for custom component after tier is researched

    return { manufacturingCost: mfgCost, researchCost: researchCost };
};

// Algorithmic cost calculation for Displays
const calculateAlgorithmicDisplayCosts = (data: Partial<CustomDisplayFormData>, tier?: ComponentTier): { manufacturingCost: number; researchCost: number } | null => {
    if (!data.resolutionCategory || !data.technology || data.refreshRate === undefined || data.refreshRate < 60) {
        return null;
    }
    let mfgCost = 10;
    if (data.technology === 'oled') mfgCost += 25;
    if (data.technology === 'ltpo_oled') mfgCost += 45;
    if (data.resolutionCategory === 'fhd') mfgCost += 20;
    if (data.resolutionCategory === 'qhd') mfgCost += 40;
    mfgCost += (data.refreshRate - 60) / 2.5;

    if (tier && tier.type === 'display') {
        const tierChars = tier.characteristics as DisplayTierCharacteristics;
        mfgCost *= (tierChars.manufacturingCostMultiplier || 1.0);
        mfgCost += (tierChars.baseManufacturingCostAddition || 0);
    }

    mfgCost = parseFloat(Math.max(10, Math.min(250, mfgCost)).toFixed(2));
    const researchCost = 0; // No additional research cost for custom component after tier is researched

    return { manufacturingCost: mfgCost, researchCost: researchCost };
};


export default function RDPage() {
    const { t, language } = useTranslation();
    const { toast } = useToast();
    const { settings } = useSettings();
    const [activeTab, setActiveTab] = useState("processors");
    const [gameStats, setGameStats] = useState<GameStats | null>(null);

    // Researched Tiers State
    const [researchedProcessorTiers, setResearchedProcessorTiers] = useState<string[]>([]);
    const [researchedDisplayTiers, setResearchedDisplayTiers] = useState<string[]>([]);
    const [isResearchingTier, setIsResearchingTier] = useState<string | null>(null);


    // Processors State
    const [customProcessors, setCustomProcessors] = useState<CustomProcessor[]>([]);
    const [isResearchingProcessor, setIsResearchingProcessor] = useState(false);
    const [estimatedProcessorCosts, setEstimatedProcessorCosts] = useState<{manufacturingCost: number, researchCost: number} | null>(null);

    // Displays State
    const [customDisplays, setCustomDisplays] = useState<CustomDisplay[]>([]);
    const [isResearchingDisplay, setIsResearchingDisplay] = useState(false);
    const [estimatedDisplayCosts, setEstimatedDisplayCosts] = useState<{manufacturingCost: number, researchCost: number} | null>(null);

    // Load GameStats
     useEffect(() => {
        const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
        if (statsString) {
            setGameStats(JSON.parse(statsString));
        } else {
            setGameStats({ totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 });
        }
        const handleStatsUpdate = () => {
            const updatedStatsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
            if(updatedStatsString) setGameStats(JSON.parse(updatedStatsString));
        };
        window.addEventListener('gameStatsChanged', handleStatsUpdate);
        return () => window.removeEventListener('gameStatsChanged', handleStatsUpdate);
    }, []);


    // Processor Form
    const { control: procControl, handleSubmit: handleProcSubmit, reset: resetProcForm, formState: { errors: procErrors }, getValues: getProcValues, watch: watchProc } = useForm<CustomProcessorFormData>({
        resolver: zodResolver(customProcessorSchema),
        defaultValues: { name: '', tierId: '', antutuScore: undefined, coreCount: undefined, clockSpeed: undefined },
        mode: "onBlur"
    });
    const watchedProcFormValues = watchProc();

    useEffect(() => {
        const selectedTier = PROCESSOR_TIERS.find(tier => tier.id === watchedProcFormValues.tierId);
        const costs = calculateAlgorithmicProcessorCosts(watchedProcFormValues, selectedTier);
        setEstimatedProcessorCosts(costs);
    }, [watchedProcFormValues.antutuScore, watchedProcFormValues.coreCount, watchedProcFormValues.clockSpeed, watchedProcFormValues.tierId]);


    // Display Form
    const { control: displayControl, handleSubmit: handleDisplaySubmit, reset: resetDisplayForm, formState: { errors: displayErrors }, getValues: getDisplayValues, watch: watchDisplay } = useForm<CustomDisplayFormData>({
        resolver: zodResolver(customDisplaySchema),
        defaultValues: { name: '', tierId: '', resolutionCategory: DISPLAY_RESOLUTION_CATEGORIES_RD[1]?.value || '', technology: DISPLAY_TECHNOLOGIES_RD[1]?.value || '', refreshRate: DISPLAY_REFRESH_RATES_RD[1]?.value || 90 },
        mode: "onBlur"
    });
    const watchedDisplayFormValues = watchDisplay();

    useEffect(() => {
        const selectedTier = DISPLAY_TIERS.find(tier => tier.id === watchedDisplayFormValues.tierId);
        const costs = calculateAlgorithmicDisplayCosts(watchedDisplayFormValues, selectedTier);
        setEstimatedDisplayCosts(costs);
    }, [watchedDisplayFormValues.resolutionCategory, watchedDisplayFormValues.technology, watchedDisplayFormValues.refreshRate, watchedDisplayFormValues.tierId]);


    const loadComponentsAndTiers = useCallback(() => {
        const storedProcessors = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY);
        if (storedProcessors) try { setCustomProcessors(JSON.parse(storedProcessors)); } catch (e) { console.error(t('localStorageErrorCustomProcessorsConsole'), e); toast({ variant: "destructive", title: t('localStorageErrorTitle'), description: t('localStorageErrorCustomProcessors')}); localStorage.removeItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY); }

        const storedDisplays = localStorage.getItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY);
        if (storedDisplays) try { setCustomDisplays(JSON.parse(storedDisplays)); } catch (e) { console.error(t('localStorageErrorCustomDisplaysConsole'), e); toast({ variant: "destructive", title: t('localStorageErrorTitle'), description: t('localStorageErrorCustomDisplays')}); localStorage.removeItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY); }

        const storedResearchedProcTiers = localStorage.getItem(LOCAL_STORAGE_RESEARCHED_PROCESSOR_TIERS_KEY);
        if (storedResearchedProcTiers) try { setResearchedProcessorTiers(JSON.parse(storedResearchedProcTiers)); } catch (e) { localStorage.removeItem(LOCAL_STORAGE_RESEARCHED_PROCESSOR_TIERS_KEY); }
        
        const storedResearchedDispTiers = localStorage.getItem(LOCAL_STORAGE_RESEARCHED_DISPLAY_TIERS_KEY);
        if (storedResearchedDispTiers) try { setResearchedDisplayTiers(JSON.parse(storedResearchedDispTiers)); } catch (e) { localStorage.removeItem(LOCAL_STORAGE_RESEARCHED_DISPLAY_TIERS_KEY); }

    }, [t, toast]);

    useEffect(() => {
        loadComponentsAndTiers();
        const handleComponentsUpdate = () => loadComponentsAndTiers(); // Renamed for clarity
        window.addEventListener('customProcessorsChanged', handleComponentsUpdate);
        window.addEventListener('customDisplaysChanged', handleComponentsUpdate);
        // Add listeners for tier changes if needed, though direct state update might be enough
        return () => {
            window.removeEventListener('customProcessorsChanged', handleComponentsUpdate);
            window.removeEventListener('customDisplaysChanged', handleComponentsUpdate);
        };
    }, [loadComponentsAndTiers]);

    const handleResearchTier = (tierToResearch: ComponentTier) => {
        if (!gameStats) return;
        setIsResearchingTier(tierToResearch.id);

        if (tierToResearch.requiredPlayerLevel && gameStats.level < tierToResearch.requiredPlayerLevel) {
            toast({ variant: "destructive", title: t('errorStatus'), description: t('levelTooLowForTierResearch', { level: tierToResearch.requiredPlayerLevel }) });
            setIsResearchingTier(null); return;
        }
        if (gameStats.totalFunds < tierToResearch.researchCost) {
            toast({ variant: "destructive", title: t('insufficientFundsErrorTitle'), description: t('cannotAffordTierResearch', { cost: tierToResearch.researchCost.toLocaleString() }) });
            setIsResearchingTier(null); return;
        }

        let currentStats = { ...gameStats };
        currentStats.totalFunds -= tierToResearch.researchCost;
        currentStats.xp += tierToResearch.xpReward;
        toast({ title: t('xpGainedNotification', { amount: tierToResearch.xpReward })});

        let xpToNext = calculateXpToNextLevel(currentStats.level);
        while (currentStats.xp >= xpToNext) { 
            currentStats.level++; 
            currentStats.xp -= xpToNext; 
            xpToNext = calculateXpToNextLevel(currentStats.level); 
            const moneyBonus = MONEY_BONUS_FIXED_AMOUNT + (currentStats.level * MONEY_BONUS_PER_LEVEL_BASE);
            currentStats.totalFunds += moneyBonus;
            toast({ title: t('levelUpNotificationTitle'), description: t('levelUpNotificationDesc', { level: currentStats.level }) });
            toast({ title: t('moneyBonusNotification', { amount: moneyBonus.toLocaleString(language) }), description: t('congratulationsOnLevelUp') });
        }
        
        setGameStats(currentStats);
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('gameStatsChanged'));

        const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
        let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
        currentTransactions.push({ id: `txn_res_tier_${tierToResearch.id}_${Date.now()}`, date: new Date().toISOString(), description: `transactionResearchTier{{tierName:${t(tierToResearch.nameKey)}}}`, amount: -tierToResearch.researchCost, type: 'expense' });
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
        window.dispatchEvent(new CustomEvent('transactionsChanged'));

        if (tierToResearch.type === 'processor') {
            const updatedTiers = [...researchedProcessorTiers, tierToResearch.id];
            setResearchedProcessorTiers(updatedTiers);
            localStorage.setItem(LOCAL_STORAGE_RESEARCHED_PROCESSOR_TIERS_KEY, JSON.stringify(updatedTiers));
        } else if (tierToResearch.type === 'display') {
            const updatedTiers = [...researchedDisplayTiers, tierToResearch.id];
            setResearchedDisplayTiers(updatedTiers);
            localStorage.setItem(LOCAL_STORAGE_RESEARCHED_DISPLAY_TIERS_KEY, JSON.stringify(updatedTiers));
        }
        
        toast({ title: t('tierResearchSuccessTitle'), description: t('tierResearchSuccessDesc', { tierName: t(tierToResearch.nameKey) }) });
        setIsResearchingTier(null);
    };


    const onProcessorResearchSubmit = (data: CustomProcessorFormData) => {
        const selectedTier = PROCESSOR_TIERS.find(tier => tier.id === data.tierId);
        if (!selectedTier) {
            toast({ variant: "destructive", title: t('errorStatus'), description: "Selected tier not found." }); // Should not happen if UI is correct
            return;
        }
        const costs = calculateAlgorithmicProcessorCosts(data, selectedTier);

        if (!costs) { // Should already be reflected in estimatedProcessorCosts, but good to double check
            toast({ variant: "destructive", title: t('errorStatus'), description: t('errorEstimatingCostsProc') });
            return;
        }
        setIsResearchingProcessor(true);
        const {manufacturingCost, researchCost} = costs; // researchCost here is for component, should be 0 based on new logic

        if (!gameStats) return; // Should be loaded
        let currentStats = {...gameStats};

        if (currentStats.totalFunds < researchCost) { // researchCost for component should be 0.
            toast({ variant: "destructive", title: t('insufficientFundsErrorTitle'), description: t('insufficientFundsForResearchDesc', { name: data.name, researchCost: researchCost.toFixed(2), availableFunds: currentStats.totalFunds.toFixed(2) }) });
            setIsResearchingProcessor(false); return;
        }

        currentStats.totalFunds -= researchCost; // Should be 0
        // XP for component creation can be different from tier research
        currentStats.xp += XP_FOR_RESEARCHING_COMPONENT; 
        toast({ title: t('xpGainedNotification', { amount: XP_FOR_RESEARCHING_COMPONENT })});

        let xpToNext = calculateXpToNextLevel(currentStats.level);
        while (currentStats.xp >= xpToNext) { 
            currentStats.level++; 
            currentStats.xp -= xpToNext; 
            xpToNext = calculateXpToNextLevel(currentStats.level); 
            const moneyBonus = MONEY_BONUS_FIXED_AMOUNT + (currentStats.level * MONEY_BONUS_PER_LEVEL_BASE);
            currentStats.totalFunds += moneyBonus;
            toast({ title: t('levelUpNotificationTitle'), description: t('levelUpNotificationDesc', { level: currentStats.level }) });
            toast({ title: t('moneyBonusNotification', { amount: moneyBonus.toLocaleString(language) }), description: t('congratulationsOnLevelUp') });
        }

        setGameStats(currentStats);
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('gameStatsChanged'));

        const newProcessor: CustomProcessor = { ...data, tierId: data.tierId, id: `custom_proc_${Date.now()}`, type: 'custom_processor', manufacturingCost, researchCost };
        const updatedProcessors = [...customProcessors, newProcessor];
        setCustomProcessors(updatedProcessors);
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, JSON.stringify(updatedProcessors));
        window.dispatchEvent(new CustomEvent('customProcessorsChanged'));

        if (researchCost > 0) { // Only add transaction if there's a cost (should be 0 for component R&D if tier covers it)
            const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
            let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
            currentTransactions.push({ id: `txn_res_proc_${Date.now()}`, date: new Date().toISOString(), description: `transactionResearchProcessor{{processorName:${data.name}}}`, amount: -researchCost, type: 'expense' });
            localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
            window.dispatchEvent(new CustomEvent('transactionsChanged'));
        }

        toast({ title: t('processorResearchedSuccessTitle'), description: t('processorResearchedSuccessDesc', { name: data.name }) });
        resetProcForm({ name: '', tierId: '', antutuScore: undefined, coreCount: undefined, clockSpeed: undefined });
        setEstimatedProcessorCosts(null);
        setIsResearchingProcessor(false);
    };

    const onDisplayResearchSubmit = (data: CustomDisplayFormData) => {
        const selectedTier = DISPLAY_TIERS.find(tier => tier.id === data.tierId);
         if (!selectedTier) {
            toast({ variant: "destructive", title: t('errorStatus'), description: "Selected display tier not found." });
            return;
        }
        const costs = calculateAlgorithmicDisplayCosts(data, selectedTier);

        if (!costs) {
            toast({ variant: "destructive", title: t('errorStatus'), description: t('errorEstimatingCostsDispNotDone') });
            return;
        }
        setIsResearchingDisplay(true);
        const { manufacturingCost, researchCost } = costs; // researchCost for component should be 0

        if (!gameStats) return;
        let currentStats = {...gameStats};

        if (currentStats.totalFunds < researchCost) {
            toast({ variant: "destructive", title: t('insufficientFundsErrorTitle'), description: t('insufficientFundsForResearchDesc', { name: data.name, researchCost: researchCost.toFixed(2), availableFunds: currentStats.totalFunds.toFixed(2) }) });
            setIsResearchingDisplay(false); return;
        }
        currentStats.totalFunds -= researchCost; // Should be 0
        currentStats.xp += XP_FOR_RESEARCHING_COMPONENT;
        toast({ title: t('xpGainedNotification', { amount: XP_FOR_RESEARCHING_COMPONENT })});
        let xpToNext = calculateXpToNextLevel(currentStats.level);
        while (currentStats.xp >= xpToNext) { 
            currentStats.level++; 
            currentStats.xp -= xpToNext; 
            xpToNext = calculateXpToNextLevel(currentStats.level); 
            const moneyBonus = MONEY_BONUS_FIXED_AMOUNT + (currentStats.level * MONEY_BONUS_PER_LEVEL_BASE);
            currentStats.totalFunds += moneyBonus;
            toast({ title: t('levelUpNotificationTitle'), description: t('levelUpNotificationDesc', { level: currentStats.level }) });
            toast({ title: t('moneyBonusNotification', { amount: moneyBonus.toLocaleString(language) }), description: t('congratulationsOnLevelUp') });
        }
        setGameStats(currentStats);
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('gameStatsChanged'));

        const newDisplay: CustomDisplay = { ...data, tierId: data.tierId, refreshRate: Number(data.refreshRate), id: `custom_disp_${Date.now()}`, type: 'custom_display', manufacturingCost, researchCost };
        const updatedDisplays = [...customDisplays, newDisplay];
        setCustomDisplays(updatedDisplays);
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY, JSON.stringify(updatedDisplays));
        window.dispatchEvent(new CustomEvent('customDisplaysChanged'));

        if (researchCost > 0) {
            const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
            let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
            currentTransactions.push({ id: `txn_res_disp_${Date.now()}`, date: new Date().toISOString(), description: `transactionResearchDisplay{{displayName:${data.name}}}`, amount: -researchCost, type: 'expense' });
            localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
            window.dispatchEvent(new CustomEvent('transactionsChanged'));
        }
        
        toast({ title: t('displayResearchedSuccessTitle'), description: t('displayResearchedSuccessDesc', { name: data.name }) });
        resetDisplayForm({ name: '', tierId: '', resolutionCategory: DISPLAY_RESOLUTION_CATEGORIES_RD[1]?.value || '', technology: DISPLAY_TECHNOLOGIES_RD[1]?.value || '', refreshRate: DISPLAY_REFRESH_RATES_RD[1]?.value || 90 });
        setEstimatedDisplayCosts(null);
        setIsResearchingDisplay(false);
    };

    const processorFormFields = [
        { name: "name" as keyof CustomProcessorFormData, labelKey: 'processorNameLabel', placeholderKey: 'processorNamePlaceholder', type: "text" },
        { name: "tierId" as keyof CustomProcessorFormData, labelKey: 'processorTierLabel', type: "select", options: PROCESSOR_TIERS.filter(t => researchedProcessorTiers.includes(t.id)).map(t => ({value: t.id, label: t(t.nameKey)})), placeholderKey: 'selectProcessorTier' },
        { name: "antutuScore" as keyof CustomProcessorFormData, labelKey: 'antutuScoreLabel', placeholderKey: 'antutuScorePlaceholder', type: "number", step: "1000" },
        { name: "coreCount" as keyof CustomProcessorFormData, labelKey: 'coreCountLabel', placeholderKey: 'coreCountPlaceholder', type: "number", step: "1" },
        { name: "clockSpeed" as keyof CustomProcessorFormData, labelKey: 'clockSpeedLabel', placeholderKey: 'clockSpeedPlaceholder', type: "number", step: "0.1" },
    ];

    const displayFormFields = [
        { name: "name" as keyof CustomDisplayFormData, labelKey: 'displayNameLabel', placeholderKey: 'displayNamePlaceholder', type: "text" },
        { name: "tierId" as keyof CustomDisplayFormData, labelKey: 'displayTierLabel', type: "select", options: DISPLAY_TIERS.filter(t => researchedDisplayTiers.includes(t.id)).map(t => ({value: t.id, label: t(t.nameKey)})), placeholderKey: 'selectDisplayTier' },
        { name: "resolutionCategory" as keyof CustomDisplayFormData, labelKey: 'displayResolutionLabel', type: "select", options: DISPLAY_RESOLUTION_CATEGORIES_RD, placeholderKey: 'selectDisplayResolution' },
        { name: "technology" as keyof CustomDisplayFormData, labelKey: 'displayTechnologyLabel', type: "select", options: DISPLAY_TECHNOLOGIES_RD, placeholderKey: 'selectDisplayTechnology' },
        { name: "refreshRate" as keyof CustomDisplayFormData, labelKey: 'displayRefreshRateLabel', type: "select", options: DISPLAY_REFRESH_RATES_RD, placeholderKey: 'selectDisplayRefreshRate' },
    ];

    const renderTierCard = (tier: ComponentTier, isResearched: boolean, type: 'processor' | 'display') => (
        <Card key={tier.id}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    {t(tier.nameKey)}
                    {isResearched && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                </CardTitle>
                <CardDescription>{t(tier.descriptionKey)}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
                <p>{t('costLabel')}: ${tier.researchCost.toLocaleString()}</p>
                {tier.requiredPlayerLevel && <p>{t('requiredLevel', {level: tier.requiredPlayerLevel})}</p>}
                <p>XP: +{tier.xpReward}</p>
                 {/* TODO: Display tier characteristics in a nice way */}
            </CardContent>
            <CardFooter>
                <Button 
                    onClick={() => handleResearchTier(tier)} 
                    disabled={isResearched || isResearchingTier === tier.id || (tier.requiredPlayerLevel && (gameStats?.level || 0) < tier.requiredPlayerLevel) || (gameStats?.totalFunds || 0) < tier.researchCost}
                    className="w-full"
                >
                    {isResearchingTier === tier.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                    {isResearched ? t('tierAlreadyResearched') : t('researchThisTierButton')}
                </Button>
            </CardFooter>
        </Card>
    );


    return (
        <div className="space-y-8">
            <SectionTitle title={t('rdPageTitle')} description={t('rdPageDesc')} />
             <Alert>
                <FlaskConical className="h-4 w-4" />
                <AlertDescription>
                  {t('rdCostsCalculatedAutomatically')}
                </AlertDescription>
              </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="processors">{t('rdProcessorsTab')}</TabsTrigger>
                    <TabsTrigger value="displays">{t('rdDisplaysTab')}</TabsTrigger>
                </TabsList>

                {/* Processor Tiers and Development */}
                <TabsContent value="processors" className="mt-6 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Layers className="w-6 h-6 mr-2 text-primary"/>{t('researchTechTiersTitle')} ({t('rdProcessorsTab')})</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {PROCESSOR_TIERS.map(tier => renderTierCard(tier, researchedProcessorTiers.includes(tier.id), 'processor'))}
                        </CardContent>
                    </Card>

                    <Separator />
                    
                    {researchedProcessorTiers.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PackagePlus className="w-6 h-6 mr-2 text-primary" />
                                    {t('developCustomComponentTitle', {tierName: t('rdProcessorsTab')})}
                                </CardTitle>
                                <CardDescription>{t('processorCostsCalculatedAutomatically')}</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleProcSubmit(onProcessorResearchSubmit)}>
                                <CardContent className="space-y-6">
                                    {processorFormFields.map(fieldInfo => (
                                        <div key={fieldInfo.name} className="space-y-2">
                                            <Label htmlFor={`proc-${fieldInfo.name}`}>{t(fieldInfo.labelKey)}</Label>
                                            {fieldInfo.type === 'select' ? (
                                                <Controller name={fieldInfo.name as any} control={procControl}
                                                    render={({ field }) => (
                                                        <Select onValueChange={field.onChange} value={String(field.value || '')} disabled={fieldInfo.options?.length === 0}>
                                                            <SelectTrigger id={`proc-${fieldInfo.name}`}><SelectValue placeholder={t(fieldInfo.placeholderKey || 'selectPlaceholder')} /></SelectTrigger>
                                                            <SelectContent>
                                                                {fieldInfo.options?.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    )} />
                                            ) : (
                                                <Controller name={fieldInfo.name} control={procControl}
                                                    render={({ field }) => (
                                                        <Input id={`proc-${fieldInfo.name}`} type={fieldInfo.type} placeholder={t(fieldInfo.placeholderKey || '')} step={fieldInfo.step}
                                                            {...field}
                                                            onChange={e => {
                                                                const rawValue = e.target.value;
                                                                if (fieldInfo.type === 'number') {
                                                                    field.onChange(rawValue === '' ? undefined : parseFloat(rawValue));
                                                                } else {
                                                                    field.onChange(rawValue);
                                                                }
                                                            }}
                                                            value={field.value === undefined ? '' : String(field.value)}
                                                            />
                                                    )} />
                                            )}
                                            {procErrors[fieldInfo.name] && <p className="text-sm text-destructive">{t(procErrors[fieldInfo.name]?.message || '', { field: t(fieldInfo.labelKey), min: (customProcessorSchema.shape[fieldInfo.name] as any)?._def?.innerType?._def?.checks?.find((c:any) => c.kind ==='min')?.value, max: (customProcessorSchema.shape[fieldInfo.name] as any)?._def?.innerType?._def?.checks?.find((c:any) => c.kind ==='max')?.value })}</p>}
                                        </div>
                                    ))}

                                    {estimatedProcessorCosts && watchedProcFormValues.tierId && (
                                        <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                                            <p>{t('estimatedMfgCost', {cost: estimatedProcessorCosts.manufacturingCost.toFixed(2)})}</p>
                                            {/* <p>{t('estimatedResearchCost', {cost: estimatedProcessorCosts.researchCost.toFixed(2)})}</p> */}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isResearchingProcessor || !estimatedProcessorCosts || !watchedProcFormValues.tierId}>
                                        {isResearchingProcessor ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                                        {isResearchingProcessor ? t('researchingProcessor') : t('btnResearchProcessor')}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    ) : (
                         <Alert variant="default"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('selectTierFirst')}</AlertDescription></Alert>
                    )}

                    <Card className="mt-6">
                        <CardHeader><CardTitle className="flex items-center"><Cpu className="w-6 h-6 mr-2 text-primary" />{t('researchedProcessorsTitle')}</CardTitle></CardHeader>
                        <CardContent>
                            {customProcessors.length === 0 ? (
                                <Alert variant="default" className="bg-muted/50"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('noResearchedProcessors')}</AlertDescription></Alert>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>{t('header_name')}</TableHead><TableHead>{t('processorTierLabel')}</TableHead><TableHead className="text-right">{t('header_antutu')}</TableHead><TableHead className="text-right">{t('header_cores')}</TableHead><TableHead className="text-right">{t('header_clock')}</TableHead><TableHead className="text-right">{t('header_mfgCost')}</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {customProcessors.map((proc) => (
                                            <TableRow key={proc.id}>
                                                <TableCell className="font-medium">{proc.name}</TableCell>
                                                <TableCell>{t(PROCESSOR_TIERS.find(tier => tier.id === proc.tierId)?.nameKey || 'N/A')}</TableCell>
                                                <TableCell className="text-right">{proc.antutuScore.toLocaleString()}</TableCell>
                                                <TableCell className="text-right">{proc.coreCount}</TableCell>
                                                <TableCell className="text-right">{proc.clockSpeed.toFixed(1)}</TableCell>
                                                <TableCell className="text-right">${proc.manufacturingCost.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                 {/* Display Tiers and Development */}
                <TabsContent value="displays" className="mt-6 space-y-6">
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Layers className="w-6 h-6 mr-2 text-primary"/>{t('researchTechTiersTitle')} ({t('rdDisplaysTab')})</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {DISPLAY_TIERS.map(tier => renderTierCard(tier, researchedDisplayTiers.includes(tier.id), 'display'))}
                        </CardContent>
                    </Card>
                    
                    <Separator />

                    {researchedDisplayTiers.length > 0 ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <PackagePlus className="w-6 h-6 mr-2 text-primary" />
                                     {t('developCustomComponentTitle', {tierName: t('rdDisplaysTab')})}
                                </CardTitle>
                                <CardDescription>
                                {t('displayCostsCalculatedAutomatically')}
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleDisplaySubmit(onDisplayResearchSubmit)}>
                                <CardContent className="space-y-6">
                                    {displayFormFields.map(fieldInfo => (
                                        <div key={fieldInfo.name} className="space-y-2">
                                            <Label htmlFor={`disp-${fieldInfo.name}`}>{t(fieldInfo.labelKey)}</Label>
                                            <Controller name={fieldInfo.name as any} control={displayControl}
                                                render={({ field }) => {
                                                    if (fieldInfo.type === 'select') {
                                                        return (
                                                            <Select
                                                                onValueChange={ (value) => field.onChange(fieldInfo.name === 'refreshRate' ? Number(value) : value) }
                                                                value={String(field.value || '')}
                                                                disabled={fieldInfo.name === 'tierId' && fieldInfo.options?.length === 0}
                                                            >
                                                                <SelectTrigger id={`disp-${fieldInfo.name}`}><SelectValue placeholder={t(fieldInfo.placeholderKey || 'selectPlaceholder')} /></SelectTrigger>
                                                                <SelectContent>
                                                                    {fieldInfo.options?.map(opt => <SelectItem key={String(opt.value)} value={String(opt.value)}>{t(opt.label)}</SelectItem>)}
                                                                </SelectContent>
                                                            </Select>
                                                        );
                                                    }
                                                    return <Input id={`disp-${fieldInfo.name}`} type={fieldInfo.type} placeholder={t(fieldInfo.placeholderKey || '')} {...field} onChange={e => field.onChange(fieldInfo.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />;
                                                }} />
                                            {displayErrors[fieldInfo.name] && <p className="text-sm text-destructive">{t(displayErrors[fieldInfo.name]?.message || '', { field: t(fieldInfo.labelKey), min: (customDisplaySchema.shape[fieldInfo.name] as any)?._def?.innerType?._def?.checks?.find((c:any) => c.kind ==='min')?.value })}</p>}
                                        </div>
                                    ))}

                                    {estimatedDisplayCosts && watchedDisplayFormValues.tierId && (
                                        <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                                            <p>{t('estimatedMfgCost', {cost: estimatedDisplayCosts.manufacturingCost.toFixed(2)})}</p>
                                            {/* <p>{t('estimatedResearchCost', {cost: estimatedDisplayCosts.researchCost.toFixed(2)})}</p> */}
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isResearchingDisplay || !estimatedDisplayCosts || !watchedDisplayFormValues.tierId}>
                                        {isResearchingDisplay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                                        {isResearchingDisplay ? t('researchingDisplay') : t('btnResearchDisplay')}
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                     ) : (
                        <Alert variant="default"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('selectTierFirst')}</AlertDescription></Alert>
                    )}

                    <Card className="mt-6">
                        <CardHeader><CardTitle className="flex items-center"><MonitorSmartphone className="w-6 h-6 mr-2 text-primary" />{t('researchedDisplaysTitle')}</CardTitle></CardHeader>
                        <CardContent>
                            {customDisplays.length === 0 ? (
                                <Alert variant="default" className="bg-muted/50"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('noResearchedDisplays')}</AlertDescription></Alert>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>{t('header_name')}</TableHead><TableHead>{t('displayTierLabel')}</TableHead><TableHead>{t('header_resolution')}</TableHead><TableHead>{t('header_technology')}</TableHead><TableHead className="text-right">{t('header_refreshRate')}</TableHead><TableHead className="text-right">{t('header_mfgCost')}</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {customDisplays.map((disp) => (
                                            <TableRow key={disp.id}>
                                                <TableCell className="font-medium">{disp.name}</TableCell>
                                                <TableCell>{t(DISPLAY_TIERS.find(tier => tier.id === disp.tierId)?.nameKey || 'N/A')}</TableCell>
                                                <TableCell>{t(DISPLAY_RESOLUTION_CATEGORIES_RD.find(r=>r.value===disp.resolutionCategory)?.label || disp.resolutionCategory)}</TableCell>
                                                <TableCell>{t(DISPLAY_TECHNOLOGIES_RD.find(tVal=>tVal.value===disp.technology)?.label || disp.technology)}</TableCell>
                                                <TableCell className="text-right">{disp.refreshRate}</TableCell>
                                                <TableCell className="text-right">${disp.manufacturingCost.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

```