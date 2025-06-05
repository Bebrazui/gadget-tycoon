
"use client";

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Lightbulb, Target, Loader2 } from 'lucide-react';
import type { Brand } from '@/lib/types';
import { LOCAL_STORAGE_BRAND_KEY } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';


export default function BrandManagementPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const marketingStrategies = [
    { value: "budget_friendly", labelKey: 'marketingStrategy_budget' },
    { value: "premium_quality", labelKey: 'marketingStrategy_premium' },
    { value: "innovation_leader", labelKey: 'marketingStrategy_innovation' },
    { value: "influencer_marketing", labelKey: 'marketingStrategy_influencer' },
    { value: "eco_conscious", labelKey: 'marketingStrategy_eco' },
  ];
  
  const brandSchema = z.object({
    name: z.string()
      .min(3, t('validation_min3chars', { field: t('brandNameLabel') }))
      .max(50, t('validation_max50chars', { field: t('brandNameLabel') })),
    logoDescription: z.string()
      .min(10, t('validation_min10chars', { field: t('logoDescriptionLabel') }))
      .max(200, t('validation_max200chars', { field: t('logoDescriptionLabel') })),
    marketingStrategy: z.string().min(1, t('validation_required', {field: t('marketingStrategyLabel')})),
  });

  type BrandFormData = z.infer<typeof brandSchema>;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema), // Re-evaluate if schema needs to be dynamic with `t`
    defaultValues: {
      name: '',
      logoDescription: '',
      marketingStrategy: '',
    },
  });

  useEffect(() => {
    const storedBrandString = localStorage.getItem(LOCAL_STORAGE_BRAND_KEY);
    if (storedBrandString) {
      const storedBrand = JSON.parse(storedBrandString);
      setCurrentBrand(storedBrand);
      reset(storedBrand); // Populate form with stored data
    }
  }, [reset]);


  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentBrand(data);
    localStorage.setItem(LOCAL_STORAGE_BRAND_KEY, JSON.stringify(data));
    
    toast({
      title: t('brandUpdatedTitle'),
      description: t('brandUpdatedDesc', {name: data.name}),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-6 h-6 mr-2 text-primary" />
            {t('brandPageTitle')}
          </CardTitle>
          <CardDescription>{t('brandPageDesc')}</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t('brandNameLabel')}</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" placeholder={t('brandNamePlaceholder')} {...field} />}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoDescription">{t('logoDescriptionLabel')}</Label>
              <Controller
                name="logoDescription"
                control={control}
                render={({ field }) => <Textarea id="logoDescription" placeholder={t('logoDescriptionPlaceholder')} rows={4} {...field} />}
              />
              {errors.logoDescription && <p className="text-sm text-destructive">{errors.logoDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketingStrategy">{t('marketingStrategyLabel')}</Label>
              <Controller
                name="marketingStrategy"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <SelectTrigger id="marketingStrategy">
                      <SelectValue placeholder={t('selectMarketingStrategy')} />
                    </SelectTrigger>
                    <SelectContent>
                      {marketingStrategies.map(strategy => (
                        <SelectItem key={strategy.value} value={strategy.value}>
                          {t(strategy.labelKey)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.marketingStrategy && <p className="text-sm text-destructive">{errors.marketingStrategy.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveBrandButton')}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              {t('currentBrandIdentityTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentBrand ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{currentBrand.name}</h3>
                  <Image 
                    src={`https://placehold.co/300x150.png?text=${encodeURIComponent(currentBrand.name)}`}
                    alt={`${currentBrand.name} ${t('logoPlaceholderAlt') || 'Logo Placeholder'}`}
                    width={300}
                    height={150}
                    className="rounded-md object-contain my-2 bg-muted"
                    data-ai-hint="brand logo"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('logoConceptLabel')}:</p>
                  <p className="text-sm">{currentBrand.logoDescription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t('marketingStrategyLabel')}:</p>
                  <p className="text-sm">{t(marketingStrategies.find(s => s.value === currentBrand.marketingStrategy)?.labelKey || '') || t('notSet')}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('noBrandDetailsSaved')}</p>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                {t('brandingTipsTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>{t('brandingTip1')}</p>
            <p>{t('brandingTip2')}</p>
            <p>{t('brandingTip3')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

