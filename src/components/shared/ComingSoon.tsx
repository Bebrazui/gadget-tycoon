
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface ComingSoonProps {
  featureName?: string; // Can be a translation key or a direct string
}

export function ComingSoon({ featureName }: ComingSoonProps) {
  const { t } = useTranslation();
  const actualFeatureName = featureName ? (featureName.includes(' ') ? featureName : t(featureName)) : t('thisFeature');


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex flex-col items-center gap-2">
          <Construction className="w-12 h-12 text-primary" />
          {t('comingSoonTitle')}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-muted-foreground">
          {t('comingSoonDesc', { featureName: actualFeatureName })}
        </p>
      </CardContent>
    </Card>
  );
}
