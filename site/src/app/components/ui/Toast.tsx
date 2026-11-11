import { useCart } from '../../context/CartContext';
import { Check, X } from 'lucide-react';

export default function Toast() {
  const { toast, dismissToast, openCart } = useCart();

  if (!toast) return null;

  return (
    <aside
      aria-label="Notification"
      className="fixed bottom-6 right-6 z-[300] flex max-w-md items-center gap-4 border border-magenta-600/30 bg-[#0B0A2A]/95 px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-magenta-600/20 text-magenta-500">
        <Check className="h-5 w-5" />
      </div>

      {toast.image && (
        <img
          src={toast.image}
          alt={toast.itemName}
          className="h-12 w-10 object-cover rounded border border-white/10"
        />
      )}

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-magenta-500">
          {toast.message}
        </p>
        <p className="truncate text-sm text-[#F5F0EB] font-medium">
          {toast.itemName}
        </p>
      </div>

      <button
        onClick={openCart}
        className="text-xs uppercase tracking-wider text-[#F5F0EB] underline hover:text-magenta-500 transition-colors font-medium ml-2"
      >
        View
      </button>

      <button
        onClick={dismissToast}
        className="text-white/40 hover:text-white transition-colors p-1"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </aside>
  );
}

