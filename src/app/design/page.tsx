
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  DollarSign, HardDrive, Smartphone, Palette, Ruler, Zap, Camera, Loader2,
  AspectRatio, RefreshCw, Droplets, GalleryVertical, SmartphoneNfc, Cog, UserCircle, Info
} from 'lucide-react';
import Image from 'next/image';
import {
  PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS, COLOR_OPTIONS,
  RAM_COST_PER_GB, STORAGE_COST_PER_GB, CAMERA_COST_PER_MP, BATTERY_COST_PER_100MAH,
  REFRESH_RATE_OPTIONS, WATER_RESISTANCE_OPTIONS, SIM_SLOT_OPTIONS, NFC_COST,
  OPERATING_SYSTEM_OPTIONS, FRONT_CAMERA_COST_PER_MP, SCREEN_SIZE_COST_FACTOR,
  type PhoneDesign, type PhoneComponentOption
} from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from '@/hooks/useTranslation';

const phoneDesignSchema = z.object({
  processor: z.string().min(1, "Processor is required"),
  displayType: z.string().min(1, "Display type is required"),
  ram: z.number().min(2).max(32),
  storage: z.number().min(32).max(2048), // Increased max storage
  cameraResolution: z.number().min(8).max(200),
  batteryCapacity: z.number().min(2000).max(10000),
  material: z.string().min(1, "Material is required"),
  color: z.string().min(1, "Color is required"),
  height: z.number().min(100).max(200),
  width: z.number().min(50).max(100),
  thickness: z.number().min(5).max(15),
  // New fields
  screenSize: z.number().min(5.0).max(7.5).step(0.1),
  refreshRate: z.string().min(1, "Refresh rate is required"),
  waterResistance: z.string().min(1, "Water resistance rating is required"),
  simSlots: z.string().min(1, "SIM slot configuration is required"),
  nfcSupport: z.boolean(),
  operatingSystem: z.string().min(1, "Operating system is required"),
  frontCameraResolution: z.number().min(5).max(100),
});

type PhoneDesignFormData = z.infer<typeof phoneDesignSchema>;

const defaultValues: PhoneDesignFormData = {
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
  // New defaults
  screenSize: 6.1,
  refreshRate: REFRESH_RATE_OPTIONS.options?.[0].value || '',
  waterResistance: WATER_RESISTANCE_OPTIONS.options?.[0].value || '',
  simSlots: SIM_SLOT_OPTIONS.options?.[0].value || '',
  nfcSupport: false,
  operatingSystem: OPERATING_SYSTEM_OPTIONS.options?.[0].value || '',
  frontCameraResolution: 12,
};

export default function DesignPhonePage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<PhoneDesignFormData>({
    resolver: zodResolver(phoneDesignSchema),
    defaultValues,
  });

  const watchedValues = watch();

  const getOptionCost = (optionsArray: PhoneComponentOption[] | undefined, value: string): number => {
    return optionsArray?.find(opt => opt.value === value)?.cost || 0;
  };

  const calculateCost = useCallback(() => {
    let cost = 0;
    cost += getOptionCost(PROCESSOR_OPTIONS.options, watchedValues.processor);
    cost += getOptionCost(DISPLAY_OPTIONS.options, watchedValues.displayType);
    cost += getOptionCost(MATERIAL_OPTIONS.options, watchedValues.material);
    
    cost += watchedValues.ram * RAM_COST_PER_GB;
    cost += watchedValues.storage * STORAGE_COST_PER_GB;
    cost += watchedValues.cameraResolution * CAMERA_COST_PER_MP;
    cost += (watchedValues.batteryCapacity / 100) * BATTERY_COST_PER_100MAH;

    // New component costs
    cost += (watchedValues.screenSize - 5.0) * SCREEN_SIZE_COST_FACTOR; // Assuming 5.0 inch is base
    cost += getOptionCost(REFRESH_RATE_OPTIONS.options, watchedValues.refreshRate);
    cost += getOptionCost(WATER_RESISTANCE_OPTIONS.options, watchedValues.waterResistance);
    cost += getOptionCost(SIM_SLOT_OPTIONS.options, watchedValues.simSlots);
    if (watchedValues.nfcSupport) cost += NFC_COST;
    cost += getOptionCost(OPERATING_SYSTEM_OPTIONS.options, watchedValues.operatingSystem);
    cost += watchedValues.frontCameraResolution * FRONT_CAMERA_COST_PER_MP;
    
    // Base design & assembly cost
    cost += 50;

    setEstimatedCost(cost);
  }, [watchedValues]);

  useEffect(() => {
    calculateCost();
  }, [watchedValues, calculateCost]);

  const onSubmit = async (data: PhoneDesignFormData) => {
    setIsSubmitting(true);
    console.log("Phone Design Submitted:", data);
    console.log("Estimated Cost:", estimatedCost);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: t('phoneDesignSavedTitle'),
      description: t('phoneDesignSavedDesc', { cost: estimatedCost.toFixed(2) }),
    });
    setIsSubmitting(false);
  };

  const formFields = [
    { name: "processor" as keyof PhoneDesignFormData, label: t('processorLabel'), icon: HardDrive, componentType: "Select", options: PROCESSOR_OPTIONS.options },
    { name: "displayType" as keyof PhoneDesignFormData, label: t('displayTypeLabel'), icon: Smartphone, componentType: "Select", options: DISPLAY_OPTIONS.options },
    { name: "ram" as keyof PhoneDesignFormData, label: t('ramLabel'), icon: HardDrive, componentType: "Slider", min: 2, max: 32, step: 2, unit: "GB" },
    { name: "storage" as keyof PhoneDesignFormData, label: t('storageLabel'), icon: HardDrive, componentType: "Slider", min: 32, max: 2048, step: 32, unit: "GB" },
    { name: "cameraResolution" as keyof PhoneDesignFormData, label: t('cameraResolutionLabel'), icon: Camera, componentType: "Slider", min: 8, max: 200, step: 4, unit: "MP" },
    { name: "frontCameraResolution" as keyof PhoneDesignFormData, label: t('frontCameraResolutionLabel'), icon: UserCircle, componentType: "Slider", min: 5, max: 100, step: 1, unit: "MP"},
    { name: "batteryCapacity" as keyof PhoneDesignFormData, label: t('batteryCapacityLabel'), icon: Zap, componentType: "Slider", min: 2000, max: 10000, step: 100, unit: "mAh" },
    { name: "material" as keyof PhoneDesignFormData, label: t('materialLabel'), icon: Smartphone, componentType: "Select", options: MATERIAL_OPTIONS.options },
    { name: "color" as keyof PhoneDesignFormData, label: t('colorLabel'), icon: Palette, componentType: "Select", options: COLOR_OPTIONS.map(c => ({...c, cost: 0})) }, // Color cost is usually included or minor
    { name: "screenSize" as keyof PhoneDesignFormData, label: t('screenSizeLabel'), icon: AspectRatio, componentType: "Slider", min: 5.0, max: 7.5, step: 0.1, unit: t('inchesUnit') },
    { name: "refreshRate" as keyof PhoneDesignFormData, label: t('refreshRateLabel'), icon: RefreshCw, componentType: "Select", options: REFRESH_RATE_OPTIONS.options },
    { name: "waterResistance" as keyof PhoneDesignFormData, label: t('waterResistanceLabel'), icon: Droplets, componentType: "Select", options: WATER_RESISTANCE_OPTIONS.options },
    { name: "simSlots" as keyof PhoneDesignFormData, label: t('simSlotsLabel'), icon: GalleryVertical, componentType: "Select", options: SIM_SLOT_OPTIONS.options },
    { name: "operatingSystem" as keyof PhoneDesignFormData, label: t('osLabel'), icon: Cog, componentType: "Select", options: OPERATING_SYSTEM_OPTIONS.options },
    { name: "nfcSupport" as keyof PhoneDesignFormData, label: t('nfcSupportLabel'), icon: SmartphoneNfc, componentType: "Switch"},
    { name: "height" as keyof PhoneDesignFormData, label: t('heightLabel'), icon: Ruler, componentType: "Input", inputType: "number", unit: "mm" },
    { name: "width" as keyof PhoneDesignFormData, label: t('widthLabel'), icon: Ruler, componentType: "Input", inputType: "number", unit: "mm" },
    { name: "thickness" as keyof PhoneDesignFormData, label: t('thicknessLabel'), icon: Ruler, componentType: "Input", inputType: "number", unit: "mm" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>{t('designPhoneTitle')}</CardTitle>
          <CardDescription>{t('designPhoneDesc')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {formFields.map(field => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="flex items-center">
                  {field.icon && <field.icon className="w-4 h-4 mr-2 text-muted-foreground" />}
                  {field.label}
                  {(field.componentType === "Slider" || field.componentType === "Input") && (
                    <span className="ml-auto text-sm text-foreground">
                      {watchedValues[field.name as keyof PhoneDesignFormData]}
                      {field.unit ? ` ${field.unit}` : ''}
                    </span>
                  )}
                </Label>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: controllerField }) => {
                    const commonProps = { ...controllerField, id: field.name };
                    if (field.componentType === "Select") {
                      return (
                        <Select onValueChange={commonProps.onChange} value={String(commonProps.value)} defaultValue={String(commonProps.value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectPlaceholder', {label: field.label.toLowerCase()})} />
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
                            const val = field.inputType === 'number' ? parseFloat(e.target.value) : e.target.value;
                            commonProps.onChange(isNaN(val as number) ? 0 : val);
                          }}
                        />
                      );
                    }
                    if (field.componentType === "Switch") {
                      return (
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={field.name}
                            checked={Boolean(commonProps.value)}
                            onCheckedChange={commonProps.onChange}
                          />
                          <Label htmlFor={field.name} className="text-sm text-muted-foreground">
                            {Boolean(commonProps.value) ? t('enabled') : t('disabled')} (+${NFC_COST})
                          </Label>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {errors[field.name] && <p className="text-sm text-destructive">{errors[field.name]?.message}</p>}
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveDesignButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="w-5 h-5 mr-2 text-primary" />{t('estimatedCostTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">${estimatedCost.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">{t('estimatedCostDesc')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('phonePreviewTitle')}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div 
              className="bg-muted rounded-xl border-4 border-foreground/50 flex items-center justify-center p-1 overflow-hidden" 
              style={{ 
                borderColor: watchedValues.color, 
                width: `${Math.max(60, watchedValues.width * 0.4 + 40)}px`, // Dynamic width based on phone width
                height: `${Math.max(120, watchedValues.height * 0.4 + 80)}px`, // Dynamic height
              }}
            >
              <div className="w-full h-full bg-background rounded-sm flex flex-col items-center justify-center text-center p-1">
                 <Smartphone className="w-10 h-10 text-muted-foreground mb-1" />
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{PROCESSOR_OPTIONS.options?.find(o=>o.value === watchedValues.processor)?.label.split(' ')[0]}</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{watchedValues.ram}GB RAM, {watchedValues.storage}GB</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{watchedValues.screenSize}" {DISPLAY_OPTIONS.options?.find(o=>o.value === watchedValues.displayType)?.label.split(' ')[0]}</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{watchedValues.cameraResolution}MP / {watchedValues.frontCameraResolution}MP Cam</p>
                 <p className="text-[0.6rem] leading-tight text-muted-foreground">{REFRESH_RATE_OPTIONS.options?.find(o=>o.value === watchedValues.refreshRate)?.label}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3 text-center">
              {`${MATERIAL_OPTIONS.options?.find(o=>o.value === watchedValues.material)?.label}, ${COLOR_OPTIONS.find(c => c.value === watchedValues.color)?.label || t('customColor')}`}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {`${watchedValues.height}mm x ${watchedValues.width}mm x ${watchedValues.thickness}mm`}
            </p>
             {watchedValues.nfcSupport && <p className="text-xs text-muted-foreground text-center flex items-center mt-1"><SmartphoneNfc className="w-3 h-3 mr-1"/>NFC</p>}
             <p className="text-xs text-muted-foreground text-center mt-1">{WATER_RESISTANCE_OPTIONS.options?.find(o=>o.value === watchedValues.waterResistance)?.label}</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader><CardTitle className="flex items-center"><Info className="w-5 h-5 mr-2 text-primary"/>{t('designTipsTitle')}</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-1 text-muted-foreground">
            <p>{t('designTip1')}</p>
            <p>{t('designTip2')}</p>
            <p>{t('designTip3')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
