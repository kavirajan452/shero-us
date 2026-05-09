'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CartProvider } from '@/contexts/CartContext';
import { RegionProvider } from '@/contexts/RegionContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { CustomerLocationProvider } from '@/contexts/CustomerLocationContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import Analytics from '@/components/Analytics';
import ScrollToTop from '@/components/ScrollToTop';
import WhatsAppSupport from '@/components/WhatsAppSupport';
import { Suspense } from 'react';
import '@/i18n';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <RegionProvider>
        <AuthProvider>
          <WalletProvider>
            <CustomerLocationProvider>
              <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <ScrollToTop />
                <Analytics />
                <Suspense fallback={<div className="min-h-screen bg-background" />}>
                  {children}
                </Suspense>
                <WhatsAppSupport />
                </TooltipProvider>
              </CartProvider>
            </CustomerLocationProvider>
          </WalletProvider>
        </AuthProvider>
      </RegionProvider>
    </QueryClientProvider>
  );
}
