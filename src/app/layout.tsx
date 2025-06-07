
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';

export const metadata: Metadata = {
  title: 'Gadget Tycoon',
  description: 'Create and sell your own gadgets!',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <SettingsProvider>
        {/* lang attribute will be set by LanguageProvider after client-side initialization */}
        <html className="dark" suppressHydrationWarning={true}>
          <head suppressHydrationWarning={true}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <link rel="manifest" href="/manifest.json" />
            {/* 
              You will need to create these icon files and place them in /public/images/icons/
              or update the paths in /public/manifest.json 
            */}
            {/* <link rel="icon" href="/images/icons/favicon.ico" sizes="any" /> */}
            {/* <link rel="apple-touch-icon" href="/images/icons/apple-touch-icon.png" /> */}
          </head>
          <body className="font-body antialiased" suppressHydrationWarning={true}>
            <AppLayout>{children}</AppLayout>
            <Toaster />
          </body>
        </html>
      </SettingsProvider>
    </LanguageProvider>
  );
}
