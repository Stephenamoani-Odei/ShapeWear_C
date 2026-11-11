import { useState, useEffect } from 'react';
import { X, Check, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import CartIcon from '../ui/CartIcon';
import type { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { formatGHS } from '@/lib/money';
import { whatsappLink } from '@/lib/store-info';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addItem } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedFit, setSelectedFit] = useState<string>('');
  const [fitMissing, setFitMissing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (product) {
      setSelectedImage(0);
      setSelectedSize(product.sizes[0] || '');
      setSelectedFit(''); // shirts: the customer must choose, no default
      setFitMissing(false);
      setQuantity(1);
      setIsAdded(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (product.fits && !selectedFit) {
      setFitMissing(true);
      return;
    }
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images,
        selectedSize,
        ...(product.fits ? { selectedFit } : {}),
      },
      quantity
    );
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 900);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
      className="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-6 lg:p-10"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-navy-950/85 backdrop-blur-md transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden border border-white/10 bg-[#0E0E0E] shadow-[0_25px_70px_rgba(0,0,0,0.9)] lg:flex-row">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-navy-950/70 text-white/80 transition-all hover:bg-magenta-600 hover:text-white"
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Left: Gallery */}
        <div className="flex flex-1 flex-col bg-navy-950/50 p-6 lg:max-w-[50%]">
          <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover transition-all duration-500"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 bg-magenta-600 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white">
                {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative h-20 w-16 shrink-0 overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-magenta-600 scale-95' : 'border-white/10 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="flex flex-1 flex-col justify-between overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-[0.25em] text-magenta-500 font-semibold">
                {product.category}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs uppercase tracking-widest text-white/40">
                Ships from Accra
              </span>
            </div>

            <h2 className="mt-2 text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#F5F0EB]">
              {product.name}
            </h2>

            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-2xl font-bold text-[#F5F0EB]">
                {formatGHS(product.price)}
              </span>
              {product.originalPrice && (
                <span className="text-sm text-white/40 line-through">
                  {formatGHS(product.originalPrice)}
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-white/70">
              {product.description}
            </p>

            {/* Size selection */}
            <div className="mt-6">
              <div className="flex justify-between text-xs uppercase tracking-wider text-white/60 mb-2">
                <span>Select Size</span>
                <a
                  href={whatsappLink(`Hello ShapeWearFit, please help me choose a size for: ${product.name}`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-magenta-500 underline hover:text-magenta-400"
                >
                  Need help with sizing?
                </a>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-11 items-center justify-center border text-xs font-bold uppercase tracking-wider transition-all ${
                        isSelected
                          ? 'border-magenta-600 bg-magenta-600 text-white'
                          : 'border-white/15 text-white/80 hover:border-white/50 hover:text-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fit selection — long-sleeve shirts only */}
            {product.fits && (
              <div className="mt-6">
                <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-widest text-white/60">
                  <span>
                    Select Fit <span className="text-magenta-500">*</span>
                  </span>
                  {selectedFit && <span className="text-white/90 font-bold">{selectedFit}</span>}
                </div>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Fit">
                  {product.fits.map((fit) => {
                    const isSelected = selectedFit === fit;
                    return (
                      <button
                        key={fit}
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setSelectedFit(fit);
                          setFitMissing(false);
                        }}
                        className={`flex h-11 items-center justify-center border text-xs font-bold uppercase tracking-wider transition-all ${
                          isSelected
                            ? 'border-magenta-600 bg-magenta-600 text-white'
                            : fitMissing
                              ? 'border-red-500/70 text-white/80 hover:border-white/50'
                              : 'border-white/15 text-white/80 hover:border-white/50 hover:text-white'
                        }`}
                      >
                        {fit}
                      </button>
                    );
                  })}
                </div>
                {fitMissing && (
                  <p className="mt-2 text-xs text-red-400" role="alert">
                    Please choose Custom Fit or Slim Fit.
                  </p>
                )}
              </div>
            )}

            {/* Specifications list */}
            {product.details && product.details.length > 0 && (
              <div className="mt-6 border-t border-white/10 pt-4">
                <p className="text-xs uppercase tracking-widest text-white/40 font-semibold mb-2">
                  Key Specifications
                </p>
                <ul className="space-y-1.5 text-xs text-white/60">
                  {product.details.map((detail, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1 w-1 bg-magenta-500 rounded-full" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="flex items-center gap-3">
              {/* Quantity */}
              <div className="flex h-12 items-center border border-white/20">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 text-white/60 hover:text-white transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3.5 text-white/60 hover:text-white transition-colors"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className={`flex flex-1 h-12 items-center justify-center gap-2 px-6 text-xs font-bold uppercase tracking-widest text-white transition-all ${
                  isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-magenta-600 hover:bg-magenta-700 active:scale-[0.99]'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <CartIcon className="h-5 w-5" />
                    <span>Add to Bag — {formatGHS(product.price * quantity)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Badges */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/5 pt-4 text-center text-[10px] text-white/40">
              <div className="flex flex-col items-center gap-1">
                <Truck className="h-4 w-4 text-white/60" />
                <span>Delivery from Accra</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-white/60" />
                <span>Secure Paystack Payment</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="h-4 w-4 text-white/60" />
                <span>14-Day Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

