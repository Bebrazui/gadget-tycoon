
"use client";

import React, { useState } from 'react';
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
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

const brandSchema = z.object({
  name: z.string().min(3, "Brand name must be at least 3 characters").max(50, "Brand name must be at most 50 characters"),
  logoDescription: z.string().min(10, "Logo description must be at least 10 characters").max(200, "Logo description must be at most 200 characters"),
  marketingStrategy: z.string().min(1, "Marketing strategy is required"),
});

type BrandFormData = z.infer<typeof brandSchema>;

const marketingStrategies = [
  { value: "budget_friendly", label: "Budget Friendly - Focus on affordability" },
  { value: "premium_quality", label: "Premium Quality - Target high-end market" },
  { value: "innovation_leader", label: "Innovation Leader - Emphasize new tech" },
  { value: "influencer_marketing", label: "Influencer Marketing - Leverage social media" },
  { value: "eco_conscious", label: "Eco-Conscious - Highlight sustainability" },
];

export default function BrandManagementPage() {
  const { toast } = useToast();
  const [currentBrand, setCurrentBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<BrandFormData>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      logoDescription: '',
      marketingStrategy: '',
    },
  });

  const onSubmit = async (data: BrandFormData) => {
    setIsSubmitting(true);
    console.log("Brand Details Submitted:", data);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentBrand(data);
    toast({
      title: "Brand Updated!",
      description: `Your brand "${data.name}" has been successfully updated.`,
    });
    setIsSubmitting(false);
    // reset(data); // Uncomment if you want to keep form filled after save
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-6 h-6 mr-2 text-primary" />
            Manage Your Brand
          </CardTitle>
          <CardDescription>Define your brand identity and marketing approach to conquer the market.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Brand Name</Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => <Input id="name" placeholder="e.g., NovaTech, Apex Gadgets" {...field} />}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logoDescription">Logo Description / Concept</Label>
              <Controller
                name="logoDescription"
                control={control}
                render={({ field }) => <Textarea id="logoDescription" placeholder="Describe your logo. e.g., Minimalist geometric shape, vibrant abstract design..." rows={4} {...field} />}
              />
              {errors.logoDescription && <p className="text-sm text-destructive">{errors.logoDescription.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="marketingStrategy">Marketing Strategy</Label>
              <Controller
                name="marketingStrategy"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger id="marketingStrategy">
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                    <SelectContent>
                      {marketingStrategies.map(strategy => (
                        <SelectItem key={strategy.value} value={strategy.value}>
                          {strategy.label}
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
              Save Brand Details
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-primary" />
              Current Brand Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentBrand ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{currentBrand.name}</h3>
                  <Image 
                    src={`https://placehold.co/300x150.png?text=${encodeURIComponent(currentBrand.name)}`}
                    alt={`${currentBrand.name} Logo Placeholder`}
                    width={300}
                    height={150}
                    className="rounded-md object-contain my-2 bg-muted"
                    data-ai-hint="brand logo"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Logo Concept:</p>
                  <p className="text-sm">{currentBrand.logoDescription}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Marketing Strategy:</p>
                  <p className="text-sm">{marketingStrategies.find(s => s.value === currentBrand.marketingStrategy)?.label || 'Not set'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No brand details saved yet. Fill out the form to define your brand.</p>
            )}
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-primary" />
                Branding Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>A strong brand resonates with your target audience.</p>
            <p>Your logo should be memorable and reflect your brand's values.</p>
            <p>Choose a marketing strategy that aligns with your product and financial goals.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
