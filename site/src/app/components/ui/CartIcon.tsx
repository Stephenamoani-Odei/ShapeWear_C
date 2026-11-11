import cartIcon from '@/assets/cart-icon.png';

/** The store's shopping-cart icon (replaces the old bag icon everywhere). */
export default function CartIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return <img src={cartIcon} alt="" aria-hidden="true" draggable={false} className={`inline-block object-contain ${className}`} />;
}
