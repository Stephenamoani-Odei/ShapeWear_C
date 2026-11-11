import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getProductById } from '../data/products';

/** A line in the bag. Customers choose a size only — no colour. */
export interface CartItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  selectedSize: string;
  /** Only for long-sleeve shirts: 'Custom Fit' or 'Slim Fit'. */
  selectedFit?: string | undefined;
  quantity: number;
}

export interface ToastNotification {
  id: string;
  message: string;
  itemName: string;
  image?: string | undefined;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (id: string, selectedSize: string, selectedFit?: string) => void;
  updateQuantity: (id: string, selectedSize: string, quantity: number, selectedFit?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  toast: ToastNotification | null;
  dismissToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// v2: the old cart stored colours and USD prices, so it is intentionally not reused.
const STORAGE_KEY = 'shapewearfit_cart_v2';

function getCartKey(item: { id: string; selectedSize: string; selectedFit?: string | undefined }) {
  return `${item.id}-${item.selectedSize}-${item.selectedFit ?? ''}`;
}

/** Re-read name/price/image from the catalogue and drop anything no longer sold. */
function syncWithCatalogue(saved: CartItem[]): CartItem[] {
  const result: CartItem[] = [];
  for (const item of saved) {
    const product = getProductById(item.id);
    if (!product || !product.sizes.includes(item.selectedSize)) continue;
    // Shirts need a valid fit; anything saved without one is dropped so the customer re-chooses.
    if (product.fits && !(item.selectedFit && product.fits.includes(item.selectedFit))) continue;
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(item.quantity) || 1)));
    result.push({
      id: product.id,
      name: product.name,
      price: product.price,
      images: product.images,
      selectedSize: item.selectedSize,
      ...(product.fits ? { selectedFit: item.selectedFit } : {}),
      quantity,
    });
  }
  return result;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<ToastNotification | null>(null);

  // Load the saved bag once on the client
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(syncWithCatalogue(JSON.parse(saved)));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // Persist (only after the first load, so an empty initial state never overwrites a saved bag)
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const addItem = useCallback((newItem: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => getCartKey(item) === getCartKey(newItem));
      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex]!;
        updated[existingIndex] = { ...existing, quantity: Math.min(20, existing.quantity + quantity) };
        return updated;
      }
      return [...prev, { ...newItem, quantity }];
    });

    setToast({
      id: Date.now().toString(),
      message: 'Added to bag',
      itemName: `${newItem.name} (${[newItem.selectedSize, newItem.selectedFit].filter(Boolean).join(', ')})`,
      image: newItem.images[0],
    });
    setTimeout(() => setToast(null), 3500);
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string, selectedSize: string, selectedFit?: string) => {
    setItems((prev) => prev.filter((item) => getCartKey(item) !== getCartKey({ id, selectedSize, selectedFit })));
  }, []);

  const updateQuantity = useCallback(
    (id: string, selectedSize: string, quantity: number, selectedFit?: string) => {
      if (quantity <= 0) {
        removeItem(id, selectedSize, selectedFit);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          getCartKey(item) === getCartKey({ id, selectedSize, selectedFit })
            ? { ...item, quantity: Math.min(20, quantity) }
            : item
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
