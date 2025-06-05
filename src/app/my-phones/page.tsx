
"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Smartphone, Cpu, MemoryStick, HardDrive as StorageIcon, Camera, Zap, Fingerprint, Bot, Trash2, Info, Sparkles, ShieldCheck, Wifi, Maximize, UserCircle, RefreshCw, HandCoins, Package, TrendingUp, Edit } from 'lucide-react';
import Image from 'next/image';
import type { PhoneDesign } from '@/lib/types';
import { 
  LOCAL_STORAGE_MY_PHONES_KEY,
  SALE_MARKUP_FACTOR
} from '@/lib/types';
import { useTranslation } from '@/hooks/useTranslation';
import { SectionTitle } from '@/components/shared/SectionTitle';
import {
  PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS, REFRESH_RATE_OPTIONS,
  WATER_RESISTANCE_OPTIONS, SIM_SLOT_OPTIONS, OPERATING_SYSTEM_OPTIONS, COLOR_OPTIONS
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

export default function MyPhonesPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [savedPhones, setSavedPhones] = useState<PhoneDesign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [salesFormData, setSalesFormData] = useState<SalesFormData>({});

  useEffect(() => {
    loadPhones();
    setIsLoading(false);
    window.addEventListener('myPhonesChanged', loadPhones);
    return () => {
      window.removeEventListener('myPhonesChanged', loadPhones);
    };
  }, []);

  const loadPhones = () => {
    const phonesFromStorage = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    let phones: PhoneDesign[] = [];
    if (phonesFromStorage) {
      phones = JSON.parse(phonesFromStorage);
      setSavedPhones(phones);
      // Initialize sales form data
      const initialSalesData: SalesFormData = {};
      phones.forEach(phone => {
        initialSalesData[phone.id] = {
          price: (phone.salePrice || (phone.unitManufacturingCost * SALE_MARKUP_FACTOR)).toFixed(2),
          quantityToList: '0',
        };
      });
      setSalesFormData(initialSalesData);
    } else {
      setSavedPhones([]);
      setSalesFormData({});
    }
  };

  const getLabel = (optionsArray: any[] | undefined, value: string): string => {
    const option = optionsArray?.find(opt => opt.value === value);
    return option ? (t(option.label) || option.label) : value;
  };

  const handleDeletePhone = (phoneId: string) => {
    const updatedPhones = savedPhones.filter(phone => phone.id !== phoneId);
    setSavedPhones(updatedPhones);
    localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
    // Also remove from sales form data
    setSalesFormData(prev => {
      const newData = {...prev};
      delete newData[phoneId];
      return newData;
    });
    toast({
      title: t('phoneDeletedTitle'),
      description: t('phoneDeletedDesc'),
    });
    window.dispatchEvent(new CustomEvent('myPhonesChanged')); // To update any listeners
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

  const handleListForSale = (phoneId: string) => {
    const phone = savedPhones.find(p => p.id === phoneId);
    if (!phone) return;

    const formData = salesFormData[phoneId];
    const quantityToList = parseInt(formData.quantityToList, 10);
    const newSalePrice = parseFloat(formData.price);

    if (isNaN(quantityToList) || quantityToList <= 0) {
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidQuantityNegative') });
      return;
    }
    if (isNaN(newSalePrice) || newSalePrice <= 0) {
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidPriceNegative') });
      return;
    }
    if (quantityToList > (phone.currentStock || 0)) {
      toast({
        variant: "destructive",
        title: t('genericErrorTitle'),
        description: t('notEnoughStockToList', { quantity: quantityToList, availableStock: phone.currentStock || 0 }),
      });
      return;
    }

    const updatedPhones = savedPhones.map(p => {
      if (p.id === phoneId) {
        return {
          ...p,
          currentStock: (p.currentStock || 0) - quantityToList,
          quantityListedForSale: (p.quantityListedForSale || 0) + quantityToList,
          salePrice: newSalePrice,
        };
      }
      return p;
    });

    setSavedPhones(updatedPhones);
    localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
    // Reset quantity to list for this phone
    setSalesFormData(prev => ({
        ...prev,
        [phoneId]: {
            ...prev[phoneId],
            quantityToList: '0', // Reset after listing
            price: newSalePrice.toFixed(2) // Ensure price is updated in form state
        }
    }));

    toast({
      title: t('phoneListedSuccessfully', { quantity: quantityToList, phoneName: phone.name, price: newSalePrice.toFixed(2) }),
    });
    window.dispatchEvent(new CustomEvent('myPhonesChanged'));
  };
  
  const handleUpdatePrice = (phoneId: string) => {
      const phone = savedPhones.find(p => p.id === phoneId);
      if (!phone) return;

      const formData = salesFormData[phoneId];
      const newSalePrice = parseFloat(formData.price);

      if (isNaN(newSalePrice) || newSalePrice <= 0) {
          toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidPriceNegative') });
          return;
      }

      const updatedPhones = savedPhones.map(p => 
          p.id === phoneId ? { ...p, salePrice: newSalePrice } : p
      );
      setSavedPhones(updatedPhones);
      localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
      toast({
          title: t('priceUpdatedSuccessfully', { phoneName: phone.name, price: newSalePrice.toFixed(2) }),
      });
      window.dispatchEvent(new CustomEvent('myPhonesChanged'));
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
                  <p><Maximize className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('displayTypeLabel')}: {getLabel(DISPLAY_OPTIONS.options, phone.displayType)}</p>
                  <p><MemoryStick className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('ramLabel')}: {phone.ram} GB</p>
                  <p><StorageIcon className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('storageLabel')}: {phone.storage} GB</p>
                  <p><Camera className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('cameraResolutionLabel')}: {phone.cameraResolution} MP</p>
                  <p><UserCircle className="inline h-4 w-4 mr-1 text-muted-foreground" /> {t('frontCameraResolutionLabel')}: {phone.frontCameraResolution} MP</p>
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
                <Separator className="my-4"/>
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
                        <div className="flex items-center gap-2">
                             <Input 
                                type="number" 
                                id={`price-${phone.id}`}
                                value={salesFormData[phone.id]?.price || ''}
                                onChange={(e) => handleSalesInputChange(phone.id, 'price', e.target.value)}
                                className="h-8 text-sm"
                                step="0.01"
                                min="0"
                            />
                            <Button size="sm" variant="outline" onClick={() => handleUpdatePrice(phone.id)}><Edit className="w-3 h-3 mr-1"/>{t('updatePriceButton')}</Button>
                        </div>

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
                            max={phone.currentStock || 0}
                        />
                    </div>
                    <Button 
                        variant="default" 
                        size="sm"
                        className="w-full" 
                        onClick={() => handleListForSale(phone.id)}
                        disabled={(phone.currentStock || 0) <= 0 || parseInt(salesFormData[phone.id]?.quantityToList || '0', 10) <= 0}
                    >
                        <HandCoins className="inline h-4 w-4 mr-2"/>{t('listForSaleButton')}
                    </Button>
                </div>
              </CardContent>
               <CardFooter className="pt-4">
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
