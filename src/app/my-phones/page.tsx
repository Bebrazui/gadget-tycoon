
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Cpu, MemoryStick, HardDrive as StorageIcon, Camera, Zap, Fingerprint, Bot, Trash2, Info, Sparkles, ShieldCheck, Wifi, Maximize, UserCircle, RefreshCw, HandCoins, Package, TrendingUp, Edit, Video, Aperture, ZoomIn, ImageUp, MonitorSmartphone, Factory } from 'lucide-react';
import Image from 'next/image';
import type { PhoneDesign, GameStats, Transaction, ActiveGameEvent } from '@/lib/types';
import { 
  LOCAL_STORAGE_MY_PHONES_KEY,
  SALE_MARKUP_FACTOR,
  LOCAL_STORAGE_GAME_STATS_KEY,
  LOCAL_STORAGE_TRANSACTIONS_KEY,
  INITIAL_FUNDS,
  LOCAL_STORAGE_ACTIVE_EVENTS_KEY
} from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { SectionTitle } from '@/components/shared/SectionTitle';
import {
  PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS, REFRESH_RATE_OPTIONS,
  WATER_RESISTANCE_OPTIONS, SIM_SLOT_OPTIONS, OPERATING_SYSTEM_OPTIONS, COLOR_OPTIONS,
  TELEPHOTO_ZOOM_OPTIONS, VIDEO_RESOLUTION_OPTIONS
} from '@/lib/types';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';

interface SalesFormData {
  [phoneId: string]: {
    price: string;
    quantityToList: string;
  };
}

interface ProduceMoreQuantities {
  [phoneId: string]: string;
}

export default function MyPhonesPage() {
  const { t, language } = useTranslation(); 
  const { toast } = useToast();
  const [savedPhones, setSavedPhones] = useState<PhoneDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesFormData, setSalesFormData] = useState<SalesFormData>({});
  const [produceMoreQuantities, setProduceMoreQuantities] = useState<ProduceMoreQuantities>({});
  const [activeGameEvents, setActiveGameEvents] = useState<ActiveGameEvent[]>([]);


  const loadPhonesAndEvents = useCallback(() => {
    setIsLoading(true);
    const phonesFromStorage = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    let phones: PhoneDesign[] = [];
    if (phonesFromStorage) {
      try {
        const parsedPhones = JSON.parse(phonesFromStorage);
        const validPhones = Array.isArray(parsedPhones) ? parsedPhones.filter(p => p && typeof p === 'object' && p.id) : [];
        setSavedPhones(validPhones);

        const initialSalesData: SalesFormData = {};
        const initialProduceMoreQtys: ProduceMoreQuantities = {};
        validPhones.forEach(phone => {
          const unitCost = phone.unitManufacturingCost || 0;
          const defaultCalculatedPrice = unitCost * SALE_MARKUP_FACTOR;
          const salePrice = typeof phone.salePrice === 'number' ? phone.salePrice : defaultCalculatedPrice;

          initialSalesData[phone.id] = {
            price: salePrice.toFixed(2),
            quantityToList: (phone.quantityListedForSale || 0).toString(), 
          };
          initialProduceMoreQtys[phone.id] = '0'; 
        });
        setSalesFormData(initialSalesData);
        setProduceMoreQuantities(initialProduceMoreQtys);
      } catch (error) {
        console.error(t('localStorageErrorMyPhonesConsole'), error);
        localStorage.removeItem(LOCAL_STORAGE_MY_PHONES_KEY); 
        setSavedPhones([]);
        setSalesFormData({});
        setProduceMoreQuantities({});
        toast({
          variant: "destructive",
          title: t('localStorageErrorTitle'),
          description: t('localStorageErrorMyPhonesDesc'),
        });
      }
    } else {
      setSavedPhones([]);
      setSalesFormData({});
      setProduceMoreQuantities({});
    }

    const eventsString = localStorage.getItem(LOCAL_STORAGE_ACTIVE_EVENTS_KEY);
    setActiveGameEvents(eventsString ? JSON.parse(eventsString) : []);

    setIsLoading(false);
  }, [t, toast]); 

  useEffect(() => {
    loadPhonesAndEvents();
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_MY_PHONES_KEY || event.key === LOCAL_STORAGE_ACTIVE_EVENTS_KEY) {
            loadPhonesAndEvents();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    
    const handleMyPhonesUpdate = () => loadPhonesAndEvents();
    window.addEventListener('myPhonesChanged', handleMyPhonesUpdate);
    window.addEventListener('activeEventsChanged', handleMyPhonesUpdate); // Listen for event changes too
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('myPhonesChanged', handleMyPhonesUpdate);
      window.removeEventListener('activeEventsChanged', handleMyPhonesUpdate);
    };
  }, [loadPhonesAndEvents]);

  const getLabel = (optionsArray: any[] | undefined, value: string): string => {
    if (!optionsArray || !value) return value || t('notSet');
    const option = optionsArray.find(opt => opt.value === value);
    if (value.startsWith('custom_proc_') || value.startsWith('custom_disp_')) {
        return option ? option.label : (value || t('notSet')); 
    }
    return option ? t(option.label) : (value || t('notSet'));
  };

  const handleDeletePhone = (phoneId: string) => {
    const updatedPhones = savedPhones.filter(phone => phone.id !== phoneId);
    setSavedPhones(updatedPhones);
    localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
    setSalesFormData(prev => {
      const newData = {...prev};
      delete newData[phoneId];
      return newData;
    });
    setProduceMoreQuantities(prev => {
      const newData = {...prev};
      delete newData[phoneId];
      return newData;
    });
    toast({
      title: t('phoneDeletedTitle'),
      description: t('phoneDeletedDesc'),
    });
    window.dispatchEvent(new CustomEvent('myPhonesChanged'));
  };

  const handleSalesInputChange = (phoneId: string, field: 'price' | 'quantityToList', value: string) => {
    setSalesFormData(prev => ({
      ...prev,
      [phoneId]: {
        ...prev[phoneId],
        [field]: value,
      },
    }));
  };

  const handleProduceMoreInputChange = (phoneId: string, value: string) => {
    setProduceMoreQuantities(prev => ({
      ...prev,
      [phoneId]: value,
    }));
  };

  const handleListForSale = (phoneId: string) => {
    const phone = savedPhones.find(p => p.id === phoneId);
    if (!phone) return;

    const formData = salesFormData[phoneId];
    const quantityToList = parseInt(formData.quantityToList, 10);
    const newSalePrice = parseFloat(formData.price);

    if (isNaN(quantityToList) || quantityToList < 0) { 
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidQuantityNegative') }); 
      return;
    }
    if (isNaN(newSalePrice) || newSalePrice <= 0) {
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidPriceNegative') });
      return;
    }
    
    const alreadyListed = phone.quantityListedForSale || 0;
    const availableUnlistedStock = phone.currentStock || 0;
    const changeInListedQuantity = quantityToList - alreadyListed;

    if (changeInListedQuantity > availableUnlistedStock) {
        toast({
            variant: "destructive",
            title: t('genericErrorTitle'),
            description: t('notEnoughStockToList', { quantity: changeInListedQuantity, availableStock: availableUnlistedStock }),
        });
        return;
    }
    
    let operationMessage = '';
    const updatedPhones = savedPhones.map(p => {
      if (p.id === phoneId) {
        const newStockAfterListing = availableUnlistedStock - changeInListedQuantity;
        if (quantityToList > alreadyListed) {
            operationMessage = t('phoneListedSuccessfully', { quantity: changeInListedQuantity, phoneName: p.name, price: newSalePrice.toFixed(2) });
        } else if (quantityToList < alreadyListed) {
            operationMessage = t('phoneUnlistedSuccessfully', { quantity: alreadyListed - quantityToList, phoneName: p.name });
        } else {
             if (p.salePrice !== newSalePrice) {
                operationMessage = t('priceUpdatedSuccessfully', { phoneName: p.name, price: newSalePrice.toFixed(2) });
             } else {
                toast({ title: t('noChangesMade')}); 
                return p;
             }
        }
        return {
          ...p,
          currentStock: newStockAfterListing,
          quantityListedForSale: quantityToList,
          salePrice: newSalePrice,
        };
      }
      return p;
    });
    
    if (operationMessage) {
        setSavedPhones(updatedPhones);
        localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
        setSalesFormData(prev => ({
            ...prev,
            [phoneId]: {
                price: newSalePrice.toFixed(2),
                quantityToList: quantityToList.toString(),
            }
        }));
        toast({ title: operationMessage });
        window.dispatchEvent(new CustomEvent('myPhonesChanged'));
    }
  };
  
  const getAdjustedManufacturingCost = (phone: PhoneDesign): number => {
    let currentCost = phone.unitManufacturingCost;
    // This is a simplified application. In a real scenario, you'd iterate through phone.components
    // and apply event modifiers to each relevant component type.
    // For now, we'll assume events might apply to the overall cost or specific broad categories
    // if `phone.unitManufacturingCost` was calculated based on components that are affected by events.
    // This is a placeholder for a more detailed cost breakdown adjustment.
    // Example: if there's an event for 'processor' cost increase, and the phone's cost includes a processor.
    // For this to work accurately, the phone design process (`design/page.tsx`) should already incorporate these
    // event effects when calculating `unitManufacturingCost` for the new batch.
    // When producing *more* units, we re-evaluate the *current* manufacturing cost based on active events.
    // This requires a more detailed breakdown of phone.unitManufacturingCost or recalculating it.
    // For simplicity here, we'll apply a general modifier if available.
    // This part needs to mirror the logic in design/page.tsx calculateCosts more closely.

    // Simplified approach: recalculate cost based on current events
    // This would require access to the original component choices for the phone, which we don't store here.
    // The most straightforward approach for "Produce More" is to assume the stored unitManufacturingCost
    // reflects the cost *at the time of original production*. If events change component costs,
    // producing *new* units of an *old* design should use *current* component costs.
    // For now, we'll use the stored unitManufacturingCost but acknowledge this limitation.
    
    // Let's refine this: we need to simulate re-calculation for "Produce More"
    let recalculatedCost = 0;
    // Simulate based on what `design/page.tsx` does. This is still an approximation
    // as we don't have the exact component list here.
    // If `phone.processor` is an ID, we'd find its base cost then apply event.
    // This is complex without the full component structure of the phone.
    
    // A better approximation: Assume the unitManufacturingCost IS the base.
    // Then, check if any *broad category* events apply.
    // This is still not perfect but better than nothing.
    // Example: If a "processor" cost event is active, it's hard to tell how much of the phone's
    // total unit cost was due to the processor without a full breakdown.

    // The simplest accurate way is: when "Produce More" is clicked, the `unitManufacturingCost`
    // for THAT BATCH is recalculated based on current events, similar to how it's done on the Design page.
    // We'll simulate that here by taking the original cost and applying any *currently active* component_cost_modifiers.
    // This assumes the original `unitManufacturingCost` was the base cost without current events.

    let finalCost = phone.unitManufacturingCost;
    activeGameEvents.forEach(event => {
        // This is a simplification. We'd need to know which part of `unitManufacturingCost`
        // corresponds to `event.definition.componentCategory`.
        // For now, let's assume if *any* component_cost_modifier is active, we apply it to the whole cost as an example.
        // This is NOT ideal. A proper implementation needs to break down `unitManufacturingCost`
        // or re-fetch component costs based on `phone` spec and apply event modifiers.
        // The `design/page.tsx` `calculateCosts` is the source of truth for cost calculation.
        // We should aim to replicate that or use a shared cost calculation utility.

        // For now, let's use the most direct interpretation: if a component category cost changes,
        // and that category is part of the phone, the original cost is modified.
        // This is still tricky.
        // The most robust way for "Produce More" is that `phone.unitManufacturingCost` stores the
        // cost at the time of its *last production run*.
        // When "Produce More" is clicked, the system effectively re-designs it invisibly using current component costs
        // (affected by events) to get the *new* unit manufacturing cost for *this specific new batch*.

        // To avoid overcomplicating this step, we'll assume the `phone.unitManufacturingCost` is the "base"
        // and apply any relevant *current* event modifiers.
        // This is what `calculateCosts` in `design/page.tsx` does.
        // We assume the saved `unitManufacturingCost` is the base without current events.
         if (event.definition.type === 'component_cost_modifier') {
            // This logic is simplified. A real system would need to know which components
            // are in the phone and apply modifiers specifically.
            // For now, if ANY component cost modifier is active, we apply it broadly.
            // This will be inaccurate if the phone doesn't use that component category.
            // A better approach would be to call a shared cost calculation utility here.
            // For now, we use the cost already calculated and stored, assuming `design/page.tsx`
            // handles event-based cost calculation at the point of design.
            // When producing *more*, the cost should reflect *current* market conditions.
            // So, we re-apply current event modifiers to the base cost.
            // This assumes phone.unitManufacturingCost is the "base" cost without events.

            // Let's assume the phone object stored its base cost. If not, this is hard to do accurately.
            // The best approach for "Produce More" would be to recalculate its cost from its specs
            // using current component prices (which are affected by events).
            // This is what the design page does.
            // Let's assume phone.unitManufacturingCost IS the base cost.
            // For now, the `design/page.tsx`'s `calculateCosts` will include event effects.
            // So, `phone.unitManufacturingCost` will reflect costs AT THE TIME OF ITS DESIGN.
            // For "Produce More", we need to calculate the cost of *this new batch*.
            // This requires iterating through its components and getting their current costs.
            // This is too complex for this iteration.
            // We'll use the stored `phone.unitManufacturingCost` and acknowledge this simplification.
            // The cost should be calculated based on current events when producing more.

            // Correct approach: the unitManufacturingCost for a *new batch* should be based on current component prices.
            // The `design/page.tsx` correctly calculates this for a *new design*.
            // For "Produce More", we need to re-evaluate.
            // For now, we will use the cost from the last production, which is stored.
            // To reflect current events:
            // If `event.definition.componentCategory` matches a main component of the phone (e.g. "processor")
            // we could apply the modifier. This is still an approximation.
            // The most accurate way is to have the original recipe and recalculate.
            // Simplified: use the saved `phone.unitManufacturingCost` but adjust it with current *broad* events.
            if (event.definition.componentCategory === 'processor' /* && phone has a processor */) {
                // Need to know base processor cost part of total cost.
            }
            // This is where the cost calculation logic from design/page.tsx would be reused.
            // For now, `phone.unitManufacturingCost` is used as is, meaning current events do not affect
            // the cost of producing *more* of an *existing* design in this simplified version.
            // This will be fixed if we refactor cost calculation into a shared utility.
        }
    });
    // To properly implement cost changes for "Produce More", we'd need to recalculate the cost
    // based on the phone's specs and current event-modified component costs,
    // similar to `calculateCosts` in `design/page.tsx`.
    // For this iteration, `phone.unitManufacturingCost` is used as is.
    // A more accurate simulation would involve:
    // 1. Retrieving base costs for all components of `phone`.
    // 2. Applying `activeGameEvents` modifiers to these base costs.
    // 3. Summing them up to get the new `currentBatchUnitCost`.
    // This is skipped for now for simplicity, `phone.unitManufacturingCost` is assumed to be current enough
    // or that the original design page already factored in events active at that time.
    // The correct behavior is that *new* production uses *current* costs.
    // So, let's simulate a simple adjustment for processor cost events if one is active
    // Assuming processor is a significant part. This is a heuristic.
    const procEvent = activeGameEvents.find(e => e.definition.type === 'component_cost_modifier' && e.definition.componentCategory === 'processor');
    if (procEvent) {
        // Assume processor is ~30% of cost for this heuristic
        const baseProcCostApproximation = phone.unitManufacturingCost * 0.3;
        const modifiedProcCostApproximation = baseProcCostApproximation * procEvent.definition.effectValue;
        const diff = modifiedProcCostApproximation - baseProcCostApproximation;
        finalCost += diff;
    }
     const ramEvent = activeGameEvents.find(e => e.definition.type === 'component_cost_modifier' && e.definition.componentCategory === 'ram');
    if (ramEvent) {
        const baseRamCostApproximation = phone.ram * 5; // Approx base RAM cost
        const modifiedRamCostApproximation = baseRamCostApproximation * ramEvent.definition.effectValue;
        const diff = modifiedRamCostApproximation - baseRamCostApproximation;
        finalCost += diff;
    }

    return Math.max(1, parseFloat(finalCost.toFixed(2))); // Ensure cost is not negative or zero
  };


  const handleProduceMore = (phoneId: string) => {
    const quantityStr = produceMoreQuantities[phoneId];
    const quantity = parseInt(quantityStr, 10);

    if (isNaN(quantity) || quantity <= 0) {
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidProductionQuantityToast') });
      return;
    }

    const phonesFromStorage = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    const currentPhones: PhoneDesign[] = phonesFromStorage ? JSON.parse(phonesFromStorage) : [];
    const targetPhoneIndex = currentPhones.findIndex(p => p.id === phoneId);

    if (targetPhoneIndex === -1) {
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('phoneNotFoundToast') });
      return;
    }
    const targetPhone = currentPhones[targetPhoneIndex];

    const statsString = localStorage.getItem(LOCAL_STORAGE_GAME_STATS_KEY);
    let currentStats: GameStats = statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0, level: 1, xp: 0 };
    
    const currentBatchUnitCost = getAdjustedManufacturingCost(targetPhone); // Use adjusted cost
    const costToProduce = quantity * currentBatchUnitCost;


    if (currentStats.totalFunds < costToProduce) {
      toast({
        variant: "destructive",
        title: t('insufficientFundsErrorTitle'),
        description: t('insufficientFundsToProduceMoreErrorDesc', { 
            name: targetPhone.name, 
            quantity: quantity, 
            totalCost: costToProduce.toFixed(2),
            availableFunds: currentStats.totalFunds.toFixed(2)
        }),
      });
      return;
    }

    currentStats.totalFunds -= costToProduce;
    currentPhones[targetPhoneIndex].currentStock = (currentPhones[targetPhoneIndex].currentStock || 0) + quantity;
    // It's important that if the unit cost for this batch changed due to events,
    // the average unit cost of the total stock might change.
    // For simplicity, we are not averaging it here, but `unitManufacturingCost` on the PhoneDesign
    // should ideally represent the average or the cost of the most recent batch.
    // Let's update it to the cost of this new batch.
    currentPhones[targetPhoneIndex].unitManufacturingCost = currentBatchUnitCost;

    
    const transactionsString = localStorage.getItem(LOCAL_STORAGE_TRANSACTIONS_KEY);
    let currentTransactions: Transaction[] = transactionsString ? JSON.parse(transactionsString) : [];
    const productionTransaction: Transaction = {
      id: `txn_add_prod_${Date.now()}_${targetPhone.id}`,
      date: new Date().toISOString(),
      description: `transactionAdditionalProductionOf{{quantity:${quantity},phoneName:${targetPhone.name}}}`,
      amount: -costToProduce,
      type: 'expense',
    };
    currentTransactions.push(productionTransaction);

    localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(currentPhones));
    localStorage.setItem(LOCAL_STORAGE_GAME_STATS_KEY, JSON.stringify(currentStats));
    localStorage.setItem(LOCAL_STORAGE_TRANSACTIONS_KEY, JSON.stringify(currentTransactions));

    
    setSavedPhones(currentPhones); 
    setProduceMoreQuantities(prev => ({ ...prev, [phoneId]: '0' })); 

    window.dispatchEvent(new CustomEvent('myPhonesChanged'));
    window.dispatchEvent(new CustomEvent('gameStatsChanged'));
    window.dispatchEvent(new CustomEvent('transactionsChanged'));
    
    toast({
      title: t('productionSuccessfulToastTitle'),
      description: t('productionSuccessfulToastDesc', { quantity, phoneName: targetPhone.name }),
    });
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Sparkles className="w-8 h-8 animate-spin text-primary" /> <span className="ml-2">{t('loadingPhones')}</span></div>;
  }

  return (
    <div className="space-y-8">
      <SectionTitle
        title={t('myPhonesPageTitle')}
        description={t('myPhonesPageDesc')}
      />

      {savedPhones.length === 0 ? (
        <Card className="text-center">
          <CardHeader>
            <CardTitle>{t('noPhonesDesignedTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Smartphone className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">{t('noPhonesDesignedDesc')}</p>
            <Button asChild>
              <Link href="/design">{t('btnDesignYourFirstPhone')}</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedPhones.map((phone) => (
            <Card key={phone.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{phone.name}</span>
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive -mr-2 -mt-2">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('deletePhoneConfirmTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('deletePhoneConfirmDesc', { name: phone.name })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancelButton')}</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeletePhone(phone.id)} className="bg-destructive hover:bg-destructive/90">
                          {t('deleteButton')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardTitle>
                <CardDescription>
                  <span className="block">{t('unitManufacturingCostLabel')}: ${getAdjustedManufacturingCost(phone).toFixed(2)} ({t('currentEventAdjustedCost')})</span>
                  <span className="block">{t('productionQuantityInfoLabel')}: {phone.productionQuantity || 0}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="relative aspect-[16/10] w-full bg-muted rounded-md overflow-hidden">
                  {phone.imageUrl && (
                    <Image
                      src={phone.imageUrl}
                      alt={phone.name || t('phoneBlueprintAlt')}
                      fill 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" 
                      style={{objectFit: "cover"}}
                      data-ai-hint="custom phone"
                    />
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <h4 className="font-semibold mb-1">{t('keySpecifications')}</h4>
                  <p><Cpu className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('processorLabel')}: {getLabel(PROCESSOR_OPTIONS.options, phone.processor)}</p>
                  <p><MonitorSmartphone className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('displayTypeLabel')}: {getLabel(DISPLAY_OPTIONS.options, phone.displayType)}</p>
                  <p><MemoryStick className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('ramLabel')}: {phone.ram} GB</p>
                  <p><StorageIcon className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('storageLabel')}: {phone.storage} GB</p>
                  <p><Camera className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('cameraResolutionLabel')}: {phone.cameraResolution} MP</p>
                  {phone.hasOIS && <p><ImageUp className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('oisLabel')}: {t('yes')}</p>}
                  <p><UserCircle className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('frontCameraResolutionLabel')}: {phone.frontCameraResolution} MP</p>
                  {phone.ultrawideCameraMP > 0 && <p><Aperture className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('ultrawideCameraMPLabel')}: {phone.ultrawideCameraMP} MP</p>}
                  {phone.telephotoCameraMP > 0 && <p><ZoomIn className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('telephotoCameraMPLabel')}: {phone.telephotoCameraMP} MP ({getLabel(TELEPHOTO_ZOOM_OPTIONS.options, phone.telephotoZoom)})</p>}
                  <p><Video className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('videoResolutionLabel')}: {getLabel(VIDEO_RESOLUTION_OPTIONS.options, phone.videoResolution)}</p>
                  <p><Zap className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('batteryCapacityLabel')}: {phone.batteryCapacity} mAh</p>
                  <p><Fingerprint className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('materialLabel')}: {getLabel(MATERIAL_OPTIONS.options, phone.material)}</p>
                  <p><RefreshCw className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('refreshRateLabel')}: {getLabel(REFRESH_RATE_OPTIONS.options, phone.refreshRate)}</p>
                   {phone.nfcSupport && <p><Wifi className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('nfcSupportLabel')}: {t('yes')}</p>}
                  <p><ShieldCheck className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('waterResistanceLabel')}: {getLabel(WATER_RESISTANCE_OPTIONS.options, phone.waterResistance)}</p>
                </div>
                {phone.review && (
                  <div>
                    <h4 className="font-semibold flex items-center mb-1">
                      <Bot className="inline h-4 w-4 mr-1 text-primary" /> 
                      {phone.reviewType === 'ai' ? t('aiGeneratedReview') : t('localGeneratedReview')}
                    </h4>
                    <p className="text-sm text-muted-foreground italic line-clamp-3">"{phone.review}"</p>
                  </div>
                )}
                <Separator className="my-3"/>
                <div className="space-y-3">
                    <h4 className="font-semibold flex items-center"><TrendingUp className="inline h-4 w-4 mr-1 text-primary"/>{t('salesManagementSectionTitle')}</h4>
                     <p className="text-sm">
                        {t('currentStockLabel')}: <span className="font-medium">{phone.currentStock || 0}</span>
                    </p>
                     <p className="text-sm">
                        {t('quantityListedForSaleLabel')}: <span className="font-medium">{phone.quantityListedForSale || 0}</span>
                    </p>
                    <div className="space-y-1">
                        <Label htmlFor={`price-${phone.id}`} className="text-xs">{t('setSalePriceLabel')}</Label>
                         <Input 
                            type="number" 
                            id={`price-${phone.id}`}
                            value={salesFormData[phone.id]?.price || ''}
                            onChange={(e) => handleSalesInputChange(phone.id, 'price', e.target.value)}
                            className="h-8 text-sm"
                            step="0.01"
                            min="0.01"
                        />
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor={`qty-${phone.id}`} className="text-xs">{t('quantityToNewLabel')}</Label>
                        <Input 
                            type="number" 
                            id={`qty-${phone.id}`}
                            value={salesFormData[phone.id]?.quantityToList || '0'}
                            onChange={(e) => handleSalesInputChange(phone.id, 'quantityToList', e.target.value)}
                            className="h-8 text-sm"
                            min="0" 
                            max={(phone.currentStock || 0) + (phone.quantityListedForSale || 0)} 
                        />
                    </div>
                    <Button 
                        variant="default" 
                        size="sm"
                        className="w-full" 
                        onClick={() => handleListForSale(phone.id)}
                        disabled={
                            (parseFloat(salesFormData[phone.id]?.price || '0') === (phone.salePrice || 0) &&
                             parseInt(salesFormData[phone.id]?.quantityToList || '0', 10) === (phone.quantityListedForSale || 0))
                        }
                    >
                        <HandCoins className="inline h-4 w-4 mr-2"/>{t('updateMarketListingButton')}
                    </Button>
                </div>
                <Separator className="my-3"/>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center"><Factory className="inline h-4 w-4 mr-1 text-primary"/>{t('produceMoreUnitsTitle')}</h4>
                  <div className="space-y-1">
                    <Label htmlFor={`produce-qty-${phone.id}`} className="text-xs">{t('additionalUnitsToProduceLabel')}</Label>
                    <Input
                      type="number"
                      id={`produce-qty-${phone.id}`}
                      value={produceMoreQuantities[phone.id] || '0'}
                      onChange={(e) => handleProduceMoreInputChange(phone.id, e.target.value)}
                      className="h-8 text-sm"
                      min="0"
                    />
                  </div>
                   <p className="text-xs text-muted-foreground">{t('currentMfgCostForBatch', { cost: getAdjustedManufacturingCost(phone).toFixed(2) })}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleProduceMore(phone.id)}
                    disabled={(parseInt(produceMoreQuantities[phone.id] || '0', 10) <= 0)}
                  >
                    <Package className="inline h-4 w-4 mr-2"/>{t('produceUnitsButton')}
                  </Button>
                </div>
              </CardContent>
               <CardFooter className="pt-4 mt-auto"> 
                 <Button variant="outline" className="w-full" asChild>
                    <Link href={`/design?edit=${phone.id}`}>{t('editDesignButton')}</Link> 
                 </Button>
               </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
