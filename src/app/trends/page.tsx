
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getTrendForecast, type TrendForecastingFormState } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, TrendingUp, AlertCircle } from "lucide-react";
import type { Trend } from "@/lib/types";
import { useTranslation } from "@/hooks/useTranslation";

function SubmitButton() {
  const { pending } = useFormStatus();
  const { t } = useTranslation();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
      {t('forecastTrendsButton')}
    </Button>
  );
}

export default function TrendForecastingPage() {
  const { t } = useTranslation();
  const initialState: TrendForecastingFormState = { message: null, errors: {}, trends: [] };
  const [state, formAction] = useFormState(getTrendForecast, initialState);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>{t('trendsPageTitle')}</CardTitle>
          <CardDescription>{t('trendsPageDesc')}</CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="marketData">{t('marketDataLabel')}</Label>
                <Textarea
                  id="marketData"
                  name="marketData"
                  placeholder={t('marketDataPlaceholder')}
                  rows={5}
                  aria-describedby="marketData-error"
                />
                {state.errors?.marketData && (
                  <p id="marketData-error" className="text-sm text-destructive">{state.errors.marketData.join(", ")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="competitorDevices">{t('competitorDevicesLabel')}</Label>
                <Textarea
                  id="competitorDevices"
                  name="competitorDevices"
                  placeholder={t('competitorDevicesPlaceholder')}
                  rows={5}
                  aria-describedby="competitorDevices-error"
                />
                 {state.errors?.competitorDevices && (
                  <p id="competitorDevices-error" className="text-sm text-destructive">{state.errors.competitorDevices.join(", ")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="componentCosts">{t('componentCostsLabel')}</Label>
                <Textarea
                  id="componentCosts"
                  name="componentCosts"
                  placeholder={t('componentCostsPlaceholder')}
                  rows={5}
                  aria-describedby="componentCosts-error"
                />
                {state.errors?.componentCosts && (
                  <p id="componentCosts-error" className="text-sm text-destructive">{state.errors.componentCosts.join(", ")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="socialMediaBuzz">{t('socialMediaBuzzLabel')}</Label>
                <Textarea
                  id="socialMediaBuzz"
                  name="socialMediaBuzz"
                  placeholder={t('socialMediaBuzzPlaceholder')}
                  rows={5}
                  aria-describedby="socialMediaBuzz-error"
                />
                {state.errors?.socialMediaBuzz && (
                  <p id="socialMediaBuzz-error" className="text-sm text-destructive">{state.errors.socialMediaBuzz.join(", ")}</p>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state.message && !state.trends?.length && (
        <Alert variant={state.errors ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{state.errors ? t('errorStatus') : t('statusStatus')}</AlertTitle>
          <AlertDescription>{
            state.message === "Validation failed. Please check your inputs." ? t('validation_failed') :
            state.message === "Trends forecasted successfully." ? t('trends_success') :
            state.message === "AI did not return valid trend data." ? t('trends_no_data') :
            state.message === "An error occurred while forecasting trends. Please try again." ? t('trends_error') :
            state.message
          }</AlertDescription>
        </Alert>
      )}

      {state.trends && state.trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t('forecastedTrendsTitle')}</CardTitle>
            <CardDescription>{t('forecastedTrendsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('featureTechnologyLabel')}</TableHead>
                  <TableHead className="text-right">{t('popularityRankLabel')}</TableHead>
                  <TableHead className="text-right">{t('hotOrNotLabel')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.trends.map((trend: Trend, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{trend.feature}</TableCell>
                    <TableCell className="text-right">{trend.popularityRank}</TableCell>
                    <TableCell className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        trend.hotOrNot.toLowerCase() === 'hot' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trend.hotOrNot}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
