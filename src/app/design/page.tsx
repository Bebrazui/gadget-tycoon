
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
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, HardDrive, Smartphone, Palette, Ruler, Zap, Camera, Loader2 } from 'lucide-react';
import Image from 'next/image';
import {
  PROCESSOR_OPTIONS, DISPLAY_OPTIONS, MATERIAL_OPTIONS, COLOR_OPTIONS,
  RAM_COST_PER_GB, STORAGE_COST_PER_GB, CAMERA_COST_PER_MP, BATTERY_COST_PER_100MAH,
  type PhoneDesign
} from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const phoneDesignSchema = z.object({
  processor: z.string().min(1, "Processor is required"),
  displayType: z.string().min(1, "Display type is required"),
  ram: z.number().min(2).max(32),
  storage: z.number().min(32).max(1024),
  cameraResolution: z.number().min(8).max(200),
  batteryCapacity: z.number().min(2000).max(10000),
  material: z.string().min(1, "Material is required"),
  color: z.string().min(1, "Color is required"),
  height: z.number().min(100).max(200),
  width: z.number().min(50).max(100),
  thickness: z.number().min(5).max(15),
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
};

export default function DesignPhonePage() {
  const { toast } = useToast();
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, formState: { errors } } = useForm<PhoneDesignFormData>({
    resolver: zodResolver(phoneDesignSchema),
    defaultValues,
  });

  const watchedValues = watch();

  const calculateCost = useCallback(() => {
    let cost = 0;
    const processor = PROCESSOR_OPTIONS.options?.find(opt => opt.value === watchedValues.processor);
    if (processor) cost += processor.cost;

    const display = DISPLAY_OPTIONS.options?.find(opt => opt.value === watchedValues.displayType);
    if (display) cost += display.cost;
    
    const material = MATERIAL_OPTIONS.options?.find(opt => opt.value === watchedValues.material);
    if (material) cost += material.cost;

    cost += watchedValues.ram * RAM_COST_PER_GB;
    cost += watchedValues.storage * STORAGE_COST_PER_GB;
    cost += watchedValues.cameraResolution * CAMERA_COST_PER_MP;
    cost += (watchedValues.batteryCapacity / 100) * BATTERY_COST_PER_100MAH;
    
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "Phone Design Saved!",
      description: `Your new phone design with an estimated cost of $${estimatedCost.toFixed(2)} has been saved.`,
    });
    setIsSubmitting(false);
  };

  const formFields = [
    { name: "processor" as keyof PhoneDesignFormData, label: "Processor", icon: HardDrive, component: Select, options: PROCESSOR_OPTIONS.options },
    { name: "displayType" as keyof PhoneDesignFormData, label: "Display Type", icon: Smartphone, component: Select, options: DISPLAY_OPTIONS.options },
    { name: "ram" as keyof PhoneDesignFormData, label: "RAM (GB)", icon: HardDrive, component: Slider, min: 2, max: 32, step: 2 },
    { name: "storage" as keyof PhoneDesignFormData, label: "Storage (GB)", icon: HardDrive, component: Slider, min: 32, max: 1024, step: 32 }, // Common storage steps 32,64,128,256,512,1024
    { name: "cameraResolution" as keyof PhoneDesignFormData, label: "Camera (MP)", icon: Camera, component: Slider, min: 8, max: 200, step: 4 },
    { name: "batteryCapacity" as keyof PhoneDesignFormData, label: "Battery (mAh)", icon: Zap, component: Slider, min: 2000, max: 10000, step: 100 },
    { name: "material" as keyof PhoneDesignFormData, label: "Material", icon: Smartphone, component: Select, options: MATERIAL_OPTIONS.options },
    { name: "color" as keyof PhoneDesignFormData, label: "Color", icon: Palette, component: Select, options: COLOR_OPTIONS },
    { name: "height" as keyof PhoneDesignFormData, label: "Height (mm)", icon: Ruler, component: Input, type: "number" },
    { name: "width" as keyof PhoneDesignFormData, label: "Width (mm)", icon: Ruler, component: Input, type: "number" },
    { name: "thickness" as keyof PhoneDesignFormData, label: "Thickness (mm)", icon: Ruler, component: Input, type: "number" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Design Your Next Phone</CardTitle>
          <CardDescription>Select components and customize the appearance of your new gadget.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {formFields.map(field => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="flex items-center">
                  {field.icon && <field.icon className="w-4 h-4 mr-2 text-muted-foreground" />}
                  {field.label}
                  {field.component === Slider && <span className="ml-auto text-sm text-foreground">{watchedValues[field.name as keyof PhoneDesignFormData]}</span>}
                </Label>
                <Controller
                  name={field.name}
                  control={control}
                  render={({ field: controllerField }) => {
                    const commonProps = { ...controllerField, id: field.name };
                    if (field.component === Select) {
                      return (
                        <Select onValueChange={commonProps.onChange} defaultValue={String(commonProps.value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options?.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label} (+${option.cost || 0})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      );
                    }
                    if (field.component === Slider) {
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
                    if (field.component === Input) {
                      return (
                        <Input
                          type={field.type}
                          value={String(commonProps.value)}
                          onChange={(e) => commonProps.onChange(parseFloat(e.target.value) || 0)}
                        />
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
              Save Design
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><DollarSign className="w-5 h-5 mr-2 text-primary" />Estimated Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-primary">${estimatedCost.toFixed(2)}</p>
            <p className="text-sm text-muted-foreground mt-1">This is an approximate cost based on your selections.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phone Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-48 h-96 bg-muted rounded-xl border-4 border-foreground/50 flex items-center justify-center p-2" style={{ borderColor: watchedValues.color }}>
              <div className="w-full h-full bg-background rounded-md flex flex-col items-center justify-center">
                 <Smartphone className="w-16 h-16 text-muted-foreground" />
                 <p className="text-xs text-muted-foreground mt-2">{watchedValues.processor.split('_')[0]}</p>
                 <p className="text-xs text-muted-foreground">{watchedValues.ram}GB RAM</p>
                 <p className="text-xs text-muted-foreground">{watchedValues.displayType.split('_')[0].toUpperCase()}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              {`${watchedValues.material}, ${watchedValues.color === '#000000' ? 'Black' : watchedValues.color === '#FFFFFF' ? 'White' : COLOR_OPTIONS.find(c => c.value === watchedValues.color)?.label || 'Custom Color'}`}
            </p>
            <p className="text-xs text-muted-foreground text-center">
              {`${watchedValues.height}mm x ${watchedValues.width}mm x ${watchedValues.thickness}mm`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
