
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react'; // Import React for useMemo
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Smartphone,
  Award,
  LineChart,
  Banknote,
  Brain,
  Github,
  ListChecks,
  Briefcase,
  FlaskConical,
  Settings,
  MessageSquareText,
  Volume2, // Added for Marketing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

export function SidebarItems() {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Memoize the navItems array along with pre-calculated labels and tooltip configurations.
  // This array will only recompute if `t` (i.e., the language) changes.
  const memoizedNavItems = React.useMemo(() => {
    const itemsDefinition = [
      { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
      { href: '/design', labelKey: 'designPhone', icon: Smartphone },
      { href: '/my-phones', labelKey: 'myPhones', icon: ListChecks },
      { href: '/procurement', labelKey: 'clientContracts', icon: Briefcase },
      { href: '/rd', labelKey: 'rd', icon: FlaskConical },
      { href: '/brand', labelKey: 'brand', icon: Award },
      { href: '/marketing', labelKey: 'marketing', icon: Volume2 }, // Added Marketing
      { href: '/market', labelKey: 'marketAnalysis', icon: LineChart },
      { href: '/financials', labelKey: 'financials', icon: Banknote },
      { href: '/reviews', labelKey: 'customerReviews', icon: MessageSquareText },
      { href: '/trends', labelKey: 'trendForecasting', icon: Brain },
      { href: '/settings', labelKey: 'settings', icon: Settings },
    ];

    return itemsDefinition.map(itemDef => ({
      ...itemDef,
      label: t(itemDef.labelKey), // Pre-translate label for the span
      tooltipConfig: { // Create a stable tooltip config object for each item
        children: t(itemDef.labelKey), // Tooltip text
        side: 'right' as const,
        className: "bg-card text-card-foreground"
      }
    }));
  }, [t]);

  return (
    <>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary">
            <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
            <path d="M12 18v.01"></path>
          </svg>
          <h1 className="text-xl font-semibold font-headline group-data-[collapsible=icon]:hidden">
            Gadget Tycoon
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1 p-2">
        {memoizedNavItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={item.tooltipConfig} // Pass the stable tooltipConfig object
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span> {/* Use the pre-translated label */}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      <div className="p-4 mt-auto group-data-[collapsible=icon]:hidden">
         <Button variant="outline" className="w-full" asChild>
            <a href="https://github.com/FirebaseExtended/genkit/tree/main/examples/next-shadcn-firebase" target="_blank" rel="noopener noreferrer">
              <Github className="mr-2 h-4 w-4" />
              {t('viewOnGithub')}
            </a>
          </Button>
      </div>
    </>
  );
}
