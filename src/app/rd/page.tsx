
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
import type { CustomProcessor, CustomDisplay, GameStats, Transaction, GameSettings } from '@/lib/types';
import { 
    LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, 
    LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY,
    LOCAL_STORAGE_GAME_STATS_KEY, 
    INITIAL_FUNDS, 
    LOCAL_STORAGE_TRANSACTIONS_KEY,
    XP_FOR_RESEARCHING_COMPONENT,
    calculateXpToNextLevel,
    DISPLAY_RESOLUTION_CATEGORIES_RD,
    DISPLAY_TECHNOLOGIES_RD,
    DISPLAY_REFRESH_RATES_RD
} from '@/lib/types';
import { FlaskConical, Loader2, PackagePlus, AlertCircle, Cpu, MonitorSmartphone, DollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEstimatedDisplayCostsAction, type EstimateCostsFormState } from './actions';
import { useSettings } from '@/context/SettingsContext'; // Import useSettings


// Zod Schemas
const customProcessorSchema = z.object({
    name: z.string().min(3, "validation_min3chars").max(50, "validation_max50chars"),
    antutuScore: z.number({invalid_type_error: "validation_required"}).min(100000, "validation_minValue").max(5000000, "validation_maxValue"),
    coreCount: z.number({invalid_type_error: "validation_required"}).min(2, "validation_minValue").max(16, "validation_maxValue").int(),
    clockSpeed: z.number({invalid_type_error: "validation_required"}).min(1.0, "validation_minValue").max(5.0, "validation_maxValue"),
});
type CustomProcessorFormData = z.infer<typeof customProcessorSchema>;

const customDisplaySchema = z.object({
    name: z.string().min(3, "validation_min3chars").max(50, "validation_max50chars"),
    resolutionCategory: z.string().min(1, "validation_required"),
    technology: z.string().min(1, "validation_required"),
    refreshRate: z.number({invalid_type_error: "validation_required"}).min(60, "validation_minValue"),
});
type CustomDisplayFormData = z.infer<typeof customDisplaySchema>;

// Algorithmic cost calculation for Processors
const calculateAlgorithmicProcessorCosts = (data: CustomProcessorFormData): { manufacturingCost: number; researchCost: number } => {
    let mfgCost = 10; // Base manufacturing cost
    mfgCost += data.antutuScore / 40000; // Antutu score contribution
    mfgCost += data.coreCount * 4;       // Core count contribution
    mfgCost += data.clockSpeed * 15;     // Clock speed contribution

    mfgCost = Math.max(15, Math.min(600, parseFloat(mfgCost.toFixed(2)))); // Clamp mfg cost

    let researchCost = mfgCost * (8 + (data.antutuScore / 250000)); // Research cost based on mfg cost and Antutu
    researchCost = Math.max(mfgCost * 5, Math.min(200000, parseFloat(researchCost.toFixed(2)))); // Clamp research cost

    return { manufacturingCost: mfgCost, researchCost: researchCost };
};

// Algorithmic cost calculation for Displays (offline mode)
const calculateAlgorithmicDisplayCosts = (data: CustomDisplayFormData): { manufacturingCost: number; researchCost: number } => {
    let mfgCost = 10; // Base
    if (data.technology === 'oled') mfgCost += 25;
    if (data.technology === 'ltpo_oled') mfgCost += 45;
    if (data.resolutionCategory === 'fhd') mfgCost += 20;
    if (data.resolutionCategory === 'qhd') mfgCost += 40;
    mfgCost += (data.refreshRate - 60) / 2.5;

    mfgCost = parseFloat(Math.max(10, Math.min(250, mfgCost)).toFixed(2));
    
    let researchCost = mfgCost * 8;
    researchCost = parseFloat(Math.max(200, Math.min(60000, researchCost)).toFixed(2));

    return { manufacturingCost: mfgCost, researchCost: researchCost };
};


export default function RDPage() {
    const { t } = useTranslation();
    const { toast } = useToast();
    const { isOnlineMode } = useSettings(); // Get online/offline mode
    const [activeTab, setActiveTab] = useState("processors");

    // Processors State
    const [customProcessors, setCustomProcessors] = useState<CustomProcessor[]>([]);
    const [isResearchingProcessor, setIsResearchingProcessor] = useState(false);
    const [estimatedProcessorCosts, setEstimatedProcessorCosts] = useState<{mfg: number, res: number} | null>(null);

    // Displays State
    const [customDisplays, setCustomDisplays] = useState<CustomDisplay[]>([]);
    const [isEstimatingDisplayCosts, setIsEstimatingDisplayCosts] = useState(false);
    const [isResearchingDisplay, setIsResearchingDisplay] = useState(false);
    const [estimatedDisplayCosts, setEstimatedDisplayCosts] = useState<{mfg: number, res: number} | null>(null);

    // Processor Form
    const { control: procControl, handleSubmit: handleProcSubmit, reset: resetProcForm, formState: { errors: procErrors }, getValues: getProcValues, watch: watchProc } = useForm<CustomProcessorFormData>({
        resolver: zodResolver(customProcessorSchema),
        defaultValues: { name: '', antutuScore: 1000000, coreCount: 8, clockSpeed: 2.5 },
    });
    const watchedProcFormValues = watchProc(); // Watch all fields for processors

    useEffect(() => {
        // Automatically calculate processor costs when relevant fields change
        if (watchedProcFormValues.antutuScore && watchedProcFormValues.coreCount && watchedProcFormValues.clockSpeed) {
            const costs = calculateAlgorithmicProcessorCosts(watchedProcFormValues);
            setEstimatedProcessorCosts({mfg: costs.manufacturingCost, res: costs.researchCost});
        } else {
            setEstimatedProcessorCosts(null);
        }
    }, [watchedProcFormValues]);


    // Display Form
    const { control: displayControl, handleSubmit: handleDisplaySubmit, reset: resetDisplayForm, formState: { errors: displayErrors }, getValues: getDisplayValues } = useForm<CustomDisplayFormData>({
        resolver: zodResolver(customDisplaySchema),
        defaultValues: { name: '', resolutionCategory: DISPLAY_RESOLUTION_CATEGORIES_RD[1]?.value || '', technology: DISPLAY_TECHNOLOGIES_RD[1]?.value || '', refreshRate: DISPLAY_REFRESH_RATES_RD[1]?.value || 90 },
    });
    const watchedDisplayValues = useWatch({ control: displayControl });
    useEffect(() => { setEstimatedDisplayCosts(null); }, [watchedDisplayValues]);


    const loadComponents = useCallback(() => {
        const storedProcessors = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY);
        if (storedProcessors) try { setCustomProcessors(JSON.parse(storedProcessors)); } catch (e) { console.error(t('localStorageErrorCustomProcessorsConsole'), e); toast({ variant: "destructive", title: t('localStorageErrorTitle'), description: t('localStorageErrorCustomProcessors')}); localStorage.removeItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY); }
        
        const storedDisplays = localStorage.getItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY);
        if (storedDisplays) try { setCustomDisplays(JSON.parse(storedDisplays)); } catch (e) { console.error(t('localStorageErrorCustomDisplaysConsole'), e); toast({ variant: "destructive", title: t('localStorageErrorTitle'), description: t('localStorageErrorCustomDisplays')}); localStorage.removeItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY); }
    }, [t, toast]);

    useEffect(() => {
        loadComponents();
        const handleComponentsUpdate = () => loadComponents();
        window.addEventListener('customProcessorsChanged', handleComponentsUpdate);
        window.addEventListener('customDisplaysChanged', handleComponentsUpdate);
        return () => {
            window.removeEventListener('customProcessorsChanged', handleComponentsUpdate);
            window.removeEventListener('customDisplaysChanged', handleComponentsUpdate);
        };
    }, [loadComponents]);
    

    const onProcessorResearchSubmit = (data: CustomProcessorFormData) => {
        if (!estimatedProcessorCosts) { // Costs are now calculated algorithmically
            toast({ variant: "destructive", title: t('errorStatus'), description: t('errorEstimatingCosts') }); // Should not happen if form is filled
            return;
        }
        setIsResearchingProcessor(true);
        const {mfg: manufacturingCost, res: researchCost} = estimatedProcessorCosts;

        const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
        let currentStats: GameStats = statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 };
        if (currentStats.level === undefined) currentStats.level = 1; if (currentStats.xp === undefined) currentStats.xp = 0;

        if (currentStats.totalFunds < researchCost) {
            toast({ variant: "destructive", title: t('insufficientFundsErrorTitle'), description: t('insufficientFundsForResearchDesc', { name: data.name, researchCost: researchCost, availableFunds: currentStats.totalFunds.toFixed(2) }) });
            setIsResearchingProcessor(false); return;
        }

        currentStats.totalFunds -= researchCost;
        currentStats.xp += XP_FOR_RESEARCHING_COMPONENT;
        toast({ title: t('xpGainedNotification', { amount: XP_FOR_RESEARCHING_COMPONENT })});
        
        let xpToNext = calculateXpToNextLevel(currentStats.level);
        while (currentStats.xp >= xpToNext) { currentStats.level++; currentStats.xp -= xpToNext; xpToNext = calculateXpToNextLevel(currentStats.level); toast({ title: t('levelUpNotificationTitle'), description: t('levelUpNotificationDesc', { level: currentStats.level }) }); }

        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('gameStatsChanged'));

        const newProcessor: CustomProcessor = { ...data, id: `custom_proc_${Date.now()}`, type: 'custom_processor', manufacturingCost, researchCost };
        const updatedProcessors = [...customProcessors, newProcessor];
        setCustomProcessors(updatedProcessors);
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, JSON.stringify(updatedProcessors));
        window.dispatchEvent(new CustomEvent('customProcessorsChanged'));

        const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
        let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
        currentTransactions.push({ id: `txn_res_proc_${Date.now()}`, date: new Date().toISOString(), description: `transactionResearchProcessor{{processorName:${data.name}}}`, amount: -researchCost, type: 'expense' });
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
        window.dispatchEvent(new CustomEvent('transactionsChanged'));

        toast({ title: t('processorResearchedSuccessTitle'), description: t('processorResearchedSuccessDesc', { name: data.name }) });
        resetProcForm(); setEstimatedProcessorCosts(null); // Reset form and auto-calculated costs
        setIsResearchingProcessor(false);
    };

    const handleEstimateDisplayCosts = async () => {
        setIsEstimatingDisplayCosts(true);
        setEstimatedDisplayCosts(null);
        const formData = getDisplayValues();
        const inputData = { ...formData, refreshRate: Number(formData.refreshRate) };

        if (isOnlineMode) {
            const result = await getEstimatedDisplayCostsAction(inputData);
            if (!result.error && result.estimatedManufacturingCost && result.estimatedResearchCost) {
                setEstimatedDisplayCosts({ mfg: result.estimatedManufacturingCost, res: result.estimatedResearchCost });
                toast({ title: t('statusStatus'), description: t(result.messageKey || 'costsEstimatedSuccess') });
            } else {
                toast({ variant: "destructive", title: t('errorStatus'), description: t(result.messageKey || 'errorEstimatingCosts') });
            }
        } else {
            // Offline mode: use algorithmic calculation
            const costs = calculateAlgorithmicDisplayCosts(inputData);
            setEstimatedDisplayCosts({ mfg: costs.manufacturingCost, res: costs.researchCost });
            toast({ title: t('statusStatus'), description: t('costsEstimatedSuccess') + " (" + t('offlineMode') + ")" });
        }
        setIsEstimatingDisplayCosts(false);
    };

    const onDisplayResearchSubmit = (data: CustomDisplayFormData) => {
        if (!estimatedDisplayCosts) {
            toast({ variant: "destructive", title: t('errorStatus'), description: t('errorEstimatingCosts') });
            return;
        }
        setIsResearchingDisplay(true);
        const { mfg: manufacturingCost, res: researchCost } = estimatedDisplayCosts;

        const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
        let currentStats: GameStats = statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 };
        if (currentStats.totalFunds < researchCost) {
            toast({ variant: "destructive", title: t('insufficientFundsErrorTitle'), description: t('insufficientFundsForResearchDesc', { name: data.name, researchCost: researchCost, availableFunds: currentStats.totalFunds.toFixed(2) }) });
            setIsResearchingDisplay(false); return;
        }
        currentStats.totalFunds -= researchCost;
        currentStats.xp += XP_FOR_RESEARCHING_COMPONENT;
        toast({ title: t('xpGainedNotification', { amount: XP_FOR_RESEARCHING_COMPONENT })});
        let xpToNext = calculateXpToNextLevel(currentStats.level);
        while (currentStats.xp >= xpToNext) { currentStats.level++; currentStats.xp -= xpToNext; xpToNext = calculateXpToNextLevel(currentStats.level); toast({ title: t('levelUpNotificationTitle'), description: t('levelUpNotificationDesc', { level: currentStats.level }) }); }
        localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
        window.dispatchEvent(new CustomEvent('gameStatsChanged'));

        const newDisplay: CustomDisplay = { ...data, refreshRate: Number(data.refreshRate), id: `custom_disp_${Date.now()}`, type: 'custom_display', manufacturingCost, researchCost };
        const updatedDisplays = [...customDisplays, newDisplay];
        setCustomDisplays(updatedDisplays);
        localStorage.setItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY, JSON.stringify(updatedDisplays));
        window.dispatchEvent(new CustomEvent('customDisplaysChanged'));

        const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
        let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
        currentTransactions.push({ id: `txn_res_disp_${Date.now()}`, date: new Date().toISOString(), description: `transactionResearchDisplay{{displayName:${data.name}}}`, amount: -researchCost, type: 'expense' });
        localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
        window.dispatchEvent(new CustomEvent('transactionsChanged'));
        
        toast({ title: t('displayResearchedSuccessTitle'), description: t('displayResearchedSuccessDesc', { name: data.name }) });
        resetDisplayForm(); setEstimatedDisplayCosts(null);
        setIsResearchingDisplay(false);
    };
    
    const processorFormFields = [
        { name: "name" as keyof CustomProcessorFormData, labelKey: 'processorNameLabel', placeholderKey: 'processorNamePlaceholder', type: "text" },
        { name: "antutuScore" as keyof CustomProcessorFormData, labelKey: 'antutuScoreLabel', placeholderKey: 'antutuScorePlaceholder', type: "number", step: "1000" },
        { name: "coreCount" as keyof CustomProcessorFormData, labelKey: 'coreCountLabel', placeholderKey: 'coreCountPlaceholder', type: "number", step: "1" },
        { name: "clockSpeed" as keyof CustomProcessorFormData, labelKey: 'clockSpeedLabel', placeholderKey: 'clockSpeedPlaceholder', type: "number", step: "0.1" },
    ];

    const displayFormFields = [
        { name: "name" as keyof CustomDisplayFormData, labelKey: 'displayNameLabel', placeholderKey: 'displayNamePlaceholder', type: "text" },
        { name: "resolutionCategory" as keyof CustomDisplayFormData, labelKey: 'displayResolutionLabel', type: "select", options: DISPLAY_RESOLUTION_CATEGORIES_RD, placeholderKey: 'selectDisplayResolution' },
        { name: "technology" as keyof CustomDisplayFormData, labelKey: 'displayTechnologyLabel', type: "select", options: DISPLAY_TECHNOLOGIES_RD, placeholderKey: 'selectDisplayTechnology' },
        { name: "refreshRate" as keyof CustomDisplayFormData, labelKey: 'displayRefreshRateLabel', type: "select", options: DISPLAY_REFRESH_RATES_RD, placeholderKey: 'selectDisplayRefreshRate' },
    ];

    return (
        <div className="space-y-8">
            <SectionTitle title={t('rdPageTitle')} description={t('rdPageDesc')} />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="processors">{t('rdProcessorsTab')}</TabsTrigger>
                    <TabsTrigger value="displays">{t('rdDisplaysTab')}</TabsTrigger>
                </TabsList>

                <TabsContent value="processors" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PackagePlus className="w-6 h-6 mr-2 text-primary" />
                                {t('developNewProcessorTitle')}
                            </CardTitle>
                             <CardDescription>{t('processorCostsCalculatedAutomatically')}</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleProcSubmit(onProcessorResearchSubmit)}>
                            <CardContent className="space-y-6">
                                {processorFormFields.map(fieldInfo => (
                                    <div key={fieldInfo.name} className="space-y-2">
                                        <Label htmlFor={`proc-${fieldInfo.name}`}>{t(fieldInfo.labelKey)}</Label>
                                        <Controller name={fieldInfo.name} control={procControl}
                                            render={({ field }) => (
                                                <Input id={`proc-${fieldInfo.name}`} type={fieldInfo.type} placeholder={t(fieldInfo.placeholderKey)} step={fieldInfo.step}
                                                    {...field} onChange={e => {
                                                        const value = fieldInfo.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                                                        field.onChange(isNaN(value as number) && fieldInfo.type === 'number' ? '' : value);
                                                     }} 
                                                     value={field.value === 0 && fieldInfo.type === 'number' ? "" : field.value} // Show empty for 0 to allow easier input
                                                     />
                                            )} />
                                        {procErrors[fieldInfo.name] && <p className="text-sm text-destructive">{t(procErrors[fieldInfo.name]?.message || '', { field: t(fieldInfo.labelKey), min: (customProcessorSchema.shape[fieldInfo.name] as any)?._def?.checks?.find((c:any) => c.kind ==='min')?.value, max: (customProcessorSchema.shape[fieldInfo.name] as any)?._def?.checks?.find((c:any) => c.kind ==='max')?.value })}</p>}
                                    </div>
                                ))}
                                
                                {estimatedProcessorCosts && (
                                    <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                                        <p>{t('estimatedMfgCost', {cost: estimatedProcessorCosts.mfg.toFixed(2)})}</p>
                                        <p>{t('estimatedResearchCost', {cost: estimatedProcessorCosts.res.toFixed(2)})}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isResearchingProcessor || !estimatedProcessorCosts}>
                                    {isResearchingProcessor ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                                    {isResearchingProcessor ? t('researchingProcessor') : t('btnResearchProcessor')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader><CardTitle className="flex items-center"><Cpu className="w-6 h-6 mr-2 text-primary" />{t('researchedProcessorsTitle')}</CardTitle></CardHeader>
                        <CardContent>
                            {customProcessors.length === 0 ? (
                                <Alert variant="default" className="bg-muted/50"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('noResearchedProcessors')}</AlertDescription></Alert>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>{t('header_name')}</TableHead><TableHead className="text-right">{t('header_antutu')}</TableHead><TableHead className="text-right">{t('header_cores')}</TableHead><TableHead className="text-right">{t('header_clock')}</TableHead><TableHead className="text-right">{t('header_mfgCost')}</TableHead><TableHead className="text-right">{t('header_resCost')}</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {customProcessors.map((proc) => (
                                            <TableRow key={proc.id}><TableCell className="font-medium">{proc.name}</TableCell><TableCell className="text-right">{proc.antutuScore.toLocaleString()}</TableCell><TableCell className="text-right">{proc.coreCount}</TableCell><TableCell className="text-right">{proc.clockSpeed.toFixed(1)}</TableCell><TableCell className="text-right">${proc.manufacturingCost.toFixed(2)}</TableCell><TableCell className="text-right">${proc.researchCost.toFixed(2)}</TableCell></TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="displays" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <PackagePlus className="w-6 h-6 mr-2 text-primary" />
                                {t('developNewDisplayTitle')}
                            </CardTitle>
                             <CardDescription>{isOnlineMode ? t('displayCostsEstimatedByAI') : t('displayCostsCalculatedOffline')}</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleDisplaySubmit(onDisplayResearchSubmit)}>
                            <CardContent className="space-y-6">
                                {displayFormFields.map(fieldInfo => (
                                    <div key={fieldInfo.name} className="space-y-2">
                                        <Label htmlFor={`disp-${fieldInfo.name}`}>{t(fieldInfo.labelKey)}</Label>
                                        <Controller name={fieldInfo.name} control={displayControl}
                                            render={({ field }) => {
                                                if (fieldInfo.type === 'select') {
                                                    return (
                                                        <Select onValueChange={ (value) => field.onChange(fieldInfo.name === 'refreshRate' ? Number(value) : value) } value={String(field.value)} defaultValue={String(field.value)}>
                                                            <SelectTrigger id={`disp-${fieldInfo.name}`}><SelectValue placeholder={t(fieldInfo.placeholderKey || 'selectPlaceholder')} /></SelectTrigger>
                                                            <SelectContent>
                                                                {fieldInfo.options?.map(opt => <SelectItem key={String(opt.value)} value={String(opt.value)}>{t(opt.label)}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
                                                    );
                                                }
                                                return <Input id={`disp-${fieldInfo.name}`} type={fieldInfo.type} placeholder={t(fieldInfo.placeholderKey || '')} {...field} onChange={e => field.onChange(fieldInfo.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)} />;
                                            }} />
                                        {displayErrors[fieldInfo.name] && <p className="text-sm text-destructive">{t(displayErrors[fieldInfo.name]?.message || '', { field: t(fieldInfo.labelKey), min: (customDisplaySchema.shape[fieldInfo.name] as any)?._def?.checks?.find((c:any) => c.kind ==='min')?.value })}</p>}
                                    </div>
                                ))}
                                <Button type="button" variant="outline" onClick={handleEstimateDisplayCosts} disabled={isEstimatingDisplayCosts || isResearchingDisplay}>
                                    {isEstimatingDisplayCosts ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DollarSign className="mr-2 h-4 w-4" />}
                                    {isOnlineMode ? t('btnEstimateCostsAI') : t('btnEstimateCostsOffline')}
                                </Button>
                                {estimatedDisplayCosts && (
                                    <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
                                        <p>{t('estimatedMfgCost', {cost: estimatedDisplayCosts.mfg.toFixed(2)})}</p>
                                        <p>{t('estimatedResearchCost', {cost: estimatedDisplayCosts.res.toFixed(2)})}</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={isResearchingDisplay || isEstimatingDisplayCosts || !estimatedDisplayCosts}>
                                    {isResearchingDisplay ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FlaskConical className="mr-2 h-4 w-4" />}
                                    {isResearchingDisplay ? t('researchingDisplay') : t('btnResearchDisplay')}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                    <Card className="mt-6">
                        <CardHeader><CardTitle className="flex items-center"><MonitorSmartphone className="w-6 h-6 mr-2 text-primary" />{t('researchedDisplaysTitle')}</CardTitle></CardHeader>
                        <CardContent>
                            {customDisplays.length === 0 ? (
                                <Alert variant="default" className="bg-muted/50"><AlertCircle className="h-4 w-4" /><AlertDescription>{t('noResearchedDisplays')}</AlertDescription></Alert>
                            ) : (
                                <Table>
                                    <TableHeader><TableRow><TableHead>{t('header_name')}</TableHead><TableHead>{t('header_resolution')}</TableHead><TableHead>{t('header_technology')}</TableHead><TableHead className="text-right">{t('header_refreshRate')}</TableHead><TableHead className="text-right">{t('header_mfgCost')}</TableHead><TableHead className="text-right">{t('header_resCost')}</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {customDisplays.map((disp) => (
                                            <TableRow key={disp.id}><TableCell className="font-medium">{disp.name}</TableCell><TableCell>{t(DISPLAY_RESOLUTION_CATEGORIES_RD.find(r=>r.value===disp.resolutionCategory)?.label || disp.resolutionCategory)}</TableCell><TableCell>{t(DISPLAY_TECHNOLOGIES_RD.find(tVal=>tVal.value===disp.technology)?.label || disp.technology)}</TableCell><TableCell className="text-right">{disp.refreshRate}</TableCell><TableCell className="text-right">${disp.manufacturingCost.toFixed(2)}</TableCell><TableCell className="text-right">${disp.researchCost.toFixed(2)}</TableCell></TableRow>
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
