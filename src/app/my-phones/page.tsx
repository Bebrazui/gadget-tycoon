
"use client";

import React, { useEffect, useState, useCallback } from 'react';
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

  const loadPhones = useCallback(() => {
    const phonesFromStorage = localStorage.getItem(LOCAL_STORAGE_MY_PHONES_KEY);
    let phones: PhoneDesign[] = [];
    if (phonesFromStorage) {
      try {
        const parsedPhones = JSON.parse(phonesFromStorage);
        // Фильтруем некорректные или отсутствующие записи
        const validPhones = Array.isArray(parsedPhones) ? parsedPhones.filter(p => p && typeof p === 'object' && p.id) : [];
        setSavedPhones(validPhones);

        const initialSalesData: SalesFormData = {};
        validPhones.forEach(phone => {
          const unitCost = phone.unitManufacturingCost || 0;
          const defaultCalculatedPrice = unitCost * SALE_MARKUP_FACTOR;
          // Используем существующую цену продажи, если она есть и является числом, иначе рассчитываем по умолчанию
          const salePrice = typeof phone.salePrice === 'number' ? phone.salePrice : defaultCalculatedPrice;

          initialSalesData[phone.id] = {
            price: salePrice.toFixed(2),
            quantityToList: (phone.quantityListedForSale || 0).toString(), // Инициализируем из данных телефона
          };
        });
        setSalesFormData(initialSalesData);
      } catch (error) {
        console.error("Ошибка загрузки телефонов из localStorage:", error);
        localStorage.removeItem(LOCAL_STORAGE_MY_PHONES_KEY);
        setSavedPhones([]);
        setSalesFormData({});
        toast({
          variant: "destructive",
          title: t('localStorageErrorTitle'),
          description: t('localStorageErrorMyPhonesDesc'),
        });
      }
    } else {
      setSavedPhones([]);
      setSalesFormData({});
    }
  }, [t, toast]); // Зависимости для useCallback

  useEffect(() => {
    loadPhones();
    setIsLoading(false);

    // Слушатель для изменений localStorage из других вкладок/окон
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_MY_PHONES_KEY) {
            loadPhones();
        }
    };
    window.addEventListener('storage', handleStorageChange);
    
    // Слушатель для кастомного события изменения телефонов внутри приложения
    window.addEventListener('myPhonesChanged', loadPhones);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('myPhonesChanged', loadPhones);
    };
  }, [loadPhones]);

  const getLabel = (optionsArray: any[] | undefined, value: string): string => {
    const option = optionsArray?.find(opt => opt.value === value);
    return option ? (t(option.label) || option.label) : value;
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

  const handleListForSale = (phoneId: string) => {
    const phone = savedPhones.find(p => p.id === phoneId);
    if (!phone) return;

    const formData = salesFormData[phoneId];
    const quantityToList = parseInt(formData.quantityToList, 10);
    const newSalePrice = parseFloat(formData.price);

    if (isNaN(quantityToList) || quantityToList < 0) { // Разрешим 0, чтобы снять с продажи
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidQuantityNegativeOrZero') }); // Обновим ключ перевода
      return;
    }
    if (isNaN(newSalePrice) || newSalePrice <= 0) {
      toast({ variant: "destructive", title: t('genericErrorTitle'), description: t('invalidPriceNegative') });
      return;
    }
    
    const stockChange = quantityToList - (phone.quantityListedForSale || 0);

    if (stockChange > (phone.currentStock || 0)) {
      toast({
        variant: "destructive",
        title: t('genericErrorTitle'),
        description: t('notEnoughStockToList', { quantity: stockChange, availableStock: phone.currentStock || 0 }),
      });
      return;
    }
    
    let operationMessage = '';

    const updatedPhones = savedPhones.map(p => {
      if (p.id === phoneId) {
        const alreadyListed = p.quantityListedForSale || 0;
        const newListedQuantity = quantityToList; // Это общее новое количество, которое должно быть на рынке
        
        // Рассчитываем изменение на складе:
        // Если выставляем больше, чем было: stockDelta = newListed - alreadyListed (положительное, берем со склада)
        // Если выставляем меньше, чем было: stockDelta = newListed - alreadyListed (отрицательное, возвращаем на склад)
        const stockDelta = newListedQuantity - alreadyListed;

        const newStock = (p.currentStock || 0) - stockDelta;

        if (newStock < 0) {
             toast({
                variant: "destructive",
                title: t('genericErrorTitle'),
                description: t('notEnoughStockToListGeneral')
             });
             return p; // не меняем телефон, если недостаточно на складе
        }
        
        if (newListedQuantity > alreadyListed) {
            operationMessage = t('phoneListedSuccessfully', { quantity: newListedQuantity - alreadyListed, phoneName: p.name, price: newSalePrice.toFixed(2) });
        } else if (newListedQuantity < alreadyListed) {
            operationMessage = t('phoneUnlistedSuccessfully', { quantity: alreadyListed - newListedQuantity, phoneName: p.name });
        } else {
             // Если количество не изменилось, но цена могла
             if (p.salePrice !== newSalePrice) {
                operationMessage = t('priceUpdatedSuccessfully', { phoneName: p.name, price: newSalePrice.toFixed(2) });
             } else {
                toast({ title: t('noChangesMade')}); return p;
             }
        }


        return {
          ...p,
          currentStock: newStock,
          quantityListedForSale: newListedQuantity,
          salePrice: newSalePrice,
        };
      }
      return p;
    });
    
    // Проверяем, был ли телефон обновлен (если, например, запасов не хватило)
    if (JSON.stringify(updatedPhones) !== JSON.stringify(savedPhones)) {
        setSavedPhones(updatedPhones);
        localStorage.setItem(LOCAL_STORAGE_MY_PHONES_KEY, JSON.stringify(updatedPhones));
        
        setSalesFormData(prev => ({
            ...prev,
            [phoneId]: {
                ...prev[phoneId],
                price: newSalePrice.toFixed(2),
                // quantityToList здесь не сбрасываем в '0', так как он теперь отражает общее количество на рынке
            }
        }));

        if(operationMessage) {
            toast({ title: operationMessage });
        }
        window.dispatchEvent(new CustomEvent('myPhonesChanged'));
    }
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
                         <Input 
                            type="number" 
                            id={`price-${phone.id}`}
                            value={salesFormData[phone.id]?.price || ''}
                            onChange={(e) => handleSalesInputChange(phone.id, 'price', e.target.value)}
                            className="h-8 text-sm"
                            step="0.01"
                            min="0.01" // Цена должна быть больше 0
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
                            min="0" // Можно выставить 0, чтобы снять с продажи
                            max={(phone.currentStock || 0) + (phone.quantityListedForSale || 0)} // Максимум - это то, что на складе + то, что уже выставлено
                        />
                    </div>
                    <Button 
                        variant="default" 
                        size="sm"
                        className="w-full" 
                        onClick={() => handleListForSale(phone.id)}
                        // Кнопка активна, если есть что менять (цена или количество)
                        disabled={
                            (parseFloat(salesFormData[phone.id]?.price) === (phone.salePrice || 0) &&
                             parseInt(salesFormData[phone.id]?.quantityToList, 10) === (phone.quantityListedForSale || 0))
                        }
                    >
                        <HandCoins className="inline h-4 w-4 mr-2"/>{t('updateMarketListingButton')}
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


    