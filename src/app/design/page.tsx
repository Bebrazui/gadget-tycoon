
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  DollarSign, HardDrive, Smartphone, Palette, Ruler, Zap, Camera, Loader2,
  MonitorSmartphone, RefreshCw, Droplets, GalleryVertical, SmartphoneNfc, Cog, UserCircle, Info, AlertCircle, Edit3, Package,
  ShieldCheck, Video, Aperture, ZoomIn, ImageUp
} from 'lucide-react';
import Image from 'next/image';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS, COLOR_OPTIONS,
  RAM_COST_PER_GB, STORAGE_COST_PER_GB, CAMERA_COST_PER_MP, BATTERY_COST_PER_100MAH,
  REFRESH_RATE_OPTIONS, WATER_RESISTANCE_OPTIONS, SIM_SLOT_OPTIONS, NFC_COST, OIS_COST,
  OPERATING_SYSTEM_OPTIONS, FRONT_CAMERA_COST_PER_MP, SCREEN_SIZE_COST_FACTOR,
  ULTRAWIDE_COST_PER_MP, TELEPHOTO_COST_PER_MP, TELEPHOTO_ZOOM_OPTIONS, VIDEO_RESOLUTION_OPTIONS,
  type PhoneDesign, type PhoneComponentOption, type GameStats, type Transaction, type CustomProcessor, type CustomDisplay,
  LOCAL_STORAGE_MY_PHONES_KEY, LOCAL_STORAGE_GAME_STATS_KEY, LOCAL_STORAGE_TRANSACTIONS_KEY,
  INITIAL_FUNDS, BASE_DESIGN_ASSEMBLY_COST, SALE_MARKUP_FACTOR,
  XP_FOR_DESIGNING_PHONE, calculateXpToNextLevel, LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY, LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY,
  MONEY_BONUS_PER_LEVEL_BASE, MONEY_BONUS_FIXED_AMOUNT, GeneratePhoneReviewOutputSchema,
  LOCAL_STORAGE_ACTIVE_EVENTS_KEY, type ActiveGameEvent, type ComponentCategory
} from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/useTranslation';
import { getPhoneDesignReview, type GenerateReviewFormState } from './actions';
import { useSettings } from '@/context/SettingsContext';
import { checkAllAchievements } from '@/lib/achievements';


const phoneDesignSchema = z.object({
  name: z.string().min(3, "validation_min3chars").max(50, "validation_max50chars"),
  processor: z.string().min(1, "validation_required"),
  displayType: z.string().min(1, "validation_required"),
  ram: z.number().min(2).max(32),
  storage: z.number().min(32).max(2048),
  cameraResolution: z.number().min(8).max(200), // Main camera
  batteryCapacity: z.number().min(2000).max(10000),
  material: z.string().min(1, "validation_required"),
  color: z.string().min(1, "validation_required"),
  height: z.number().min(100).max(200),
  width: z.number().min(50).max(100),
  thickness: z.number().min(5).max(15),
  screenSize: z.number().min(5.0).max(7.5).step(0.1),
  refreshRate: z.string().min(1, "validation_required"),
  waterResistance: z.string().min(1, "validation_required"),
  simSlots: z.string().min(1, "validation_required"),
  nfcSupport: z.boolean(),
  operatingSystem: z.string().min(1, "validation_required"),
  frontCameraResolution: z.number().min(5).max(100),
  hasOIS: z.boolean(),
  ultrawideCameraMP: z.number().min(0).max(64),
  telephotoCameraMP: z.number().min(0).max(64),
  telephotoZoom: z.string().min(1, "validation_required"),
  videoResolution: z.string().min(1, "validation_required"),
  productionQuantity: z.number().min(1, "validation_minProduction").max(10000, "validation_maxProduction").positive("validation_positiveNumber"),
});

type PhoneDesignFormData = z.infer<typeof phoneDesignSchema>;

function generateLocalPhoneReview(
  phoneDetails: Omit<PhoneDesign, 'id' | 'productionQuantity' | 'currentStock' | 'imageUrl' | 'salePrice' | 'quantityListedForSale'> & {unitManufacturingCost: number},
  t: (key: string, replacements?: Record<string, string | number>) => string
): z.infer<typeof GeneratePhoneReviewOutputSchema> {
  const pros: string[] = [];
  const cons: string[] = [];
  let sentimentScore = 0; // Used to determine overall sentiment

  // Processor Analysis
  const highEndProcessors = ['snapdragon_8_gen_3', 'bionic_a17_pro', 'snapdragon_8_gen_2', 'dimensity_9000_plus'];
  if (highEndProcessors.some(p => phoneDetails.processor.includes(p))) {
    pros.push(t('local_review_pro_powerful_processor', { processor: phoneDetails.processor }));
    sentimentScore += 2;
  } else if (phoneDetails.processor.includes('budget') || phoneDetails.processor.includes('snapdragon_680') || phoneDetails.processor.includes('helio_g99')) {
    cons.push(t('local_review_con_basic_processor', { processor: phoneDetails.processor }));
    sentimentScore -= 1;
  } else {
     pros.push(t('local_review_pro_decent_processor', { processor: phoneDetails.processor }));
     sentimentScore +=1;
  }

  // RAM Analysis
  if (phoneDetails.ram >= 12) { pros.push(t('local_review_pro_ample_ram', { ram: phoneDetails.ram })); sentimentScore += 1.5; }
  else if (phoneDetails.ram >= 8) { pros.push(t('local_review_pro_good_ram', { ram: phoneDetails.ram })); sentimentScore += 1; }
  else if (phoneDetails.ram < 6) { cons.push(t('local_review_con_low_ram', { ram: phoneDetails.ram })); sentimentScore -= 1; }

  // Storage Analysis
  if (phoneDetails.storage >= 512) { pros.push(t('local_review_pro_large_storage', { storage: phoneDetails.storage })); sentimentScore += 1; }
  else if (phoneDetails.storage < 128) { cons.push(t('local_review_con_small_storage', { storage: phoneDetails.storage })); sentimentScore -=1; }

  // Main Camera Analysis
  if (phoneDetails.cameraResolution >= 64) { pros.push(t('local_review_pro_high_res_camera', { mp: phoneDetails.cameraResolution })); sentimentScore += 1; }
  else if (phoneDetails.cameraResolution < 20) { cons.push(t('local_review_con_modest_camera', { mp: phoneDetails.cameraResolution })); sentimentScore -= 0.5; }

  // Battery Analysis
  if (phoneDetails.batteryCapacity >= 5000) { pros.push(t('local_review_pro_large_battery', { capacity: phoneDetails.batteryCapacity })); sentimentScore += 1.5; }
  else if (phoneDetails.batteryCapacity < 3500) { cons.push(t('local_review_con_small_battery', { capacity: phoneDetails.batteryCapacity })); sentimentScore -= 1; }

  // Display Refresh Rate
  if (phoneDetails.refreshRate.includes('120') || phoneDetails.refreshRate.includes('144')) {
    pros.push(t('local_review_pro_high_refresh_rate', { rate: phoneDetails.refreshRate }));
    sentimentScore += 1;
  }

  // Material
  if (phoneDetails.material.includes('titanium') || phoneDetails.material.includes('glass_premium')) {
    pros.push(t('local_review_pro_premium_material', { material: phoneDetails.material }));
    sentimentScore += 1;
  }

  // Other Features
  if (phoneDetails.nfcSupport) { pros.push(t('local_review_pro_nfc')); sentimentScore += 0.5; }
  if (phoneDetails.hasOIS) { pros.push(t('local_review_pro_ois')); sentimentScore += 0.5; }
  if (phoneDetails.ultrawideCameraMP > 0) { pros.push(t('local_review_pro_ultrawide')); sentimentScore += 0.5; }
  if (phoneDetails.telephotoCameraMP > 0) { pros.push(t('local_review_pro_telephoto')); sentimentScore += 0.5; }

  // Cost Consideration (Value for Money)
  if (phoneDetails.unitManufacturingCost > 0) {
      const valueScore = (sentimentScore * 100) / phoneDetails.unitManufacturingCost;
      if (valueScore > 2 && phoneDetails.unitManufacturingCost < 350) { 
          pros.push(t('local_review_pro_good_value')); sentimentScore += 1; 
      } else if (valueScore < 0.8 && phoneDetails.unitManufacturingCost > 500) { 
          cons.push(t('local_review_con_expensive')); sentimentScore -= 1; 
      } else if (phoneDetails.unitManufacturingCost < 200 && sentimentScore > 0) {
          pros.push(t('local_review_pro_affordable')); sentimentScore += 0.5;
      }
  }

  // Determine Overall Sentiment
  let overallSentiment: "Positive" | "Neutral" | "Negative" = "Neutral";
  if (sentimentScore >= 3) overallSentiment = "Positive";
  else if (sentimentScore <= -1.5) overallSentiment = "Negative";

  // Select Review Template
  let reviewText = "";
  const reviewTypeRoll = Math.random();

  if (reviewTypeRoll < 0.33) { // Short review
    if (overallSentiment === "Positive") reviewText = t('local_review_short_positive', { phoneName: phoneDetails.name });
    else if (overallSentiment === "Negative") reviewText = t('local_review_short_negative', { phoneName: phoneDetails.name });
    else reviewText = t('local_review_short_neutral', { phoneName: phoneDetails.name });
  } else if (reviewTypeRoll < 0.66) { // Medium review (template 1)
    reviewText = t('local_review_template1', { 
        phoneName: phoneDetails.name, 
        pro_feature: pros[0] || t('local_review_its_features'), 
        con_feature: cons[0] || t('local_review_some_aspects') 
    });
  } else { // Detailed review (template 2 or 3)
     const detailedTemplates = [
        t('local_review_template2', { phoneName: phoneDetails.name, overall_feel: t(`sentiment_${overallSentiment}`), cost: phoneDetails.unitManufacturingCost.toFixed(0) }),
        t('local_review_template3', { phoneName: phoneDetails.name, highlight: pros[0] || t('local_review_its_performance') }),
     ];
     reviewText = detailedTemplates[Math.floor(Math.random() * detailedTemplates.length)];
  }

  return {
    reviewText: reviewText.slice(0, 300) + (reviewText.length > 300 ? "..." : ""),
    pros: pros.slice(0, Math.max(1, Math.floor(Math.random() * 3) + 1)), // 1 to 3 pros
    cons: cons.slice(0, Math.max(1, Math.floor(Math.random() * 2) + 1)), // 1 to 2 cons
    overallSentiment,
  };
}

export default function DesignPhonePage() {
  const { t, language } = useTranslation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [unitManufacturingCost, setUnitManufacturingCost] = useState(0);
  const [totalProductionCost, setTotalProductionCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [reviewState, setReviewState] = useState<GenerateReviewFormState | null>(null);
  const [customProcessors, setCustomProcessors] = useState<CustomProcessor[]>([]);
  const [customDisplays, setCustomDisplays] = useState<CustomDisplay[]>([]);
  const [activeGameEvents, setActiveGameEvents] = useState<ActiveGameEvent[]>([]);

  const defaultValues: PhoneDesignFormData = useMemo(() => ({ 
    name: '',
    processor: PROCESSOR_OPTIONS.options?.[0].value || '',
    displayType: DISPLAY_OPTIONS.options?.[0].value || '',
    ram: 8,
    storage: 128,
    cameraResolution: 48,
    batteryCapacity: 4500,
    material: MATERIAL_OPTIONS.options?.[0].value || '',
    color: COLOR_OPTIONS[0].value,
    height: 160,
    width: 75,
    thickness: 8,
    screenSize: 6.1,
    refreshRate: REFRESH_RATE_OPTIONS.options?.[0].value || '',
    waterResistance: WATER_RESISTANCE_OPTIONS.options?.[0].value || '',
    simSlots: SIM_SLOT_OPTIONS.options?.[0].value || '',
    nfcSupport: false,
    operatingSystem: OPERATING_SYSTEM_OPTIONS.options?.[0].value || '',
    frontCameraResolution: 12,
    hasOIS: false,
    ultrawideCameraMP: 0,
    telephotoCameraMP: 0,
    telephotoZoom: TELEPHOTO_ZOOM_OPTIONS.options?.[0].value || 'none',
    videoResolution: VIDEO_RESOLUTION_OPTIONS.options?.[0].value || '1080p30',
    productionQuantity: 100,
  }), []);


  const { control, handleSubmit, watch, formState: { errors }, reset, getValues, setValue } = useForm<PhoneDesignFormData>({
    resolver: zodResolver(phoneDesignSchema),
    defaultValues,
  });

  const watchedValues = watch();

  const loadCustomComponentsAndEvents = useCallback(() => {
    const storedProcs = localStorage.getItem(LOCAL_STORAGE_CUSTOM_PROCESSORS_KEY);
    if (storedProcs) try { 
        const parsed = JSON.parse(storedProcs) as CustomProcessor[];
        setCustomProcessors(parsed);
         const currentProcValue = getValues("processor");
         const allProcOpts = [...(PROCESSOR_OPTIONS.options || []), ...parsed.map(cp => ({ value: cp.id, label: cp.name, cost: cp.manufacturingCost }))];
         if (!allProcOpts.find(opt => opt.value === currentProcValue) && allProcOpts.length > 0) setValue("processor", allProcOpts[0].value);
    } catch (e) { console.error(t('localStorageErrorCustomProcessorsConsole'), e); setCustomProcessors([]); }

    const storedDisplays = localStorage.getItem(LOCAL_STORAGE_CUSTOM_DISPLAYS_KEY);
    if (storedDisplays) try { 
        const parsed = JSON.parse(storedDisplays) as CustomDisplay[];
        setCustomDisplays(parsed);
        const currentDisplayValue = getValues("displayType");
        const allDisplayOpts = [...(DISPLAY_OPTIONS.options || []), ...parsed.map(cd => ({ value: cd.id, label: cd.name, cost: cd.manufacturingCost }))];
        if (!allDisplayOpts.find(opt => opt.value === currentDisplayValue) && allDisplayOpts.length > 0) setValue("displayType", allDisplayOpts[0].value);
    } catch (e) { console.error(t('localStorageErrorCustomDisplaysConsole'), e); setCustomDisplays([]); }

    const eventsString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_EVENTS_KEY);
    setActiveGameEvents(eventsString ? JSON.parse(eventsString) : []);

  }, [t, getValues, setValue]);


  useEffect(() => {
    loadCustomComponentsAndEvents();
    const handleCustomComponentsChanged = () => loadCustomComponentsAndEvents();
    window.addEventListener('customProcessorsChanged', handleCustomComponentsChanged);
    window.addEventListener('customDisplaysChanged', handleCustomComponentsChanged);
    window.addEventListener('activeEventsChanged', handleCustomComponentsChanged); // Listen for event changes
    return () => {
        window.removeEventListener('customProcessorsChanged', handleCustomComponentsChanged);
        window.removeEventListener('customDisplaysChanged', handleCustomComponentsChanged);
        window.removeEventListener('activeEventsChanged', handleCustomComponentsChanged);
    };
  }, [loadCustomComponentsAndEvents]);


  const allProcessorOptions = useMemo(() => {
    const predefined = PROCESSOR_OPTIONS.options?.map(opt => ({ ...opt, label: t(opt.label) || opt.label })) || [];
    const custom = customProcessors.map(cp => ({
        value: cp.id, 
        label: `${cp.name} (${t('customLabelSuffix')})`,
        cost: cp.manufacturingCost,
        antutuScore: cp.antutuScore,
        coreCount: cp.coreCount,
        clockSpeed: cp.clockSpeed
    }));
    return [...predefined, ...custom];
  }, [customProcessors, t]);

  const allDisplayOptions = useMemo(() => {
    const predefined = DISPLAY_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label})) || [];
    const custom = customDisplays.map(cd => ({
      value: cd.id, 
      label: t('customDisplayLabel', {name: cd.name}),
      cost: cd.manufacturingCost,
      resolutionCategory: cd.resolutionCategory,
      technology: cd.technology,
      refreshRateValue: cd.refreshRate,
    }));
    return [...predefined, ...custom];
  }, [customDisplays, t]);


  const getOptionCost = useCallback((value: string, componentType: ComponentCategory): number => {
    let baseCost = 0;
    if (componentType === 'processor') {
        const selectedProc = allProcessorOptions.find(opt => opt.value === value);
        baseCost = selectedProc?.cost || 0;
    } else if (componentType === 'display') {
        const selectedDisplay = allDisplayOptions.find(opt => opt.value === value);
        baseCost = selectedDisplay?.cost || 0;
    } else if (componentType === 'material') {
        baseCost = MATERIAL_OPTIONS.options?.find(opt => opt.value === value)?.cost || 0;
    }
    
    activeGameEvents.forEach(event => {
      if (event.remainingDays >=0 && event.definition.type === 'component_cost_modifier' && event.definition.componentCategory === componentType) {
            baseCost *= event.definition.effectValue;
        }
    });
    return baseCost;
  }, [allProcessorOptions, allDisplayOptions, activeGameEvents]);

  const calculateCosts = useCallback(() => {
    let unitCost = 0;
    unitCost += getOptionCost(watchedValues.processor, 'processor');
    unitCost += getOptionCost(watchedValues.displayType, 'display');
    unitCost += getOptionCost(watchedValues.material, 'material');
    
    let ramCost = watchedValues.ram * RAM_COST_PER_GB;
    activeGameEvents.forEach(event => {
        if (event.remainingDays >=0 && event.definition.type === 'component_cost_modifier' && event.definition.componentCategory === 'ram') {
            ramCost *= event.definition.effectValue;
        }
    });
    unitCost += ramCost;

    let storageCost = watchedValues.storage * STORAGE_COST_PER_GB;
     activeGameEvents.forEach(event => {
        if (event.remainingDays >=0 && event.definition.type === 'component_cost_modifier' && event.definition.componentCategory === 'storage') {
            storageCost *= event.definition.effectValue;
        }
    });
    unitCost += storageCost;

    let mainCameraCost = watchedValues.cameraResolution * CAMERA_COST_PER_MP;
    activeGameEvents.forEach(event => {
        if (event.remainingDays >=0 && event.definition.type === 'component_cost_modifier' && event.definition.componentCategory === 'camera') { // Assuming general camera cost event
            mainCameraCost *= event.definition.effectValue;
        }
    });
    unitCost += mainCameraCost;
    
    let batteryCost = (watchedValues.batteryCapacity / 100) * BATTERY_COST_PER_100MAH;
    activeGameEvents.forEach(event => {
        if (event.remainingDays >=0 && event.definition.type === 'component_cost_modifier' && event.definition.componentCategory === 'battery') {
            batteryCost *= event.definition.effectValue;
        }
    });
    unitCost += batteryCost;

    unitCost += (watchedValues.screenSize - 5.0) * SCREEN_SIZE_COST_FACTOR;
    unitCost += REFRESH_RATE_OPTIONS.options?.find(opt => opt.value === watchedValues.refreshRate)?.cost || 0;
    unitCost += WATER_RESISTANCE_OPTIONS.options?.find(opt => opt.value === watchedValues.waterResistance)?.cost || 0;
    unitCost += SIM_SLOT_OPTIONS.options?.find(opt => opt.value === watchedValues.simSlots)?.cost || 0;
    if (watchedValues.nfcSupport) unitCost += NFC_COST;
    if (watchedValues.hasOIS) unitCost += OIS_COST;
    unitCost += OPERATING_SYSTEM_OPTIONS.options?.find(opt => opt.value === watchedValues.operatingSystem)?.cost || 0;
    unitCost += watchedValues.frontCameraResolution * FRONT_CAMERA_COST_PER_MP;
    if (watchedValues.ultrawideCameraMP > 0) unitCost += watchedValues.ultrawideCameraMP * ULTRAWIDE_COST_PER_MP;
    if (watchedValues.telephotoCameraMP > 0) unitCost += watchedValues.telephotoCameraMP * TELEPHOTO_COST_PER_MP;
    unitCost += TELEPHOTO_ZOOM_OPTIONS.options?.find(opt => opt.value === watchedValues.telephotoZoom)?.cost || 0;
    unitCost += VIDEO_RESOLUTION_OPTIONS.options?.find(opt => opt.value === watchedValues.videoResolution)?.cost || 0;

    unitCost += BASE_DESIGN_ASSEMBLY_COST;

    setUnitManufacturingCost(parseFloat(unitCost.toFixed(2)));
    const prodQty = typeof watchedValues.productionQuantity === 'number' ? watchedValues.productionQuantity : 0;
    setTotalProductionCost(parseFloat((unitCost * prodQty).toFixed(2)));

  }, [watchedValues, getOptionCost, activeGameEvents]);

  useEffect(() => {
    calculateCosts();
  }, [watchedValues, calculateCosts]);

  const onSubmit = async (data: PhoneDesignFormData) => {
    setIsSubmitting(true);
    setReviewState(null);

    calculateCosts(); 
    const currentUnitCost = unitManufacturingCost; 
    const currentTotalCost = currentUnitCost * data.productionQuantity;


    const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let currentStats: GameStats = statsString
      ? JSON.parse(statsString)
      : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 };

    if (currentStats.level === undefined) currentStats.level = 1;
    if (currentStats.xp === undefined) currentStats.xp = 0;


    if (currentStats.totalFunds < currentTotalCost) {
      toast({
        variant: "destructive",
        title: t('insufficientFundsErrorTitle'),
        description: t('insufficientFundsErrorDesc', {
            name: data.name,
            quantity: data.productionQuantity,
            totalCost: currentTotalCost.toFixed(2),
            availableFunds: currentStats.totalFunds.toFixed(2)
        }),
      });
      setIsSubmitting(false);
      return;
    }

    currentStats.totalFunds -= currentTotalCost;

    const xpFromDesign = XP_FOR_DESIGNING_PHONE;
    currentStats.xp += xpFromDesign;
    toast({
      title: t('xpGainedNotification', { amount: xpFromDesign }),
    });

    let xpToNext = calculateXpToNextLevel(currentStats.level);
    while (currentStats.xp >= xpToNext) {
      currentStats.level++;
      currentStats.xp -= xpToNext;
      xpToNext = calculateXpToNextLevel(currentStats.level);
      const moneyBonus = MONEY_BONUS_FIXED_AMOUNT + (currentStats.level * MONEY_BONUS_PER_LEVEL_BASE);
      currentStats.totalFunds += moneyBonus;
      toast({
        title: t('levelUpNotificationTitle'),
        description: t('levelUpNotificationDesc', { level: currentStats.level }),
      });
      toast({
        title: t('moneyBonusNotification', {amount: moneyBonus.toLocaleString(language)}),
        description: t('congratulationsOnLevelUp'),
      });
    }

    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));

    const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
    const productionTransaction: Transaction = {
      id: `txn_prod_${Date.now()}`,
      date: new Date().toISOString(),
      description: `transactionProductionOf{{quantity:${data.productionQuantity},phoneName:${data.name}}}`,
      amount: -currentTotalCost,
      type: 'expense',
    };
    currentTransactions.push(productionTransaction);
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));
    window.dispatchEvent(new CustomEvent('transactionsChanged'));

    const phoneToSave: PhoneDesign = {
      ...data,
      id: Date.now().toString(),
      unitManufacturingCost: currentUnitCost,
      productionQuantity: data.productionQuantity,
      currentStock: data.productionQuantity,
      imageUrl: `https://placehold.co/300x200.png?text=${encodeURIComponent(data.name)}`,
      salePrice: parseFloat((currentUnitCost * SALE_MARKUP_FACTOR).toFixed(2)),
      quantityListedForSale: 0,
      review: undefined, 
      reviewType: undefined,
    };

    try {
      const existingPhonesString = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
      const existingPhones: PhoneDesign[] = existingPhonesString ? JSON.parse(existingPhonesString) : [];
      
      toast({
        title: t('phoneDesignSavedTitle'),
        description: t('phoneDesignSavedDesc', {
            name: data.name,
            quantity: data.productionQuantity,
            unitCost: currentUnitCost.toFixed(2),
            totalCost: currentTotalCost.toFixed(2)
        }),
      });

      let processorNameForReview = data.processor;
      const selectedProcOption = allProcessorOptions.find(opt => opt.value === data.processor);
      processorNameForReview = selectedProcOption ? selectedProcOption.label : data.processor;

      let displayTypeForReview = data.displayType;
      const selectedDisplayOption = allDisplayOptions.find(opt => opt.value === data.displayType);
      displayTypeForReview = selectedDisplayOption ? selectedDisplayOption.label : data.displayType;
      
      const reviewInputData = { 
        ...data, 
        unitManufacturingCost: currentUnitCost,
        processor: processorNameForReview,
        displayType: displayTypeForReview,
      };
      
      const reviewChance = Math.random();
      if (reviewChance < 0.18) { 
        if (settings.useOnlineFeatures) {
            setIsGeneratingReview(true);
            const reviewResult = await getPhoneDesignReview(reviewInputData);
            setReviewState(reviewResult);
            setIsGeneratingReview(false);

            if (reviewResult.review && !reviewResult.error) {
              phoneToSave.review = reviewResult.review.reviewText; 
              (phoneToSave as any).reviewType = 'ai';
              toast({
                title: t('aiReviewGeneratedTitle'),
                description: t('aiReviewGeneratedDesc', {name: data.name})
              });
            } else if (reviewResult.error) {
               toast({
                variant: "destructive",
                title: t('aiReviewErrorTitle'),
                description: reviewResult.message || t('aiReviewErrorDesc'),
              });
            }
        } else {
            const localReview = generateLocalPhoneReview(reviewInputData, t);
            setReviewState({
              message: t("localReviewGeneratedTitle"),
              review: localReview,
              error: false,
            });
            phoneToSave.review = localReview.reviewText;
            (phoneToSave as any).reviewType = 'local';
             toast({
              title: t('localReviewGeneratedTitle'),
              description: t('localReviewGeneratedDesc', {name: data.name})
             });
        }
      } else {
        const shortReviewTemplates = [
            t('local_review_very_short_generic', {phoneName: data.name}),
        ];
        phoneToSave.review = shortReviewTemplates[Math.floor(Math.random() * shortReviewTemplates.length)];
        (phoneToSave as any).reviewType = 'local_short'; 
        setReviewState({ 
            message: t("localReviewGeneratedTitle"),
            review: { reviewText: phoneToSave.review!, pros: [], cons: [], overallSentiment: "Neutral" },
            error: false
        });
         toast({
          title: t('localReviewGeneratedTitle'),
          description: t('localReviewGeneratedDesc', {name: data.name})
         });
      }
      
      const updatedPhones = [...existingPhones, phoneToSave];
      localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
      window.dispatchEvent(new CustomEvent('myPhonesChanged'));
      
      checkAllAchievements(currentStats, updatedPhones, toast, t, language);

      reset(defaultValues);

    } catch (error) {
      console.error("Error saving phone or generating review:", error);
      toast({
        variant: "destructive",
        title: t('genericErrorTitle'),
        description: t('genericErrorDesc'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formFields = useMemo(() => ({
    core: [
      { name: "name" as keyof PhoneDesignFormData, labelKey: 'phoneNameLabel', icon: Edit3, componentType: "Input", inputType: "text"},
      { name: "processor" as keyof PhoneDesignFormData, labelKey: 'processorLabel', icon: HardDrive, componentType: "Select", options: allProcessorOptions },
      { name: "displayType" as keyof PhoneDesignFormData, labelKey: 'displayTypeLabel', icon: Smartphone, componentType: "Select", options: allDisplayOptions },
      { name: "ram" as keyof PhoneDesignFormData, labelKey: 'ramLabel', icon: HardDrive, componentType: "Slider", min: 2, max: 32, step: 2, unit: "GB" },
      { name: "storage" as keyof PhoneDesignFormData, labelKey: 'storageLabel', icon: HardDrive, componentType: "Slider", min: 32, max: 2048, step: 32, unit: "GB" },
      { name: "batteryCapacity" as keyof PhoneDesignFormData, labelKey: 'batteryCapacityLabel', icon: Zap, componentType: "Slider", min: 2000, max: 10000, step: 100, unit: "mAh" },
    ],
    camera: [
      { name: "cameraResolution" as keyof PhoneDesignFormData, labelKey: 'cameraResolutionLabel', icon: Camera, componentType: "Slider", min: 8, max: 200, step: 4, unit: "MP" },
      { name: "frontCameraResolution" as keyof PhoneDesignFormData, labelKey: 'frontCameraResolutionLabel', icon: UserCircle, componentType: "Slider", min: 5, max: 100, step: 1, unit: "MP"},
      { name: "hasOIS" as keyof PhoneDesignFormData, labelKey: 'oisLabel', icon: ImageUp, componentType: "Switch"},
      { name: "ultrawideCameraMP" as keyof PhoneDesignFormData, labelKey: 'ultrawideCameraMPLabel', icon: Aperture, componentType: "Slider", min: 0, max: 64, step: 2, unit: "MP"},
      { name: "telephotoCameraMP" as keyof PhoneDesignFormData, labelKey: 'telephotoCameraMPLabel', icon: ZoomIn, componentType: "Slider", min: 0, max: 64, step: 2, unit: "MP"},
      { name: "telephotoZoom" as keyof PhoneDesignFormData, labelKey: 'telephotoZoomLabel', icon: ZoomIn, componentType: "Select", options: TELEPHOTO_ZOOM_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
      { name: "videoResolution" as keyof PhoneDesignFormData, labelKey: 'videoResolutionLabel', icon: Video, componentType: "Select", options: VIDEO_RESOLUTION_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
    ],
    physical: [
      { name: "material" as keyof PhoneDesignFormData, labelKey: 'materialLabel', icon: Smartphone, componentType: "Select", options: MATERIAL_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
      { name: "color" as keyof PhoneDesignFormData, labelKey: 'colorLabel', icon: Palette, componentType: "Select", options: COLOR_OPTIONS.map(c => ({...c, cost: 0, label: t(c.label) || c.label })) },
      { name: "screenSize" as keyof PhoneDesignFormData, labelKey: 'screenSizeLabel', icon: MonitorSmartphone, componentType: "Slider", min: 5.0, max: 7.5, step: 0.1, unit: t('inchesUnit') },
      { name: "height" as keyof PhoneDesignFormData, labelKey: 'heightLabel', icon: Ruler, componentType: "Input", inputType: "number", unit: "mm" },
      { name: "width" as keyof PhoneDesignFormData, labelKey: 'widthLabel', icon: Ruler, componentType: "Input", inputType: "number", unit: "mm" },
      { name: "thickness" as keyof PhoneDesignFormData, labelKey: 'thicknessLabel', icon: Ruler, componentType: "Input", inputType: "number", unit: "mm" },
    ],
    software: [
      { name: "operatingSystem" as keyof PhoneDesignFormData, labelKey: 'osLabel', icon: Cog, componentType: "Select", options: OPERATING_SYSTEM_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
      { name: "refreshRate" as keyof PhoneDesignFormData, labelKey: 'refreshRateLabel', icon: RefreshCw, componentType: "Select", options: REFRESH_RATE_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
      { name: "waterResistance" as keyof PhoneDesignFormData, labelKey: 'waterResistanceLabel', icon: Droplets, componentType: "Select", options: WATER_RESISTANCE_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
      { name: "simSlots" as keyof PhoneDesignFormData, labelKey: 'simSlotsLabel', icon: GalleryVertical, componentType: "Select", options: SIM_SLOT_OPTIONS.options?.map(opt => ({...opt, label: t(opt.label) || opt.label })) },
      { name: "nfcSupport" as keyof PhoneDesignFormData, labelKey: 'nfcSupportLabel', icon: SmartphoneNfc, componentType: "Switch", cost: NFC_COST},
    ],
    production: [
      { name: "productionQuantity" as keyof PhoneDesignFormData, labelKey: 'productionQuantityLabel', icon: Package, componentType: "Slider", min: 1, max: 10000, step: 1, unit: t('productionQuantityUnit')},
    ]
  }), [t, allProcessorOptions, allDisplayOptions]);

  const accordionItems = useMemo(() => [
    { value: "core", titleKey: "accordion_coreComponents", fields: formFields.core },
    { value: "camera", titleKey: "accordion_cameraSystem", fields: formFields.camera },
    { value: "physical", titleKey: "accordion_physicalAttributes", fields: formFields.physical },
    { value: "software", titleKey: "accordion_softwareConnectivity", fields: formFields.software },
    { value: "production", titleKey: "accordion_production", fields: formFields.production },
  ], [formFields]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('designPhoneTitle')}</CardTitle>
          <CardDescription>{t('designPhoneDesc')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-1">
            <Accordion type="multiple" defaultValue={["core", "camera", "physical", "software", "production"]} className="w-full">
              {accordionItems.map(item => (
                <AccordionItem value={item.value} key={item.value}>
                  <AccordionTrigger className="text-lg font-semibold">{t(item.titleKey)}</AccordionTrigger>
                  <AccordionContent className="pt-4 space-y-6">
                    {item.fields.map(field => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name} className="flex items-center">
                          {field.icon && <field.icon className="w-4 h-4 mr-2 text-muted-foreground" />}
                          {t(field.labelKey)}
                          {(field.componentType === "Slider") && (
                            <span className="ml-auto text-sm text-foreground">
                              {String(watchedValues[field.name as keyof PhoneDesignFormData])}
                              {field.unit ? ` ${t(field.unit) || field.unit}` : ''}
                              { (field.name === 'ultrawideCameraMP' || field.name === 'telephotoCameraMP') && Number(watchedValues[field.name as keyof PhoneDesignFormData]) === 0 ? ` (${t('disabled')})` : ''}
                            </span>
                          )}
                        </Label>
                        <Controller
                          name={field.name as any}
                          control={control}
                          render={({ field: controllerField }) => {
                            const commonProps = { ...controllerField, id: field.name };
                            if (field.componentType === "Select") {
                              return (
                                <Select onValueChange={commonProps.onChange} value={String(commonProps.value)} >
                                  <SelectTrigger>
                                    <SelectValue placeholder={t('selectPlaceholder', {label: t(field.labelKey).toLowerCase()})} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {field.options?.map(option => (
                                      <SelectItem key={option.value} value={option.value}>
                                        {option.label} {option.cost > 0 ? `(+$${option.cost})` : (option.cost < 0 ? `(-$${Math.abs(option.cost)})` : '')}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              );
                            }
                            if (field.componentType === "Slider") {
                              return (
                                <Slider
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                  value={[Number(commonProps.value)]}
                                  onValueChange={(value) => commonProps.onChange(value[0])}
                                />
                              );
                            }
                            if (field.componentType === "Input") {
                               return (
                                <Input
                                  type={field.inputType}
                                  value={String(commonProps.value)}
                                  onChange={(e) => {
                                    let val: string | number = e.target.value;
                                    if (field.inputType === 'number') {
                                        val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                        if (isNaN(val as number) && e.target.value !== '') val = 0; 
                                    }
                                    commonProps.onChange(val);
                                  }}
                                   placeholder={field.name === 'name' ? t('phoneNamePlaceholder') : ''}
                                />
                              );
                            }
                            if (field.componentType === "Switch") {
                              const costText = field.name === 'nfcSupport' ? `(+$${NFC_COST})` : field.name === 'hasOIS' ? `(+$${OIS_COST})` : '';
                              return (
                                <div className="flex items-center space-x-2">
                                  <Switch
                                    id={field.name}
                                    checked={Boolean(commonProps.value)}
                                    onCheckedChange={commonProps.onChange}
                                  />
                                  <Label htmlFor={field.name} className="text-sm text-muted-foreground">
                                    {Boolean(commonProps.value) ? t('enabled') : t('disabled')} {costText}
                                  </Label>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {errors[field.name as keyof PhoneDesignFormData] && <p className="text-sm text-destructive">{t(errors[field.name as keyof PhoneDesignFormData]?.message || '', {field: t(field.labelKey)})}</p>}
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button type="submit" disabled={isSubmitting || isGeneratingReview}>
              {(isSubmitting || isGeneratingReview) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isGeneratingReview ? t('generatingReviewButton') : t('saveDesignButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight"><DollarSign className="w-5 h-5 mr-2 text-primary" />{t('unitManufacturingCostTitle')}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">${unitManufacturingCost.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('estimatedCostDesc')}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight"><DollarSign className="w-5 h-5 mr-2 text-primary" />{t('totalProductionCostTitle')}</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary">${totalProductionCost.toFixed(2)}</p>
             <p className="text-sm text-muted-foreground mt-1">{t('totalProductionCostDesc', { quantity: typeof watchedValues.productionQuantity === 'number' ? watchedValues.productionQuantity : 0 })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-2xl font-semibold leading-none tracking-tight">{t('phonePreviewTitle')}</h3>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div
              className="bg-muted rounded-xl border-4 border-foreground/50 flex items-center justify-center p-1 overflow-hidden"
              style={{
                borderColor: watchedValues.color,
                width: `${Math.max(60, (watchedValues.width || 75) * 0.4 + 40)}px`,
                height: `${Math.max(120, (watchedValues.height || 160) * 0.4 + 80)}px`,
              }}
            >
              <div className="w-full h-full bg-background rounded-sm flex flex-col items-center justify-center text-center p-1">
                 <Smartphone className="w-10 h-10 text-muted-foreground mb-1" />
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{(allProcessorOptions.find(o=>o.value === watchedValues.processor)?.label || '').split(` (${t('customLabelSuffix')})`)[0]}</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{watchedValues.ram}GB RAM, {watchedValues.storage}GB</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{watchedValues.screenSize}" {(allDisplayOptions.find(o=>o.value === watchedValues.displayType)?.label || '').split(` (${t('customLabelSuffix')})`)[0]}</p>
                 <p className="text-[0.5rem] leading-tight text-muted-foreground">
                    Main: {watchedValues.cameraResolution}MP {watchedValues.hasOIS ? '(OIS)' : ''}
                    {watchedValues.ultrawideCameraMP > 0 ? `, UW: ${watchedValues.ultrawideCameraMP}MP` : ''}
                    {watchedValues.telephotoCameraMP > 0 ? `, Tele: ${watchedValues.telephotoCameraMP}MP (${(TELEPHOTO_ZOOM_OPTIONS.options?.find(o=>o.value === watchedValues.telephotoZoom)?.label || '').replace(' Optical Zoom', '').replace(' Оптический зум', '') || ''})` : ''}
                 </p>
                 <p className="text-[0.5rem] leading-tight text-muted-foreground">Front: {watchedValues.frontCameraResolution}MP</p>
                 <p className="text-[0.5rem] leading-tight text-muted-foreground">Video: {VIDEO_RESOLUTION_OPTIONS.options?.find(o=>o.value === watchedValues.videoResolution)?.label}</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{REFRESH_RATE_OPTIONS.options?.find(o=>o.value === watchedValues.refreshRate)?.label}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              {`${(MATERIAL_OPTIONS.options?.find(o=>o.value === watchedValues.material)?.label ? t(MATERIAL_OPTIONS.options?.find(o=>o.value === watchedValues.material)?.label || '') : '')}, ${(COLOR_OPTIONS.find(c => c.value === watchedValues.color)?.label ? t(COLOR_OPTIONS.find(c => c.value === watchedValues.color)?.label || '') : t('customColor'))}`}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {`${watchedValues.height || 160}mm x ${watchedValues.width || 75}mm x ${watchedValues.thickness || 8}mm`}
            </p>
             {watchedValues.nfcSupport && <p className="text-xs text-muted-foreground text-center flex items-center mt-1"><SmartphoneNfc className="w-3 h-3 mr-1"/>NFC</p>}
             <p className="text-xs text-muted-foreground text-center mt-1">{t(WATER_RESISTANCE_OPTIONS.options?.find(o=>o.value === watchedValues.waterResistance)?.label || '')}</p>
          </CardContent>
        </Card>
        {reviewState && reviewState.review && (
          <Card>
            <CardHeader>
              <h3 className="text-2xl font-semibold leading-none tracking-tight">
                {settings.useOnlineFeatures && reviewState.review?.pros?.length > 0 ? t('aiReviewCardTitle') : t('localReviewCardTitle')}
              </h3>
            </CardHeader>
            <CardContent>
              {reviewState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('aiReviewErrorTitle')}</AlertTitle>
                  <AlertDescription>{reviewState.message}</AlertDescription>
                </Alert>
              )}
              {reviewState.review && !reviewState.error && (
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold">{t('reviewOverallSentiment')}: <span className={`font-normal ${reviewState.review.overallSentiment === 'Positive' ? 'text-green-500' : reviewState.review.overallSentiment === 'Negative' ? 'text-red-500' : 'text-yellow-500'}`}>{t(`sentiment_${reviewState.review.overallSentiment}`)}</span></h4>
                    <p className="text-sm text-muted-foreground italic">"{reviewState.review.reviewText}"</p>
                  </div>
                  {reviewState.review.pros && reviewState.review.pros.length > 0 && (
                    <div>
                      <h4 className="font-semibold">{t('reviewPros')}:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {reviewState.review.pros.map((pro, i) => <li key={`pro-${i}`}>{pro}</li>)}
                      </ul>
                    </div>
                  )}
                  {reviewState.review.cons && reviewState.review.cons.length > 0 && (
                    <div>
                      <h4 className="font-semibold">{t('reviewCons')}:</h4>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {reviewState.review.cons.map((con, i) => <li key={`con-${i}`}>{con}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
               {isGeneratingReview && !reviewState.review && settings.useOnlineFeatures && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('generatingReviewMessage')}</p>}
            </CardContent>
          </Card>
        )}
         <Card>
          <CardHeader><h3 className="flex items-center text-2xl font-semibold leading-none tracking-tight"><Info className="w-5 h-5 mr-2 text-primary"/>{t('designTipsTitle')}</h3></CardHeader>
          <CardContent className="text-sm space-y-1 text-muted-foreground">
            <p>{t('designTip1')}</p>
            <p>{t('designTip2')}</p>
            <p>{t('designTip3')}</p>
            <p>{t('designTip4_myPhones')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
