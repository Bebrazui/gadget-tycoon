
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

export function SidebarItems() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/', labelKey: 'dashboard', icon: LayoutDashboard },
    { href: '/design', labelKey: 'designPhone', icon: Smartphone },
    { href: '/brand', labelKey: 'brand', icon: Award },
    { href: '/market', labelKey: 'marketAnalysis', icon: LineChart },
    { href: '/financials', labelKey: 'financials', icon: Banknote },
    { href: '/trends', labelKey: 'trendForecasting', icon: Brain },
  ];

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
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href}
              tooltip={{ children: t(item.labelKey), side: 'right', className: "bg-card text-card-foreground" }}
            >
              <Link href={item.href}>
                <item.icon />
                <span>{t(item.labelKey)}</span>
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
