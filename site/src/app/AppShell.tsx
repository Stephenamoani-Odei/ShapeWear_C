import { useEffect, useState } from 'react';
import { useRouterState } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CartProvider } from './context/CartContext';
import Navbar from './components/layout/Navbar';
import MobileMenu from './components/layout/MobileMenu';
import CartDrawer from './components/layout/CartDrawer';
import Footer from './components/layout/Footer';
import CustomCursor from './components/ui/CustomCursor';
import Toast from './components/ui/Toast';
import SearchModal from './components/ui/SearchModal';
import ScrollToTop from './components/ui/ScrollToTop';
import ScrollProgress from './components/ui/ScrollProgress';
import ProductDetailModal from './components/products/ProductDetailModal';
import type { Product } from './data/products';

gsap.registerPlugin(ScrollTrigger);

function AppContent({ children }: { children: ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isAdmin = pathname.startsWith('/admin');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({ autoRaf: false, smoothWheel: true });
    const updateScrollTrigger = () => ScrollTrigger.update();
    const updateLenis = (time: number) => lenis.raf(time * 1000);

    lenis.on('scroll', updateScrollTrigger);
    gsap.ticker.add(updateLenis);
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.off('scroll', updateScrollTrigger);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0A2A] text-[#F5F0EB] selection:bg-magenta-600 selection:text-white flex flex-col justify-between">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Real-time neon red scroll down progress bar */}
      <ScrollProgress />

      {/* Desktop Atmospheric Cursor */}
      <CustomCursor />

      {/* Floating Toast Notification */}
      <Toast />

      {/* Global Navigation */}
      <Navbar
        onMobileMenuToggle={(isOpen) => setIsMobileMenuOpen(isOpen)}
        onSearchToggle={(isOpen) => setIsSearchOpen(isOpen)}
      />

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Search Overlay */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setActiveProduct(p)}
      />

      {/* Cart Sliding Drawer */}
      <CartDrawer />

      {/* Routed Main Page Content */}
      <main id="main-content" className="flex-1">
        {children}
      </main>

      {/* Rich Editorial Footer with Social Media Hub */}
      {!isAdmin && <Footer />}

      {/* Global Product Detail Modal */}
      <ProductDetailModal
        product={activeProduct}
        onClose={() => setActiveProduct(null)}
      />
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <AppContent>{children}</AppContent>
    </CartProvider>
  );
}
