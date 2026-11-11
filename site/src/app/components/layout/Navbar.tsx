import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import CartIcon from '../ui/CartIcon';
import HamburgerButton from './HamburgerButton';
import { useCart } from '../../context/CartContext';

interface NavbarProps {
  onMobileMenuToggle: (isOpen: boolean) => void;
  onSearchToggle: (isOpen: boolean) => void;
}

export default function Navbar({ onMobileMenuToggle, onSearchToggle }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems, toggleCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle(newState);
  };

  const handleSearchToggle = () => {
    const newState = !isSearchOpen;
    setIsSearchOpen(newState);
    onSearchToggle(newState);
  };

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
        isScrolled
          ? 'bg-[#0B0A2A]/95 backdrop-blur-md shadow-[0_1px_0_rgba(245,240,235,0.08)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-12">
        <div className="flex h-20 items-center justify-between">
          {/* Mobile menu button */}
          <HamburgerButton
            isOpen={isMobileMenuOpen}
            onClick={handleMobileMenuToggle}
          />

          {/* Desktop nav links - left */}
          <div className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative text-[11px] font-medium uppercase tracking-[0.2em] text-[#F5F0EB]/80 transition-colors duration-300 hover:text-[#F5F0EB]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#B8155F] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Logo - center */}
          <a
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-base sm:text-2xl font-bold uppercase tracking-[0.15em] sm:tracking-[0.3em] text-[#F5F0EB] transition-opacity duration-300 hover:opacity-80"
          >
            Shape<span className="text-magenta-500">Wear</span>Fit
          </a>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              onClick={handleSearchToggle}
              className="flex h-10 w-10 items-center justify-center text-[#F5F0EB]/80 transition-colors duration-300 hover:text-[#F5F0EB]"
              aria-label={isSearchOpen ? 'Close search' : 'Open search'}
            >
              {isSearchOpen ? (
                <X className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <Search className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>

            {/* Cart / Shopping Bag */}
            <button
              onClick={toggleCart}
              className="group relative flex h-10 w-10 items-center justify-center"
              aria-label={`Shopping cart with ${totalItems} items`}
            >
              <CartIcon className="h-6 w-6 opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#B8155F] px-1 text-[10px] font-semibold leading-none text-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export { Navbar };
