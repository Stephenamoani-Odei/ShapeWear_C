import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useCart } from '../../context/CartContext';
import { formatGHS } from '@/lib/money';

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalItems,
    subtotal,
  } = useCart();

  const navigate = useNavigate();
  const overlayRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useGSAP(
    () => {
      if (!overlayRef.current || !drawerRef.current) return;

      if (isOpen) {
        gsap.set(overlayRef.current, { display: 'block' });
        gsap.set(drawerRef.current, { display: 'flex' });

        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power2.out' }
        );
        gsap.fromTo(
          drawerRef.current,
          { xPercent: 100 },
          { xPercent: 0, duration: 0.45, ease: 'power3.out' }
        );
      } else {
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
          onComplete: () => {
            if (overlayRef.current) gsap.set(overlayRef.current, { display: 'none' });
          },
        });
        gsap.to(drawerRef.current, {
          xPercent: 100,
          duration: 0.35,
          ease: 'power3.in',
          onComplete: () => {
            if (drawerRef.current) gsap.set(drawerRef.current, { display: 'none' });
          },
        });
      }
    },
    { dependencies: [isOpen] }
  );

  const formatPrice = formatGHS;

  const goToCheckout = () => {
    closeCart();
    navigate({ to: '/checkout' });
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[200] hidden bg-navy-950/60 backdrop-blur-sm"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 z-[201] hidden h-full w-full max-w-md flex-col bg-[#0B0A2A] shadow-[-4px_0_30px_rgba(0,0,0,0.4)]"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F5F0EB]/10 px-6 py-5">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F5F0EB]">
              Your Bag
            </h2>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F5F0EB]/10 px-1.5 text-[10px] font-medium text-[#F5F0EB]/60">
              {totalItems}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="flex h-10 w-10 items-center justify-center text-[#F5F0EB]/60 transition-colors duration-200 hover:text-[#F5F0EB]"
            aria-label="Close cart"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Cart content */}
        {items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
            <div className="text-center">
              <p className="text-lg font-light uppercase tracking-[0.15em] text-[#F5F0EB]/40">
                Your bag is empty
              </p>
              <p className="mt-2 text-sm text-[#F5F0EB]/25">
                Browse our office shirts and jerseys to get started.
              </p>
            </div>
            <button
              onClick={closeCart}
              className="border border-[#F5F0EB]/20 px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#F5F0EB] transition-all duration-300 hover:border-[#F5F0EB]/40 hover:bg-[#F5F0EB]/5"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="flex flex-col gap-5">
                {items.map((item) => {
                  const cartKey = `${item.id}-${item.selectedSize}-${item.selectedFit ?? ''}`;
                  return (
                    <div
                      key={cartKey}
                      className="flex gap-4 border-b border-[#F5F0EB]/5 pb-5 last:border-0"
                    >
                      {/* Product image */}
                      <div className="h-28 w-22 flex-shrink-0 overflow-hidden bg-[#1C1958]">
                        {item.images && item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-widest text-[#F5F0EB]/20">
                            No img
                          </div>
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <h3 className="text-sm font-medium uppercase tracking-wide text-[#F5F0EB]">
                            {item.name}
                          </h3>
                          <div className="mt-1 flex gap-3">
                            {item.selectedSize && (
                              <span className="text-[11px] uppercase tracking-wider text-[#F5F0EB]/40">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedFit && (
                              <span className="text-[11px] uppercase tracking-wider text-[#F5F0EB]/40">
                                Fit: {item.selectedFit}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-end justify-between">
                          {/* Quantity controls */}
                          <div className="flex items-center border border-[#F5F0EB]/15">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.selectedSize, item.quantity - 1, item.selectedFit)
                              }
                              className="flex h-8 w-8 items-center justify-center text-[#F5F0EB]/50 transition-colors hover:text-[#F5F0EB]"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" strokeWidth={1.5} />
                            </button>
                            <span className="flex h-8 w-8 items-center justify-center border-x border-[#F5F0EB]/15 text-xs font-medium text-[#F5F0EB]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.selectedSize, item.quantity + 1, item.selectedFit)
                              }
                              className="flex h-8 w-8 items-center justify-center text-[#F5F0EB]/50 transition-colors hover:text-[#F5F0EB]"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" strokeWidth={1.5} />
                            </button>
                          </div>

                          {/* Price and remove */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-[#F5F0EB]">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <button
                              onClick={() =>
                                removeItem(item.id, item.selectedSize, item.selectedFit)
                              }
                              className="flex h-7 w-7 items-center justify-center text-[#F5F0EB]/30 transition-colors duration-200 hover:text-[#B8155F]"
                              aria-label={`Remove ${item.name} from bag`}
                            >
                              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer - Subtotal + Checkout */}
            <div className="border-t border-[#F5F0EB]/10 px-6 py-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-[#F5F0EB]/60">
                  Subtotal
                </span>
                <span className="text-lg font-semibold text-[#F5F0EB]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="mb-4 text-[11px] text-[#F5F0EB]/30">
                Delivery is not included. After you order, we will contact you with the delivery price.
              </p>
              <button
                onClick={goToCheckout}
                className="w-full bg-[#B8155F] py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-all duration-300 hover:bg-[#991B1B] shadow-[0_0_20px_rgba(184,21,95,0.3)]"
              >
                Proceed to Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export { CartDrawer };
