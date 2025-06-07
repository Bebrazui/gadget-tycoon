
import type { Metadata } from 'next';
import './globals.css';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from "@/components/ui/toaster";
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';

export const metadata: Metadata = {
  title: 'Gadget Tycoon',
  description: 'Create and sell your own gadgets!',
  manifest: '/manifest.json', // Added manifest link
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The LanguageProvider will set the lang attribute on html tag via useEffect
    // Initial lang can be 'en' to prevent hydration mismatch if server default is different
    // suppressHydrationWarning is kept for safety against browser extensions
    <LanguageProvider>
      <SettingsProvider>
        <html lang="en" className="dark" suppressHydrationWarning={true}>
          <head suppressHydrationWarning={true}>
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            {/* Standard favicon links - you would need to add these files to /public */}
            {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
            {/* <link rel="apple-touch-icon" href="/apple-touch-icon.png" /> */}
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
