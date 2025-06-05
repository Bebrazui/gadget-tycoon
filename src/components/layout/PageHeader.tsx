
"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Language } from '@/context/LanguageContext';
import { Label } from '@/components/ui/label';

const navItemTitleKeys: Record<string, string> = {
  '/': 'pageTitleDashboard',
  '/design': 'pageTitleDesign',
  '/brand': 'pageTitleBrand',
  '/market': 'pageTitleMarket',
  '/financials': 'pageTitleFinancials',
  '/trends': 'pageTitleTrends',
};

export function PageHeader() {
  const pathname = usePathname();
  const { t, language, setLanguage } = useTranslation();
  
  const titleKey = navItemTitleKeys[pathname] || 'pageTitleDashboard'; // Default to dashboard title key
  const title = t(titleKey);

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold font-headline">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex items-center gap-2">
           <Languages className="h-5 w-5 text-muted-foreground" />
           <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[100px] h-9 text-xs" aria-label={t('languageLabel')}>
              <SelectValue placeholder={t('languageLabel')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" size="icon" aria-label={t('logOut')}>
           <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
