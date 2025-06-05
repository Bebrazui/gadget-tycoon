
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Cpu, MemoryStick, HardDrive as StorageIcon, Camera, Zap, Fingerprint, Bot, Trash2, Info, Sparkles, ShieldCheck, Wifi, Maximize, UserCircle, RefreshCw, HandCoins, Package, TrendingUp, Edit, Video, Aperture, ZoomIn, ImageUp, MonitorSmartphone, Factory } from 'lucide-react';
import Image from 'next/image';
import type { PhoneDesign, GameStats, Transaction } from '@/lib/types';
import { 
  LOCAL_STORAGE_MY_PHONES_KEY,
  SALE_MARKUP_FACTOR,
  LOCAL_STORAGE_GAME_STATS_KEY,
  LOCAL_STORAGE_TRANSACTIONS_KEY,
  INITIAL_FUNDS
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

  const loadPhones = useCallback(() => {
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
          initialProduceMoreQtys[phone.id] = '0'; // Default to 0 for "produce more"
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
    setIsLoading(false);
  }, [t, toast]); 

  useEffect(() => {
    loadPhones();
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_MY_PHONES_KEY) {
            loadPhones();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    // Custom event listener
    const handleMyPhonesUpdate = () => {
      loadPhones();
    };
    window.addEventListener('myPhonesChanged', handleMyPhonesUpdate);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('myPhonesChanged', handleMyPhonesUpdate);
    };
  }, [loadPhones]);

  const getLabel = (optionsArray: any[] | undefined, value: string): string => {
    if (!optionsArray || !value) return value || t('notSet');
    const option = optionsArray.find(opt => opt.value === value);
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
    let currentStats: GameStats = statsString ? JSON.parse(statsString) : { totalFunds: INITIAL_FUNDS, phonesSold: 0, brandReputation: 0 };
    
    const costToProduce = quantity * (targetPhone.unitManufacturingCost || 0);

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

    // Update local state to reflect changes
    setSavedPhones(currentPhones); 
    setProduceMoreQuantities(prev => ({ ...prev, [phoneId]: '0' })); // Reset input

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
                  <span className="block">{t('unitManufacturingCostLabel')}: ${(phone.unitManufacturingCost || 0).toFixed(2)}</span>
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
                    <h4 className="font-semibold flex items-center mb-1"><Bot className="inline h-4 w-4 mr-1 text-primary" /> {t('aiGeneratedReview')}</h4>
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
               <CardFooter className="pt-4 mt-auto"> {/* Added mt-auto here */}
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
