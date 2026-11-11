import { useState } from 'react';
import { Eye, Sparkles } from 'lucide-react';
import CartIcon from '../ui/CartIcon';
import type { Product } from '../../data/products';
import { formatGHS } from '@/lib/money';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images[0];
  const secondaryImage = product.images[1] || primaryImage;
  const sizeRange =
    product.sizes.length > 1 ? `${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}` : product.sizes[0];

  return (
    <div
      className="group relative flex flex-col bg-[#100E38] border border-white/10 transition-all duration-500 ease-out hover:border-magenta-600/70 hover:shadow-[0_15px_40px_rgba(184,21,95,0.22)] hover:-translate-y-1.5 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image Presentation ── */}
      <div
        onClick={() => onQuickView(product)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-navy-950 cursor-pointer"
      >
        <img
          src={primaryImage}
          alt={product.name}
          className={`h-full w-full object-cover transition-all duration-700 ease-out ${
            isHovered && secondaryImage !== primaryImage
              ? 'opacity-0 scale-110'
              : 'opacity-100 scale-100 group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {secondaryImage !== primaryImage && (
          <img
            src={secondaryImage}
            alt={`${product.name} alternate view`}
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
              isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
            }`}
            loading="lazy"
          />
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.badge && (
            <span className="inline-flex items-center gap-1.5 bg-magenta-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-[0_0_15px_rgba(184,21,95,0.6)]">
              <Sparkles className="h-3 w-3" />
              {product.badge}
            </span>
          )}
        </div>

        {/* Quick View overlay button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-x-4 bottom-14 flex items-center justify-center gap-2 border border-white/30 bg-navy-950/85 py-2.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md opacity-0 translate-y-3 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:border-magenta-600 hover:bg-navy-950 hover:text-magenta-400"
          aria-label={`Quick view ${product.name}`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Quick View</span>
        </button>

        {/* Choose size & add — opens the product so the customer picks their size */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onQuickView(product);
          }}
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 bg-magenta-600 opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 hover:bg-magenta-700 shadow-[0_0_20px_rgba(184,21,95,0.5)]"
          aria-label={`Choose a size for ${product.name}`}
        >
          <CartIcon className="h-4 w-4" />
          <span>Choose Size &amp; Add</span>
        </button>
      </div>

      {/* ── Product Info ── */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-magenta-500">
            {product.category}
          </span>

          <h3
            onClick={() => onQuickView(product)}
            className="mt-1 text-xs sm:text-sm font-bold uppercase tracking-wider text-[#F5F0EB] transition-colors duration-200 hover:text-magenta-500 cursor-pointer"
          >
            {product.name}
          </h3>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50 font-light">
            {product.description}
          </p>
        </div>

        {/* Price & sizes footer */}
        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-sm sm:text-base font-bold text-[#F5F0EB] font-mono">
              {formatGHS(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-white/40 line-through font-mono">
                {formatGHS(product.originalPrice)}
              </span>
            )}
          </div>

          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
            Sizes {sizeRange}
          </span>
        </div>
      </div>
    </div>
  );
}
