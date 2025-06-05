
"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

const navItemTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/design': 'Design New Phone',
  '/brand': 'Brand Management',
  '/market': 'Market Analysis',
  '/financials': 'Financial Overview',
  '/trends': 'AI Trend Forecasting',
};

export function PageHeader() {
  const pathname = usePathname();
  const title = navItemTitles[pathname] || 'Gadget Tycoon';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-xl font-semibold font-headline">{title}</h1>
      <div className="ml-auto">
        {/* Placeholder for user profile/actions */}
        <Button variant="ghost" size="icon" aria-label="Log out">
           <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
