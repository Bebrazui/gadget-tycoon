
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
import { Award, Lightbulb, Target, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import type { Brand } from '@/lib/types';
import { LOCAL_STORAGE_BRAND_KEY } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { getBrandSlogansAction, type GenerateSlogansFormState } from './actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { List, ListItem } from '@/components/ui/list';
import { useSettings } from '@/context/SettingsContext'; // For offline mode

const localSloganTemplates = (brandName: string, marketingStrategy: string, t: Function) => {
  const baseSlogans = [
    t('local_slogan_template1', { brandName }),
    t('local_slogan_template2', { brandName }),
    t('local_slogan_template3'),
    t('local_slogan_template4', { brandName }),
  ];
  if (marketingStrategy === 'innovation_leader') {
    baseSlogans.push(t('local_slogan_innovation', { brandName }));
  } else if (marketingStrategy === 'budget_friendly') {
    baseSlogans.push(t('local_slogan_budget', { brandName }));
  } else if (marketingStrategy === 'premium_quality') {
    baseSlogans.push(t('local_slogan_premium', { brandName }));
  }
  // Shuffle and pick 3-4
  return baseSlogans.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 2) + 3);
};


export default function BrandManagementPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { settings } = useSettings();
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [isGeneratingSlogans, setIsGeneratingSlogans] = useState(false);
  const [sloganState, setSloganState] = useState<GenerateSlogansFormState | null>(null);


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
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      logoDescription: '',
      marketingStrategy: '',
    },
  });

  useEffect(() => {
    const storedBrandString = localStorage.getItem(LOCAL_STORAGE_BRAND_KEY);
    if (storedBrandString) {
      try {
        const storedBrand = JSON.parse(storedBrandString);
        setCurrentBrand(storedBrand);
        reset(storedBrand); 
      } catch (e) {
        console.error("Error parsing brand from localStorage", e);
        localStorage.removeItem(LOCAL_STORAGE_BRAND_KEY);
      }
    }
  }, [reset]);


  const onBrandSubmit = async (data: BrandFormData) => {
    setIsSavingBrand(true);
    setSloganState(null); 
    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    setCurrentBrand(data);
    localStorage.setItem(LOCAL_STORAGE_BRAND_KEY, JSON.stringify(data));
    
    toast({
      title: t('brandUpdatedTitle'),
      description: t('brandUpdatedDesc', {name: data.name}),
    });
    setIsSavingBrand(false);
  };

  const handleGenerateSlogans = async () => {
    if (!currentBrand || !currentBrand.name || !currentBrand.logoDescription || !currentBrand.marketingStrategy) {
      toast({
        variant: "destructive",
        title: t('genericErrorTitle'),
        description: t('brandDetailsIncompleteError'),
      });
      return;
    }
    setIsGeneratingSlogans(true);
    setSloganState(null);

    if (settings.useOnlineFeatures) {
        const result = await getBrandSlogansAction(currentBrand);
        setSloganState(result);
        if (result.error) {
        toast({
            variant: "destructive",
            title: t('sloganGenerationErrorTitle'),
            description: result.message || t('sloganGenerationErrorDesc'),
        });
        }
    } else {
        // Generate local slogans
        const localSlogans = localSloganTemplates(currentBrand.name, currentBrand.marketingStrategy, t);
        setSloganState({
            message: t("localSlogansGeneratedTitle"),
            slogans: localSlogans,
            error: false
        });
        toast({
            title: t("localSlogansGeneratedTitle"),
            description: `${localSlogans.length} ${t('slogansGeneratedLocallyDescSuffix') || 'slogans generated locally.'}`
        });
    }
    setIsGeneratingSlogans(false);
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
        <form onSubmit={handleSubmit(onBrandSubmit)}>
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
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGenerateSlogans} 
              disabled={isGeneratingSlogans || !currentBrand?.name || !currentBrand?.logoDescription || !currentBrand?.marketingStrategy}
              className="w-full sm:w-auto"
            >
              {isGeneratingSlogans ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {settings.useOnlineFeatures ? t('generateSlogansButton') : t('generateSlogansLocalButton')}
            </Button>
            <Button type="submit" disabled={isSavingBrand} className="w-full sm:w-auto">
              {isSavingBrand && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            {currentBrand && currentBrand.name ? (
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
                  <p className="text-sm">{currentBrand.logoDescription || t('notSet')}</p>
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

        {sloganState && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-primary" />
                {settings.useOnlineFeatures ? t('suggestedSlogansTitle') : t('localSlogansGeneratedTitle')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGeneratingSlogans && <p className="text-sm text-muted-foreground flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('generatingSlogansMessage')}</p>}
              {!isGeneratingSlogans && sloganState.error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{t('sloganGenerationErrorTitle')}</AlertTitle>
                  <AlertDescription>{sloganState.message || t('sloganGenerationErrorDesc')}</AlertDescription>
                </Alert>
              )}
              {!isGeneratingSlogans && !sloganState.error && sloganState.slogans && sloganState.slogans.length > 0 && (
                <List>
                  {sloganState.slogans.map((slogan, index) => (
                    <ListItem key={index} className="text-sm italic">"{slogan}"</ListItem>
                  ))}
                </List>
              )}
              {!isGeneratingSlogans && !sloganState.error && (!sloganState.slogans || sloganState.slogans.length === 0) && (
                <p className="text-sm text-muted-foreground">{t('noSlogansGenerated')}</p>
              )}
            </CardContent>
          </Card>
        )}

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
